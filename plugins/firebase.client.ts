import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.FIREBASE_apiKey,
    authDomain: config.public.FIREBASE_authDomain,
    projectId: config.public.FIREBASE_projectId,
    storageBucket: config.public.FIREBASE_storageBucket,
    messagingSenderId: config.public.FIREBASE_messagingSenderId,
    appId: config.public.FIREBASE_appId,
    measurementId: config.public.FIREBASE_measurementId,
  }

  const app = initializeApp(firebaseConfig)
  const messaging = getMessaging(app)

  return {
    provide: {
      messaging,
      onMessage,
    }
  }
})
