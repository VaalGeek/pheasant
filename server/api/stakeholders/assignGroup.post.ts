// server/api/learners.post.ts
import { assignGroup } from '~/server/controllers/StakeholderController';


export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
      return await assignGroup(body)
  } catch (error:any) {
    throw createError({ statusCode: 400, message: error.message });
  }
});