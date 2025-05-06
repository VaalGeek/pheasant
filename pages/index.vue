<template>
  <div>
    <Hero />
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4 text-center">User Verificartions</h2>

        <form @submit.prevent="resubmitSubscription" class="space-y-4">
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

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePushManager } from '~/composables/usePushManager'

const showModal = ref(false)
const manualEmail = ref('')
const manualCell = ref('')
const manualRole = ref('')
const formError = ref('')
const loading = ref(false)
onMounted(() => {


  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
  const email = localStorage.getItem('email')
  const cell = localStorage.getItem('cell')
  const role = localStorage.getItem('role')

  // Show modal only on iOS and if any of the credentials are missing
  if (isIos && (!email || !cell || !role)) {
    showModal.value = true
  }


})


const resubmitSubscription = async () => {

  formError.value = ''
  loading.value = true

  try {

    manualCell.value = manualCell.value.replace(/o/gi, '0');
    const verifyResponse = await fetch('/api/stakeholders/verify-stakeholder', {
      method: 'POST',
      body: JSON.stringify({
        email: manualEmail.value,
        cell: manualCell.value,
        role: manualRole.value
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const verifyResult = await verifyResponse.json()
    if (!verifyResult.valid) {
      formError.value = 'Please provide correct contact details and role'
      return
    }

    const subscription = await usePushManager()
    if (!subscription) {
      formError.value = 'Unable to generate subscription. Make sure notifications are enabled.'
      return
    }

    const response = await fetch('/api/notifications/update-subscription', {
      method: 'POST',
      body: JSON.stringify({
        email: manualEmail.value,
        cell: manualCell.value,
        role: manualRole.value,
        subscription
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await response.json()

    if (result.success) {
      localStorage.setItem('email', manualEmail.value)
      localStorage.setItem('cell', manualCell.value)
      localStorage.setItem('role', manualRole.value)
      showModal.value = false
      console.log('Push subscription registered successfully')
    } else {
      formError.value = result.message || 'Failed to register subscription'
    }
  } catch (err) {
    console.error('Subscription registration failed:', err)
    formError.value = 'An error occurred while registering subscription.'
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
