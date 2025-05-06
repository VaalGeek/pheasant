import { AnnouncementsController } from '~/server/controllers/AnnouncementsController'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await AnnouncementsController.create(body)
})
