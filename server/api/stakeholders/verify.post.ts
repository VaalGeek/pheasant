// /server/api/notifications/verify-stakeholder.ts

import { verify } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async (event) => {
 
  try {
    const body = await readBody(event);
   console.log(body)
    const result = await verify(body)
    return result
  } catch (error: any) {
    return sendError(event, createError({
      statusCode: 400,
      statusMessage: error.message || 'Failed to verify stakeholder'
    }))
  }
})
