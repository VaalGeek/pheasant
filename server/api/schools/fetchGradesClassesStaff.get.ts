import { fetchGradesClassesStaff } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async (event) => {
  try {
    const { schoolId } = getQuery(event);
    if (!schoolId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Missing schoolId parameter'
      });
    }

    return await fetchGradesClassesStaff(schoolId.toString());
  } catch (error) {
    console.error('Error fetching grades/classes/staff:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch grades, classes, or staff'
    });
  }
});
