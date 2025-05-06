<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">

    <!-- ✅ Install Prompt Modal (only after verification) -->
    <transition name="fade">
      <div v-if="shouldShowInstallModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-80 text-center">

          <h3 class="text-xl font-semibold text-gray-800">Install Setlabotjha-PS App</h3>

          <!-- iOS Instructions -->
          <div v-if="isIos && !isInStandaloneMode">
            <p class="text-gray-600 text-sm">
              To install the app, tap the <strong>Share</strong> button <span class="text-lg">📤</span>
              and select <strong>"Add to Home Screen"</strong>.<br><br>
              This is necessary to receive important notifications.
            </p>

            <div class="mt-6">
              <button @click="alreadyInstalledClicked" class="text-sm text-blue-500 hover:underline focus:outline-none">
                Already Installed? Continue
              </button>
            </div>

            <div v-if="showAlreadyInstalledConfirm" class="mt-4 space-y-4">
              <p class="text-gray-600 text-sm">
                Are you sure you've added the app to your Home Screen? You may miss important notifications if not.
              </p>
              <div class="flex justify-center gap-4">
                <button @click="confirmAlreadyInstalled(true)"
                  class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded-lg">
                  Yes, continue
                </button>
                <button @click="confirmAlreadyInstalled(false)"
                  class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-4 rounded-lg">
                  No, take me back
                </button>
              </div>
            </div>
          </div>

          <!-- Android Prompt -->
          <div v-else>
            <p class="text-gray-600 text-sm">
              Please install the school app before proceeding.<br>
              Get notifications about meetings, early dismissals, etc.
            </p>
            <button @click="triggerInstall"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition mt-4">
              Install Now
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- Logo -->
    <img src="/logo.png" alt="School Logo" class="lg:h-52 h-36 mb-5 rounded-sm lg:rounded-2xl pl-2" />

    <!-- Verification Form -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-6">
      <h2 class="text-center text-2xl font-bold text-gray-700">Contact Verification</h2>
      <p class="text-center text-gray-600">Please enter your email and mobile number</p>

      <form @submit.prevent="verifyStakeholder" class="space-y-4">
        <input v-model="email" type="email" required placeholder="Enter your email address"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <input v-model="mobile" type="tel" required placeholder="Enter your mobile number"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <button type="submit" :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {{ loading ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <p v-if="message" class="text-center text-sm text-green-600">{{ message }}</p>
      <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp, useRuntimeConfig } from '#app'
import { deferredPrompt, installPromptAvailable, isAppInstalled } from '~/plugins/install-prompt.client'
import { usePwaInstallPrompt } from '~/composables/usePwaInstallPrompt'
import { getToken } from 'firebase/messaging'

definePageMeta({ layout: 'verification' })

const route = useRoute()
const router = useRouter()
const { $messaging } = useNuxtApp()
const config = useRuntimeConfig()

const email = ref('')
const mobile = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const isVerified = ref(false)
const manualDismiss = ref(false)
const showAlreadyInstalledConfirm = ref(false)

const stakeholderId = route.query.stakeholderId as string || ''
const { canInstall, promptInstall } = usePwaInstallPrompt()

const isIos = computed(() => {
  if (!process.client) return false
  const ua = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
})

const isInStandaloneMode = computed(() => {
  if (!process.client) return false
  return ('standalone' in window.navigator) && window.navigator.standalone
})

const shouldShowInstallModal = computed(() => {
  if (!process.client || !isVerified.value || manualDismiss.value) return false

  const alreadyInstalled = localStorage.getItem('isAppAdded') === 'true'

  if (isIos.value && !isInStandaloneMode.value && !alreadyInstalled) {
    return true
  }

  if (!isAppInstalled.value && installPromptAvailable.value) {
    return true
  }

  return false
})

function alreadyInstalledClicked() {
  showAlreadyInstalledConfirm.value = true
}

function confirmAlreadyInstalled(confirmed: boolean) {
  if (confirmed) {
    localStorage.setItem('isAppAdded', 'true')
    manualDismiss.value = true
  }
  showAlreadyInstalledConfirm.value = false
}

async function triggerInstall() {
  if (!process.client) return

  if (isIos.value && !isInStandaloneMode.value) {
    localStorage.setItem('isAppAdded', 'true')
  } else if (deferredPrompt.value) {
    const promptEvent = deferredPrompt.value as any
    promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice?.outcome === 'accepted') {
      isAppInstalled.value = true
      deferredPrompt.value = null
    }
  }
}


async function verifyStakeholder() {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    let fcmToken: string | undefined
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission()
    }

    try {
      fcmToken = await getToken($messaging, { vapidKey: config.public.VAPID_KEY })
    } catch (tokenErr) {
      console.warn('FCM token fetch failed:', tokenErr)
    }

    const result: any = await $fetch('/api/stakeholders/verify', {
      method: 'POST',
      body: {
        stakeholderId: route.query.sid,
        email: email.value,
        mobile: mobile.value,
        fcmToken
      }
    })

    if (!result.success || !result._id) {
      throw new Error(result.message || 'Verification failed')
    }

    localStorage.setItem('isStakeholder', 'true')
    localStorage.setItem('fcmToken', fcmToken!)

    isVerified.value = true
    message.value = 'You have been verified successfully.'
    manualDismiss.value = false

    if (canInstall.value) {
      const installChoice = await promptInstall()
      if (installChoice?.outcome === 'accepted') {
        console.log('PWA installed successfully')
      }
    }

    router.push('/')
  } catch (err: any) {
    error.value = err?.data?.message || err.message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>