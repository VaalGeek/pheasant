import { create } from '~/server/controllers/SchoolController'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // read the JSON body from the POST
  const body = await readBody(event)

  try {
    // call your controller which should insert into the database
    const school = await create(body)
    // return whatever your controller returns, or wrap in an envelope:
    return { success: true, school }
  } catch (err: any) {
    // bubble up a 400 with the controller's error message
    throw createError({
      statusCode: 400,
      message: err.message || 'Failed to register school'
    })
  }
})
