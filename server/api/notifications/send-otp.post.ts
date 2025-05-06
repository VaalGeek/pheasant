import * as crypto from 'crypto'
import { fetchByRole } from '~/server/controllers/StakeholderController'
import SMSController from '~/server/controllers/SMSController'
import { Stakeholder } from '~/server/models/Stakeholder'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const messages = []
  const stakeholders = await fetchByRole(body.target as string)

  for (const stakeholder of stakeholders) {
    const fullName = `${stakeholder.name} ${stakeholder.surname}`
    const primaryCell = stakeholder.cell[0]

    // ✅ Generate secure OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // ✅ Update OTP inside stakeholder record
    await Stakeholder.findByIdAndUpdate(stakeholder._id, {
      otp: {
        value: otp,
        expiresAt,
      },
    })

    const message = `Hi ${fullName} (${body.target}), please click on the School link below and enter this OTP for school verification.
Link: ${process.env.BASE_URL}/otp/${body.target}?cell=${primaryCell}
OTP: ${otp}`

    for (const number of stakeholder.cell) {
      try {
        const result = await SMSController.send({
          user: process.env.SMS_USER!,
          password: process.env.SMS_PASSWORD!,
          cell: number,
          msg: message,
        })
        messages.push({ to: number, stakeholder: fullName, status: 'sent', result })
      } catch (error) {
        messages.push({ to: number, stakeholder: fullName, status: 'failed', error })
      }
    }
  }

  return messages
})
