// utils/sendNotification.ts
import admin from './firebase'

export async function sendPushNotification(tokens: string[], payload: admin.messaging.MessagingPayload) {
  if (!tokens.length) return

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: payload.notification,
    data: payload.data,
  })

  console.log('Push Notification Response:', JSON.stringify(response))
}
