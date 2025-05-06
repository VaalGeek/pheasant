import { defineEventHandler, readBody, createError } from 'h3'
import { sendPushNotification } from '~/utils/notifications'
import { Stakeholder } from '~/server/models/Stakeholder'


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const { title, description, grades, schoolId, newsletterId } = body

    // Validate input
    if (!title || !description || !grades || !schoolId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload',
        data: {
          requirements: {
            title: 'required',
            description: 'required',
            grades: 'required',
            schoolId: 'required',
            newsletterId:'required'
          },
        },
      })
    }



    // Prepare FCM query conditions
    const query: Record<string, any> = { schoolId }

    if (!(grades.length === 1 && grades[0] === 'All')) {
      query.grade = { $in: grades }
    }

    const stakeholders = await Stakeholder.find(query, {
      fcmToken: 1,
      _id: 0,
    }).lean()

    const fcmTokens = stakeholders
      .map((s) => s.fcmToken?.trim())
      .filter(Boolean)

    const notificationPayload = {
      notification: {
        title: title.trim(),
        body: description.trim(),
      },
      data: {
        title: title.trim(),
        body: description.trim(),
        icon: '/icon.png',
        badge: '/icon.png',
        click_action: `${process.env.BASE_URL}/newsletters?nid=${newsletterId}`,
      },
    }

    if (fcmTokens.length > 0) {
      await sendPushNotification(fcmTokens, notificationPayload)
    }

    return {
      success: true,
      message: 'Notifications sent successfully',
      newsletterId: newsletterId,
      results: {
        fcm: fcmTokens.length,
      },
    }
  } catch (error: any) {
    console.error('FCM sending error:', error)

    if (error?.name === 'MongoError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database error',
        data: {
          code: error.code,
          message: error.message,
        },
      })
    }

    if (error?.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      data: {
        originalError: error.message,
      },
    })
  }
})
