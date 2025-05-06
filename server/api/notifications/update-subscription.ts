import { Stakeholder } from '~/server/models/Stakeholder'

export default defineEventHandler(async (event) => {
  const { email, role, cell, subscription } = await readBody(event)

  // Validate fields
  if (!email || !role || !cell || !subscription) {
    return { success: false, message: 'Missing data: email, role, cell, or subscription.' }
  }

  try {
    // Try to match Stakeholder with provided email, role, and matching cell in array
    const stakeholder = await Stakeholder.findOne({
      email,
      role,
      cell: { $in: [cell] }
    })

    if (!stakeholder) {
      return { success: false, message: 'No matching Stakeholder found.' }
    }

    // Update pushSubscription field
    stakeholder.pushSubscription = subscription
    await stakeholder.save()

    return { success: true, message: 'Subscription updated successfully.' }
  } catch (err: any) {
    console.error('Update error:', err)
    return {
      success: false,
      message: 'An error occurred while updating subscription.',
      error: err.message
    }
  }
})
