// composables/usePwaInstallPrompt.ts

import { ref } from 'vue'

const deferredPrompt = ref<Event | null>(null)

export function usePwaInstallPrompt() {
  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
    })
  })

  const promptInstall = async () => {
    if (deferredPrompt.value) {
      const promptEvent = deferredPrompt.value as any
      promptEvent.prompt()
      const result = await promptEvent.userChoice
      deferredPrompt.value = null
      return result
    }
    return null
  }

  return {
    canInstall: computed(() => !!deferredPrompt.value),
    promptInstall,
  }
}
