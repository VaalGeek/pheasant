import { Stakeholder } from "~/server/models/Stakeholder"

export default defineEventHandler(async (event) => {
    const { email, role, cell, fcmToken, deviceType } = await readBody(event)
    if (!email || !role || !cell || !fcmToken) {
      return { success: false, message: 'Missing data in token-registration.' }
    }
    // update the record
    await Stakeholder.updateOne(
      { email, role, cell },
      { $set: { fcmToken, deviceType: 'ios-pwa' } }
    )
    return { success: true }
  })
  