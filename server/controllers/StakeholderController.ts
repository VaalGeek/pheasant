import { Stakeholder } from '~/server/models/Stakeholder'
import mongoose from 'mongoose'

interface ParentData {
  name?: string
  surname?: string
  email?: string
  cell?: string
  grade?: string
  class?: string
}

interface LearnerData {
  firstName: string
  surname: string
  grade?: string
  class?: string
  email?: string
  cell?: string
}

export async function uploadStakeholders(entries: any[], schoolId: string) {
  const results: any[] = []

  for (const entry of entries) {
    try {
      // --------- Learner + Parents case ---------
      if (entry.learner) {
        const { learner, father, mother } = entry
        // basic validation
        if (!learner.firstName || !learner.surname) {
          throw new Error('Learner missing first name or surname')
        }

        // create learner
        const learnerDoc = await Stakeholder.create({
          role: 'Learner',
          groups: ['Learners'],
          name: learner.firstName,
          surname: learner.surname,
          ...(learner.grade && { grade: learner.grade }),
          ...(learner.class && { class: learner.class }),
          ...(learner.email && { email: learner.email }),
          cell: learner.cell ? [learner.cell] : [],
          schoolId: schoolId
        })

        // helper to create a parent
        const makeParent = async (
          data: {
            name?: string; surname?: string; email?: string; cell?: string, grade?: string
            class?: string
          },
          relation: 'Father' | 'Mother'
        ) => {
          if (!data.name && !data.email && !data.cell) return null
          return Stakeholder.create({
            role: 'Parent',
            groups: ['Parents'],
            name: data.name || relation,
            ...(data.surname && { surname: data.surname }),
            ...(data.email && { email: data.email }),
            ...(data.grade && { grade: data.grade }),
            ...(data.class && { class: data.class }),
            cell: data.cell ? [data.cell] : [],
            learnerRefs: [learnerDoc._id],
            relationship: relation.toLowerCase(),
            schoolId: schoolId
          })
        }

        // parallel parent creation
        const [fatherDoc, motherDoc] = await Promise.all([
          makeParent(father || {}, 'Father'),
          makeParent(mother || {}, 'Mother')
        ])

        const parentRefs = [
          ...(fatherDoc ? [fatherDoc._id] : []),
          ...(motherDoc ? [motherDoc._id] : [])
        ]

        if (parentRefs.length) {
          learnerDoc.parentRefs = parentRefs
          await learnerDoc.save()
        }

        results.push({ learner: learnerDoc.toObject(), parents: parentRefs })
        continue
      }

      // --------- Staff case (flat entry) ---------
      // expect entry.role === 'Staff' and top‑level fields
      if (entry.role === 'Staff') {
        const { groups, name, surname, email, cell, persalNo, idNo, jobTitle } = entry

        if (!name) throw new Error('Staff missing name')
        if (!Array.isArray(groups) || groups.length === 0) {
          throw new Error('Staff missing group(s)')
        }

        // ensure the groups are exactly the two you allow
        const allowed = ['Educators', 'PS Staff']
        if (!groups.every(g => allowed.includes(g))) {
          throw new Error(`Invalid staff group(s): ${groups.join(', ')}`)
        }

        const staffDoc = await Stakeholder.create({
          role: 'Staff',
          groups,
          name,
          ...(surname && { surname }),
          ...(email && { email }),
          ...(Array.isArray(cell) && cell.length > 0 && { cell }),
          // if you want to preserve those extra staff fields on your schema
          ...(persalNo && { persalNo }),
          ...(idNo && { idNo }),
          ...(jobTitle && { jobTitle }),
          schoolId: schoolId
        })

        results.push({ staff: staffDoc.toObject() })
        continue
      }

      // --------- Unrecognized entry ---------
      throw new Error('Entry must contain either `learner` or be a top‑level Staff object')
    } catch (err: any) {
      console.error('Failed to process entry:', err)
      results.push({ error: err.message, entry })
    }
  }

  return results
}


export async function fetchByRole(role: string,schoolId) {
  return await Stakeholder.find({
    role,
    schoolId,
    name: { $exists: true, $ne: '' },
    surname: { $exists: true, $ne: '' }
  })
}


export async function fetchTotalByGroup(group: string, schoolId: string) {
  const [messages, notifications] = await Promise.all([
    Stakeholder.countDocuments({
      schoolId,
      groups: group,
      cell: { $exists: true, $not: { $size: 0 } }, // has cell numbers
    }),
    Stakeholder.countDocuments({
      schoolId,
      groups: group,
      fcmToken: { $exists: true, $ne: '' }, // has FCM token
    }),
  ])

  return {
    messages,
    notifications,
  }
}


export async function fetchAllByRole(role: string) {
  return await Stakeholder.find({ role: role })
}


export async function updateFCMToken(cell: string, token: string, email: string) {
  try {
    const stakeholder = await Stakeholder.findOneAndUpdate(
      {
        email,
        cell: { $in: [cell] }
      },
      {
        $set: {
          fcmToken: token,
          updatedAt: new Date()
        }
      },
      { new: true } // Return the updated document
    )

    if (!stakeholder) {
      return { success: false, message: 'Stakeholder not found' }
    }

    return { success: true, message: 'FCM token updated successfully', stakeholder }

  } catch (error) {
    console.error('Error updating FCM token:', error)
    return { success: false, message: 'Internal server error' }
  }
}

export async function fetchGradesClassesStaff(schoolId: string) {
  const stakeholders = await Stakeholder.find({ schoolId }, {
    grade: 1,
    class: 1,
    role: 1,
    groups: 1
  }).lean()

  const gradesSet = new Set<string>()
  const classesSet = new Set<string>()
  const staffGroupsSet = new Set<string>()

  for (const stakeholder of stakeholders) {
    if (stakeholder.grade) gradesSet.add(stakeholder.grade)
    if (stakeholder.class) classesSet.add(stakeholder.class)

    if (stakeholder.role === 'Staff' && Array.isArray(stakeholder.groups)) {
      stakeholder.groups.forEach(group => staffGroupsSet.add(group))
    }
  }

  return {
    grades: Array.from(gradesSet).sort((a, b) => Number(a) - Number(b)),
    classes: Array.from(classesSet).sort(),
    staffGroups: Array.from(staffGroupsSet).sort()
  }
}

export async function verify({
  stakeholderId,
  email,
  mobile,
  fcmToken
}: {
  stakeholderId?: string
  email?: string
  mobile?: string
  fcmToken?: string
}) {
  if (!stakeholderId) {
    throw new Error('stakeholderId is required')
  }

  const stakeholder = await Stakeholder.findById(stakeholderId)
  if (!stakeholder) {
    throw new Error('Stakeholder not found')
  }

  const normalizedEmail = email?.toLowerCase().trim()
  const trimmedMobile = mobile?.trim()

  // Case 1: First-time verification (no fcmToken yet in DB)
  if (!stakeholder.fcmToken) {
    stakeholder.verified = true
    stakeholder.fcmToken = fcmToken
    
    // Optional: store email/mobile only if not already set
    if (normalizedEmail && !stakeholder.email) {
      stakeholder.email = normalizedEmail
    }

    if (trimmedMobile && (!stakeholder.cell || stakeholder.cell.length === 0)) {
      stakeholder.cell = [trimmedMobile]
    }

    // Save without requiring input token
    await stakeholder.save()

    return {
      success: true,
      _id: stakeholder._id,
      firstTime: true,
      message: 'Stakeholder verified (token can be registered later)'
    }
  }

  // Case 2: Subsequent verification — validate and update token if necessary
  if (!normalizedEmail || !trimmedMobile || !fcmToken) {
    throw new Error('email, mobile, and fcmToken are required for token update')
  }

  if (stakeholder.verified !== true) {
    throw new Error('Stakeholder has not completed first-time verification')
  }

  const emailMatches = stakeholder.email === normalizedEmail
  const mobileMatches = stakeholder.cell?.includes(trimmedMobile)

  if (!emailMatches || !mobileMatches) {
    throw new Error('Email or mobile does not match existing record')
  }

  stakeholder.fcmToken = fcmToken
  await stakeholder.save()

  return {
    success: true,
    _id: stakeholder._id,
    firstTime: false,
    message: 'Verified successfully'
  }
}






export async function findStakeholderByFCM(token: string) {
  return Stakeholder.findOne({ fcmToken: token }) // Correct field name
}

export async function updateVerification({ _id, fcmToken }: { _id: string, fcmToken: string }) {
  if (!_id || !fcmToken) {
    throw new Error('Missing stakeholder ID or FCM token')
  }

  const updated: any = await Stakeholder.findByIdAndUpdate(
    _id,
    {
      $set: {
        fcmToken,
        isVerified: true
      }
    },
    { new: true }
  ).lean()

  if (!updated) {
    throw new Error('Stakeholder not found or update failed')
  }

  return {
    success: true,
    _id: updated._id,
    message: 'Stakeholder updated successfully'
  }
}

export async function fetchUnsubscribers() {
  // Base query for unsubscribed users with valid cell array
  const baseQuery = {
    verified: false,
    $or: [{ fcmToken: '' }, { fcmToken: null }]
  };

  const parents = await Stakeholder.find({
    role: 'Parent',
    ...baseQuery
  }).lean();

  const learners = await Stakeholder.find({
    role: 'Learner',
    ...baseQuery
  }).lean();

  const staff = await Stakeholder.find({
    role: 'Staff',
    ...baseQuery
  }).lean();

  return { parents, learners, staff };
}



export async function fetchByCell(cell: string) {
  if (!cell) throw new Error('Cell number is required')

  // Find a stakeholder where the `cell` array contains the given number
  const stakeholder = await Stakeholder.findOne({ cell })
  return stakeholder
}


export async function updatePushSubscription(cell: string, subscription: any, email: string) {
  if (!cell || !subscription) throw new Error('Cell number and subscription are required')

  const updated = await Stakeholder.findOneAndUpdate(
    { cell },
    { pushSubscription: subscription, email: email },
    { new: true }
  )

  return updated
}




export async function assignGroup(stakeholders: any) {
  try {


    const operations = stakeholders
      .filter((s: any) => s._id && Array.isArray(s.groups))
      .map((s: any) => ({
        updateOne: {
          filter: { _id: s._id },
          update: { $set: { groups: s.groups } },
        },
      }))

    if (operations.length === 0) {
      return { success: false, message: 'No valid update operations.' }
    }

    const result = await Stakeholder.bulkWrite(operations)

    return {
      success: true,
      message: 'Groups updated successfully.',
      modifiedCount: result.modifiedCount,
    }
  } catch (error: any) {
    console.error('[updateGroups] Error:', error)
    return {
      success: false,
      message: 'Failed to update stakeholder groups.',
      error: error.message,
    }
  }
}

