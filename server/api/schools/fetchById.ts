import { fetchById } from "~/server/controllers/SchoolController";
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
  
      const school = await fetchById(schoolId.toString());
      const gradesClassesStaff = await fetchGradesClassesStaff(schoolId.toString());

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
  
