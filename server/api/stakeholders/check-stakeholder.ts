import { checkStakeholder } from '~/server/controllers/StakeholderController'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const result = await checkStakeholder(body)

    return result
  } catch (error) {
    console.error('Error checking stakeholder:', error)
    return {
      valid: false,
      message: 'An error occurred while checking stakeholder'
    }
  }
})
