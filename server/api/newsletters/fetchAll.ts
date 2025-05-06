// server/api/newsletters/fetchAll.ts
import { fetchAll } from '~/server/controllers/NewsletterController'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { schoolId } = getQuery(event)

  if (!schoolId || typeof schoolId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid schoolId',
    })
  }

  return await fetchAll(schoolId)
})
