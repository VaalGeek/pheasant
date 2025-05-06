// server/api/newsletters/create.ts
import { create } from '~/server/controllers/NewsletterController'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = await create(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: result.message })
  }

  return result
})
