import { ref } from 'vue'

export const deferredPrompt = ref<Event | null>(null)
export const installPromptAvailable = ref(false)
export const isAppInstalled = ref(false)

export default defineNuxtPlugin(() => {
  if (process.client) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      ;(window as any).deferredPrompt = e
      installPromptAvailable.value = true
      console.log('Global: Captured beforeinstallprompt event')
    })

    window.addEventListener('appinstalled', () => {
      console.log('Global: PWA was installed')
      isAppInstalled.value = true
    })

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      isAppInstalled.value = true
    }
  }
})
