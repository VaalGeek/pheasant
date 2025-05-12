<template>
  <div>
    <Hero />
    <div v-if="showIosModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-60">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4 text-center">iOS User Verificartions</h2>

        <form @submit.prevent="reverify" class="space-y-4">
          <input v-model="manualEmail" :disabled="loading" type="email" placeholder="Email"
            class="w-full p-2 border rounded-lg" required />
          <input v-model="manualCell" type="tel" pattern="[0-9]*" inputmode="numeric" maxlength="10"
            placeholder="Cell number" class="w-full p-2 border rounded-lg" required />

          <select v-model="manualRole" :disabled="loading" required class="w-full p-2 border rounded-lg">
            <option disabled value="">Select Role</option>
            <option value="Parent">Parent</option>
            <option value="Learner">Learner</option>
            <option value="Staff">Staff</option>
          </select>

          <div class="flex justify-end gap-3 pt-2">

            <button type="submit" :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <span v-if="loading"
                class="loader border-white border-t-transparent rounded-full w-4 h-4 border-2 animate-spin"></span>
              <span v-if="!loading">Submit</span>
              <span v-else>Submitting...</span>
            </button>
          </div>
        </form>

        <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
        <p v-if="message" class="text-sm text-green-600 text-center mt-2">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'


const showIosModal = ref(false)
const manualEmail = ref('')
const manualCell = ref('')
const manualRole = ref('')
const formError = ref('')
const loading = ref(false);
const message = ref('')
onMounted(() => {

  //showIosModal.value = true;

  /// Step 1: Detect if the user is on an iOS device
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())

  // Step 2: Check if the app is running in standalone (PWA) mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

  const email = localStorage.getItem('email')
  const cell = localStorage.getItem('cell')
  const role = localStorage.getItem('role')

  // Step 3: Show modal only on iOS PWA and if any contact credentials are missing
  if (isIos && isStandalone && (!email || !cell || !role)) {
    showIosModal.value = true
  }


})


const reverify = async () => {
  formError.value = ''
  loading.value = true
  const isVerified = ref(false)
 

  try {
    manualCell.value = manualCell.value.replace(/o/gi, '0')

    // Step 1: Check stakeholder existence
    const checkStakeholder: any = await $fetch('/api/stakeholders/check-stakeholder', {
      method: 'POST',
      body: {
        email: manualEmail.value,
        cell: manualCell.value,
        role: manualRole.value
      }
    })

    if (!checkStakeholder.valid) {
     
      formError.value = 'Please provide correct contact details and role'
      return
    }

    const { requestNotificationPermission, getFCMToken } = useFCM()
    const permission = await requestNotificationPermission()

    if (permission !== 'granted') {
      formError.value = 'Please allow notification permission to continue.'
      return
    }

    const fcmToken = await getFCMToken()
    if (!fcmToken) {
      formError.value = 'Unable to generate notification token.'
      return
    }

    const payload = {
      stakeholderId: checkStakeholder._id,
      email: manualEmail.value,
      cell: manualCell.value,
      role: manualRole.value,
      fcmToken
    }

    const response = await $fetch('/api/stakeholders/verify', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.success) {
      localStorage.setItem('isStakeholder', 'true')
      localStorage.setItem('fcmToken', fcmToken)
      localStorage.setItem('email', manualEmail.value)
      localStorage.setItem('cell', manualCell.value)
      localStorage.setItem('role', manualRole.value)

      isVerified.value = true
      message.value = 'You have been verified successfully.'
     
      // Wait 2 seconds before hiding the modal
      setTimeout(() => {
        showIosModal.value = false
      
      }, 5000)
    } else {
      formError.value = response.message || 'Verification failed.'
    }
  } catch (err: any) {
    console.error('Verification error:', err)
    formError.value =
      err?.response?._data?.message || // Nuxt FetchError structured
      err?.data?.message ||            // Other structured error
      err.message ||                   // Fallback to native
      'An unexpected error occurred during verification.'
  } finally {
    loading.value = false
  }
}


</script>
<style scoped>
.loader {
  border-style: solid;
}
</style>
