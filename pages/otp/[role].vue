<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">

    <!-- Install Prompt Modal -->
    <!-- Install Prompt Modal -->
    <transition name="fade">
      <div v-if="shouldShowInstallModal" class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-80 text-center">

          <h3 class="text-xl font-semibold text-gray-800">Install Setlabotjha-PS App</h3>

          <!-- iOS Users -->
          <div v-if="isIos && !isInStandaloneMode">

            <p class="text-gray-600 text-sm">
              To install the app, tap the <strong>Share</strong> button <span class="text-lg">📤</span>
              and select <strong>"Add to Home Screen"</strong>.<br><br>
              This is necessary to receive important notifications.
            </p>

            <!-- iOS: Already Installed Option -->
            <div class="mt-6">
              <button @click="alreadyInstalledClicked" class="text-sm text-blue-500 hover:underline focus:outline-none">
                Already Installed? Continue
              </button>
            </div>

            <!-- Confirmation (only shown after clicking "Already Installed?") -->
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

          <!-- Android Users -->
          <div v-else>
            <p class="text-gray-600 text-sm">
              Please install the school app before proceeding with verification.<br>
              To receive notifications such as Parents Meetings, Newsletters, Early Learners Release, etc.
            </p>

            <button @click="triggerInstall"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition mt-4">
              Install Now
            </button>
          </div>

        </div>
      </div>
    </transition>




    <!-- OTP Verification Form -->
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-6"
      :class="{ 'opacity-50 pointer-events-none': !isAppInstalled && deferredPrompt }">

      <!-- Title -->
      <h2 class="text-center text-2xl font-bold text-gray-700">
        School {{ paramRole }} Verification
      </h2>

      <!-- Description -->
      <p class="text-center text-gray-600">
        Please enter your email and the One-Time Password (OTP) you received via SMS.
      </p>

      <!-- Verification Form -->
      <form @submit.prevent="submitOtp" class="space-y-4">

        <!-- Email Input -->
        <input v-model="email" type="email" placeholder="Enter your email address"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <!-- OTP Input -->
        <input v-model="otp" type="text" maxlength="6" placeholder="Enter OTP"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />

        <!-- Submit Button -->
        <button :disabled="loading" type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Verifying...' : 'Verify' }}
        </button>
      </form>

      <!-- Messages -->
      <p v-if="message" class="text-center text-sm text-green-600">{{ message }}</p>
      <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>

    </div>
  </div>
</template>

<script setup lang="ts">

import { deferredPrompt, installPromptAvailable, isAppInstalled } from '~/plugins/install-prompt.client'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getToken } from 'firebase/messaging'
import { useNuxtApp, useRuntimeConfig } from '#app'


definePageMeta({
  layout: 'notifications',
})


const isIos = computed(() => {
  if (!process.client) return false  // Make sure this is only executed on the client side
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
})

const isInStandaloneMode = computed(() => {
  if (!process.client) return false  // Ensure this is client-side only
  return ('standalone' in window.navigator) && (window.navigator.standalone)
})

const showAlreadyInstalledConfirm = ref(false)
const manualDismiss = ref(false)

const alreadyInstalledClicked = () => {
  showAlreadyInstalledConfirm.value = true
}

const confirmAlreadyInstalled = (confirmed: boolean) => {
  if (confirmed) {
    localStorage.setItem('isAppAdded', 'true');
    manualDismiss.value = true;
    console.log('App marked as added manually');
  }
  showAlreadyInstalledConfirm.value = false;
}








const route = useRoute()
const paramRole = route.params.role as string

// Normalize cell from query
const cell = Array.isArray(route.query.cell)
  ? route.query.cell[0]
  : route.query.cell || ''

const otp = ref('')
const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

const config = useRuntimeConfig()


const shouldShowInstallModal = computed(() => {
  if (!process.client) return false;
  if (manualDismiss.value) return false;
  const hasAppBeenAdded = localStorage.getItem('isAppAdded') === 'true';
  if (isIos.value && !isInStandaloneMode.value && !hasAppBeenAdded) {
    return true;
  }
  if (!isAppInstalled.value && installPromptAvailable.value) {
    return true;
  }
  return false;
});

const deviceType = computed(() => {
  if (isIos.value) {
    // first Safari visit will be ios-safari; once in PWA it becomes ios-pwa
    return isInStandaloneMode.value ? 'ios-pwa' : 'ios-safari'
  }
  return 'android'
})

const triggerInstall = async () => {
  if (!process.client) return; // Ensure this is client-side only

  // Handle iOS installation flow
  if (isIos.value && !isInStandaloneMode.value) {
    // Mark app as added to home screen after installation instructions
    localStorage.setItem('isAppAdded', 'true');
    console.log('User can add app to home screen now');
  } else {
    // Handle Android installation prompt flow
    if (deferredPrompt.value) {
      const promptEvent = deferredPrompt.value as any;
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        isAppInstalled.value = true;
        deferredPrompt.value = null;
       
      } else {
        console.log('User dismissed the install prompt');
      }
    } else {
      console.log('No install prompt available');
    }
  }
};

const checkNotificationPermission = async () => {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Notification permission request failed:', error);
      }
    }
  }
};


const submitOtp = async () => {
  error.value = ''
  message.value = ''
  loading.value = true

  try {
    const { $messaging } = useNuxtApp()
    let fcmToken: string | undefined

    // Only try to get the FCM token if Notifications are supported (on PWA or Android)
    if ('Notification' in window) {
      try {
        // Attempt to get the push token for notifications (only on valid platforms)
        fcmToken = await getToken($messaging, { vapidKey: config.public.VAPID_KEY })
      } catch (pushErr) {
        console.warn('FCM token error:', pushErr)
      }
    } else {
      // If Notifications aren't supported (in Safari), skip the token
      console.warn('Push notifications are not supported in Safari or this device.')
    }

    // Build request payload
    const body: Record<string, any> = {
      otp: otp.value,
      cell,
      role: paramRole,
      email: email.value,
      deviceType: deviceType.value
    }

    // Add the FCM token to the payload if it's available
    if (fcmToken) {
      body.fcmToken = fcmToken
    }

    const res: any = await $fetch('/api/notifications/verify-otp', {
      method: 'POST',
      body
    })

    if (res.success) {
      checkNotificationPermission();
      message.value = res.message || 'OTP verified successfully.'
    } else {
      error.value = res.message || 'Verification failed.'
    }
  } catch (err: any) {
    error.value = 'An error occurred: ' + (err?.data?.message || err.message || 'Unknown error')
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