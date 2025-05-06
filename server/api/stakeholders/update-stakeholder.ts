// /server/api/notifications/update-stakeholder.ts

import { updateVerification } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async (event) => {


  try {
    const body = await readBody(event)
    const result = await updateVerification(body)
    return result
  } catch (error: any) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: error.message || 'Failed to update stakeholder'
    }))
  }
})
