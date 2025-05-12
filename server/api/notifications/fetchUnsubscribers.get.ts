import { fetchUnsubscribers } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async (event) => {
  const {schoolId } = getQuery(event);
  try {
    return await fetchUnsubscribers(schoolId?.toString()!);
  } catch (error) {
    console.error('Error fetching unsubscribers:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch unsubscribers'
    });
  }
});