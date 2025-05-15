<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-sm text-gray-700 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 text-center">Device Setup Instructions</h2>
        
        <div class="text-center text-gray-600 text-sm mb-2">
          <p><strong>Detected Device:</strong> {{ deviceInfo.os }}</p>
          <p><strong>Browser:</strong> {{ deviceInfo.browser }}</p>
        </div>

        <ul class="list-disc space-y-2 pl-5">
          <li v-for="(line, i) in instructions" :key="i" v-html="line" />
        </ul>

        <button
          @click="$emit('dismiss')"
          class="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Continue to Verification
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Emit event to dismiss modal
const emit = defineEmits(['dismiss'])

// Modal visibility
const visible = ref(true)

// Instruction lines to show
const instructions = ref<string[]>([])

// Device and browser info
const deviceInfo = ref({
  os: 'Unknown',
  browser: 'Unknown',
  isPushSupported: false,
  isIphone13: false,
  isOppo: false,
})

// Detect user device and browser
function detectDevice() {
  const ua = navigator.userAgent.toLowerCase()

  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = ua.includes('android')
  const isIphone13 = ua.includes('iphone') && window.screen.height === 844 && window.screen.width === 390
  const isOppo = ua.includes('oppo')
  const isChrome = ua.includes('chrome') && !ua.includes('edg')
  const isSafari = ua.includes('safari') && !ua.includes('chrome')
  const isPushSupported = 'Notification' in window && 'serviceWorker' in navigator

  return {
    os: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other',
    browser: isChrome ? 'Chrome' : isSafari ? 'Safari' : 'Other',
    isPushSupported,
    isIphone13,
    isOppo,
  }
}

// Run on mount
onMounted(() => {
  // Only show modal on mobile or tablet
  const isMobileOrTablet = window.innerWidth <= 1024
  if (!isMobileOrTablet) {
    visible.value = false
    return
  }

  // Detect device
  deviceInfo.value = detectDevice()
  const { os, browser, isPushSupported, isIphone13, isOppo } = deviceInfo.value

  // If push notifications not supported
  if (!isPushSupported) {
    instructions.value.push(
      '<strong>Notifications are not supported</strong> on this browser or device.',
      'Please try using a modern browser like <strong>Chrome</strong> or <strong>Safari</strong> instead.'
    )
    return
  }

  // iOS-specific instructions
  if (os === 'iOS') {
    instructions.value.push(
      '1. Tap the <strong>Share icon (📤)</strong> at the bottom of Safari.',
      '2. Select <strong>"Add to Home Screen"</strong>.'
    )

    if (isIphone13) {
      instructions.value.push(
        '<strong>Note:</strong> iPhone 13 may not show "Add to Home Screen" immediately.',
        'Make sure you are using Safari and that screen zoom or content blockers are disabled.'
      )
    }
  }

  // Android-specific instructions
  if (os === 'Android') {
    if (isOppo) {
      instructions.value.push(
        '<strong>Oppo devices</strong> may block notifications by default.',
        '1. Go to <strong>Settings > App Management > Chrome > Notifications</strong> and enable them.',
        '2. Open <strong>Chrome > Settings > Site Settings > Notifications</strong> and allow them.'
      )
    } else if (browser === 'Chrome') {
      instructions.value.push(
        '1. Go to <strong>Settings > Notifications > Chrome</strong> and make sure notifications are allowed.',
        '2. In Chrome, tap the 3-dot menu (⋮), go to <strong>Settings > Site Settings > Notifications</strong>.',
        '3. Ensure <strong>"Sites can ask to send notifications"</strong> is enabled.'
      )
    }
  }

  // Fallback if no specific instructions were added
  if (instructions.value.length === 0) {
    instructions.value.push(
      'We could not detect your device. Please ensure notifications are enabled in your browser settings.'
    )
  }
})
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
