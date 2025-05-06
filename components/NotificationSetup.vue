<template>
    <div>
      <!-- Overlay Loader -->
      <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
  
      <!-- Notification Prompt -->
      <div
        v-if="showPrompt && !loading"
        class="fixed bottom-4 left-4 right-4 mx-auto max-w-md bg-white rounded-2xl shadow-lg p-4 border border-gray-200 z-[60]"
      >
        <!-- Icon and Title -->
        <div class="flex items-center gap-3 mb-3">
          <svg class="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Get School Notifications</h2>
        </div>
  
        <!-- Message -->
        <div class="text-gray-700 mb-4 text-sm leading-relaxed">
          <p class="mb-2 font-medium">Be the first to know about:</p>
          <ul class="space-y-2">
            <li class="flex items-start gap-2">
              <Icon name="bell" />
              <span class="font-semibold">Early Learner Release</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="calendar" />
              <span class="font-semibold">Parent Meetings</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mail" />
              <span class="font-semibold">School News Letters</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="announcement" />
              <span class="font-semibold">Events & Announcements</span>
            </li>
          </ul>
          <p class="mt-4">Show your child that you care — stay informed and involved.</p>
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-center gap-2 mt-3">
          <button
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            :disabled="loading"
            @click="enableNotifications"
          >
            Enable Notifications
          </button>
        </div>
      </div>
  
      <!-- ✅ Success Message -->
      <div
        v-if="confirmationVisible"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-md z-50 animate-fade-in-out"
      >
        ✅ You’ll now receive school notifications.
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useNuxtApp, useRuntimeConfig } from '#app'
  import { getToken } from 'firebase/messaging'
  
  const { storeToken } = useNotifications()
  const showPrompt = ref(false)
  const loading = ref(false)
  const confirmationVisible = ref(false)
  
  const config = useRuntimeConfig()
  const VAPID_KEY = config.public.VAPID_KEY as string
  
  const askPermission = async () => {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  const enableNotifications = async () => {
  const { $messaging } = useNuxtApp()

  if (Notification.permission === 'denied') {
    alert('You’ve blocked notifications. Please enable them manually in your browser settings to get alerts.')
    return
  }

  const granted = await askPermission()

  if (granted) {
    loading.value = true
    try {
      const token = await getToken($messaging, { vapidKey: VAPID_KEY })
      await storeToken(token)

      // ✅ Save flag to avoid showing prompt again
      localStorage.setItem('notificationsDismissed', 'true')

      showConfirmation()
    } catch (error) {
      console.error('🔥 Error getting FCM token:', error)
    } finally {
      loading.value = false
      showPrompt.value = false
    }
  } else {
    console.warn('🚫 User denied permission.')
  }
}

  
  const showConfirmation = () => {
    confirmationVisible.value = true
    setTimeout(() => (confirmationVisible.value = false), 4000)
  }
  
  onMounted(() => {

    const wasDismissed = localStorage.getItem('notificationsDismissed')
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
  
    // ✅ Always show prompt unless dismissed before
    if (process.client && isSupported && !wasDismissed) {
      setTimeout(() => (showPrompt.value = true), 1000)
    }
  })
  </script>
  
  <style scoped>
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    10%,
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(20px);
    }
  }
  
  .animate-fade-in-out {
    animation: fadeInOut 4s ease-in-out forwards;
  }
  </style>
  