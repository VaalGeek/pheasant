import { getToken } from 'firebase/messaging'

export function useFCM() {
  const { $messaging } = useNuxtApp()
  const config = useRuntimeConfig()

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  const getFCMToken = async (): Promise<string | null> => {
    try {
      const token = await getToken($messaging, {
        vapidKey: config.public.VAPID_KEY,
      })
      return token
    } catch (err) {
      console.error('Error getting FCM token', err)
      return null
    }
  }

  return {
    requestNotificationPermission,
    getFCMToken,
  }
}
