
import {  fetchTotalByGroup } from '~/server/controllers/StakeholderController';


export default defineEventHandler(async (event) => {
  const {group,schoolId } = getQuery(event);

  try {
      return fetchTotalByGroup(group?.toString()!,schoolId?.toString()!)
  } catch (error:any) {
    throw createError({ statusCode: 400, message: error.message });
  }
});