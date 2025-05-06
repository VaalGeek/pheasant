import { fetchUnsubscribers } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async () => {
  try {
    return await fetchUnsubscribers();
  } catch (error) {
    console.error('Error fetching unsubscribers:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch unsubscribers'
    });
  }
});