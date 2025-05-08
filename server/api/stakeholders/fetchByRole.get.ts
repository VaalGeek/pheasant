
import { fetchByRole } from '~/server/controllers/StakeholderController';


export default defineEventHandler(async (event) => {
  const {role,schoolId } = getQuery(event);

  try {
      return fetchByRole(role?.toString()!,schoolId?.toString()!)
  } catch (error:any) {
    throw createError({ statusCode: 400, message: error.message });
  }
});