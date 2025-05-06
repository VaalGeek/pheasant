<template>
  <form @submit.prevent="loginUser" class="space-y-4 flex flex-col mt-5 max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold text-center">School Login</h2>

    <input v-model="form.email" type="text" placeholder="Username" class="input" required />

    <input v-model="form.password" type="password" placeholder="Password" class="input" required />

    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
      Login
    </button>

    <p v-if="message" :class="messageColor">{{ message }}</p>
  </form>

  <div v-if="isLoading" class="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white px-6 py-4 rounded shadow text-center">
      <span class="text-lg font-medium text-gray-800">Logging in...</span>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FetchError } from 'ofetch'
const { user, login } = useAuth()
const router = useRouter();

const isLoading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const message = ref('')
const messageColor = ref('text-green-600')

const loginUser = async () => {
  isLoading.value = true
  try {
    const response: any = await login(form.value.email, form.value.password);


    message.value = 'Login successful!';
    messageColor.value = 'text-green-600';

    if (response && response.user && response.user.id) {
      router.push(`/dashboard?userId=${response.user.id}`);
    }

  } catch (err: any) {
    console.error(err);

    let userFriendlyMessage = 'Login failed. Please try again.';

    if (err?.message === 'Invalid login credentials') {
      userFriendlyMessage = 'Email or password is incorrect.';
    } else if (err?.message?.toLowerCase().includes('email not confirmed')) {
      userFriendlyMessage = 'Please confirm your email before logging in.';
    } else if (err?.status === 429) {
      userFriendlyMessage = 'Too many login attempts. Please wait a few minutes.';
    }

    message.value = userFriendlyMessage;
    messageColor.value = 'text-red-600';

  } finally {
    isLoading.value = false
  }
};


</script>