// /server/api/storyblok/webhook.js
import { defineEventHandler, readBody } from 'h3'
import admin from 'firebase-admin'



// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_projectId,
      privateKey: process.env.FIREBASE_privateKey,
      clientEmail: process.env.FIREBASE_clientEmail,
    }),
  });


}

export default defineEventHandler(async (event) => {



  // ✅ Validate method
  if (event.node.req.method !== 'POST') {
    return createResponse(405, 'Method not allowed')
  }

  const body = await readBody(event);
  console.log(body)

  // ✅ Basic validation
  if (body.action !== 'published' || !body.story) {
    return createResponse(200, 'Ignored non-publish webhook')
  }

  const { content, slug } = body.story
  const component = content.component
  const title = content.title || body.story.name
  const description = content.description || 'Tap to learn more'

  // ✅ Only trigger if it's a calendar item
  if (component !== 'calendar') {
    return createResponse(200, 'Not a calendar item. Skipped.')
  }

  const tokens = null

  if (!tokens.length) {
    return createResponse(200, 'No tokens to send')
  }

  // ✅ Construct FCM message
  const message = {
    notification: {
      title: `📅 ${title}`,
      body: description,
    },
    data: {
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      slug,
      type: 'calendar',
    },
    tokens,
  }

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(response);
    return {
      status: 200,
      sent: response.successCount,
      failed: response.failureCount,
      message: 'Push notification processed',
    }
  } catch (error) {
    console.error('🔥 FCM Error:', error)
    return createResponse(500, 'Failed to send notifications')
  }
})

// 👇 Helper functions
function createResponse(status, message) {
  return { status, message }
}


