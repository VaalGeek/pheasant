import { sendEmailOtp } from '~/server/utils/sendEmailOtp'
import { Stakeholder } from '~/server/models/Stakeholder'
import { updateFCMToken } from '~/server/controllers/StakeholderController'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

 
  const { otp, cell, fcmToken, role, email, deviceType } = await readBody(event)

  if (!otp || !cell || !role || !email) {
    return { success: false, message: 'Missing OTP, phone number, role, or email.' }
  }

  if (deviceType === 'android' && !fcmToken) {
    return { success: false, message: 'Missing FCM token for Android device.' }
  }

  const stakeholder = await Stakeholder.findOne({ role, cell })

  if (!stakeholder) {
    return { success: false, message: 'Invalid request: Stakeholder not found.' }
  }

  const now = new Date()

  

  const stringOtp = String(otp).trim()

  // ⛔ OTP is expired or doesn't match
  if (!stringOtp || !cell || !fcmToken || !email) {
    // ✅ Generate new OTP and send to email
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()

    stakeholder.otp = {
      value: newOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 min
    }

    await stakeholder.save()

    // Send email
    await sendEmailOtp(email, newOtp)

    return {
      success: false,
      message: 'Your OTP has expired or is invalid. A new OTP has been sent to your email.',
      otpExpired: true,
    }
  }



  // ✅ OTP is valid — continue
  try {
   if (fcmToken) {
      await updateFCMToken(cell, fcmToken, email)
    }
    stakeholder.otp = undefined
    await stakeholder.save()

    return { success: true, message: `OTP Verified successfully for a ${role}!` }
  } catch (error: any) {
    return {
      success: false,
      message: 'OTP verified but failed to update FCM token.',
      error: error.message,
    }
  }
})