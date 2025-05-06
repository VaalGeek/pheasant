import { findStakeholderByFCM } from "~/server/controllers/StakeholderController"

// server/api/notifications/check-fcm.post.ts

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { token } = body
  
    if (!token) return { stakeholderId: null }
  
 
    const stakeholder = await findStakeholderByFCM(token) 
  
    if (!stakeholder) {
      return { stakeholderId: null }
    }
  
    return {
      stakeholderId: stakeholder._id,
      role: stakeholder.role,
      name: stakeholder.name,
    }
  })
  