<template>
  <form @submit.prevent="registerSchool" class="space-y-4 flex flex-col mt-5 max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold text-center">Register School</h2>

    <input v-model="form.name" type="text" placeholder="School Name" class="input" required />
    <input v-model="form.emis" type="text" placeholder="EMIS Number" class="input" required />

    <select v-model="form.type" class="input" required>
      <option disabled value="">Select School Type</option>
      <option>Primary</option>
      <option>Secondary</option>
      <option>Combined</option>
    </select>

      <!-- Email Input -->
    <input v-model="form.email" type="email" placeholder="Email" class="input" required />
   
  

    <!-- Phone Input -->
    <input v-model="form.phone" type="tel" placeholder="Phone Number" class="input" required />

    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
      Register
    </button>

    <p v-if="message" :class="messageColor">{{ message }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { FetchError } from 'ofetch'

const { register } = useAuth()

const form = ref({
  name: '',
  emis: '',
  type: '',
  email: '',
  phone: ''
})

const message = ref('')
const messageColor = ref('text-green-600')

function resetForm() {
  form.value = { name: '', emis: '', type: '', email: '', phone: '' }
}

const registerSchool = async () => {
  try {
    // 1. Register user in Supabase and get user object
    const user = await register(form.value.email, form.value.emis);

    const userId = user?.id;

    console.log(userId);
    return;
    

    if (!userId) throw new Error('Failed to get user ID from Supabase')

    // 2. Send userId along with other form data to your backend
    await $fetch('/api/schools/register', {
      method: 'POST',
      body: {
        ...form.value,
        userId
      }
    })

    message.value = 'School registered successfully!'
    messageColor.value = 'text-green-600'
    resetForm()
  } catch (err: unknown) {
    if (err instanceof FetchError && err.data?.message) {
      message.value = err.data.message
    } else {
      message.value = 'Registration failed'
    }
    messageColor.value = 'text-red-600'
  }
}
</script>

