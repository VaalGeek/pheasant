import { getQuery } from 'h3'
import { AnnouncementsController } from '~/server/controllers/AnnouncementsController'

export default defineEventHandler(async (event) => {
  const { schoolId } = getQuery(event)

  if (!schoolId || typeof schoolId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid schoolId',
    })
  }

  return await AnnouncementsController.fetchAll(schoolId)
})
