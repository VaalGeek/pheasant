

import { FCMToken } from "~/server/models/FCMToken";
import Event from "~/server/models/Event";
import { sendPushNotification } from "~/utils/notifications";
import { z } from 'zod'
import { format } from 'date-fns'


// 1. Define a Zod schema for validation
const EventSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(), // validate as string, convert later
    type: z.string()
  })

export default defineEventHandler(async (event) => {

  const body = await readBody(event);

  try {
   
    const newEvent = await Event.create(body);
    const tokens = await fetchFCMTokens();


     // Prepare the notification payload
     const payload = {
        notification: {
          title: '📅 ' + String(newEvent.title),
          body: String(newEvent.description),
        },
        data: {
          eventId: String(newEvent._id),
          title:String(newEvent.title),
          date:String(newEvent.date),
        },
      }
  
      await sendPushNotification(tokens, payload)
  
    
    return { success: true };
  } catch(error:any) {
    console.log(JSON.stringify(error))
    return { success: false };
  }
});

async function fetchFCMTokens() {
  try {
    const tokens = await FCMToken.find({
      'notificationPreferences.eventReminders': true,
    }).select('token -_id') // Only return token field

    return tokens.map(t => t.token)
  } catch (error) {
    console.error('❌ Failed to fetch FCM tokens:', error)
    return []
  }
}