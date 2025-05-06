import { fetchByUserId } from "~/server/controllers/SchoolController";
import { fetchGradesClassesStaff } from "~/server/controllers/StakeholderController"

export default defineEventHandler(async (event) => {
    try {
      const { userId } = getQuery(event);
      if (!userId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Missing schoolId parameter'
        });
      }
  
      const school = await fetchByUserId(userId.toString());
      const gradesClassesStaff = await fetchGradesClassesStaff(school._id.toString());

      // Attach the fetched grades, classes, and staff groups to the school object
      const schoolObj = school.toObject();
      schoolObj.grades = gradesClassesStaff.grades;
      schoolObj.classes = gradesClassesStaff.classes;
      schoolObj.staffGroups = gradesClassesStaff.staffGroups;
      
 
      return schoolObj;
      
    } catch (error) {
      console.error('Error fetching school details:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to fetch school details'
      });
    }
  });
  
