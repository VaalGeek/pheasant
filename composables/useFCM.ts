// composables/useFCM.ts
import { getToken } from 'firebase/messaging'

export function useFCM() {
  const { $messaging } = useNuxtApp()
  const config = useRuntimeConfig()

  const getFCMToken = async (): Promise<string | null> => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Notification permission denied')
        return null
      }

      const token = await getToken($messaging, {
        vapidKey: config.public.VAPID_KEY,
      })

      return token
    } catch (err) {
      console.error('Error getting FCM token', err)
      return null
    }
  }

  return { getFCMToken }
}
