

import { FCMToken } from "~/server/models/FCMToken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Validate input
  if (!body.browserId || !body.token) {
    throw createError({ statusCode: 400, message: 'Invalid payload' });
  }


  
  try {
   
    
    await FCMToken.updateOne(
      { browserId: body.browserId },
      {
        $set: { 
          token: body.token,
          lastUpdated: new Date(),
          fingerprint: body.fingerprint
        },
        $setOnInsert: {
          created: new Date()
        }
      },
      { upsert: true }
    );
    
    return { success: true };
  } catch(error:any) {
    console.log(error)
    return { success: false };
  }
});