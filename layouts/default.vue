<template>
  <div>
    <ContactBar class="hidden md:block" />
    <NavBar />

    <slot />

    <!-- FAB -->
    <FAB :visible="!activeComponent" @select="openComponent" />

    <!-- Global Slide-in Panel -->
    <GlobalRightPanel :visible="!!activeComponent" @close="activeComponent = null">
      <component v-if="resolvedComponent.component" :is="resolvedComponent.component"
        v-bind="resolvedComponent.props" />
    </GlobalRightPanel>
    <StakeholderPrompt v-if="showPrompt" @verify="verify" @dismiss="dismiss" />

    <div v-if="loading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div class="relative w-32 h-32 mb-8 flex items-center justify-center">
        <!-- Spinning border -->
        <div class="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

        <!-- Logo in the center -->
        <img src="/logo.png" alt="School Logo" class="w-24 h-24 rounded-full object-contain" />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-300 animate-pulse">Loading...</p>
    </div>

    <div v-if="showVerifyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-60">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4 text-center"> User Verificartions</h2>

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
useHead({
  link: [
    { rel: 'manifest', href: '/manifest.webmanifest' }
  ]
})
const config = useRuntimeConfig();

import GlobalRightPanel from '~/components/GlobalRightPanel.vue'
import { useFCM } from '@/composables/useFCM'

const showPrompt = ref(false)
// Import FAB-related components
import Calendar from '~/components/Calendar.vue'
import NewsLetter from '~/components/NewsLetters.vue'
import Announcements from '~/components/Announcements.vue'

const route = useRoute();
const announcements = ref([]);
const newsLetters = ref([]);
const gradesClassStaff: any = ref([]);
const showVerifyModal = ref(false);
const loading = ref(true);
const schoolId = config.public.SCHOOL_ID;
const message = ref('')
const manualEmail = ref('')
const manualCell = ref('')
const manualRole = ref('')
const formError = ref('')


onMounted(async () => {
  const isStakeholder = localStorage.getItem('isStakeholder') === 'true'
  const isVisitor = localStorage.getItem('isVisitor') === 'true'

  const { requestNotificationPermission, getFCMToken } = useFCM()

  if (!(isStakeholder || isVisitor)) {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    // Prevent auto-prompt on iOS web or non-standalone
    if (!(isIOS && !isStandalone)) {
      const permission = Notification.permission
      if (permission === 'granted') {
        const token = await getFCMToken()
        if (token) {
          const res: any = await $fetch('/api/notifications/check-fcm', {
            method: 'POST',
            body: { token },
          })
          if (res?.stakeholderId) {
            localStorage.setItem('isStakeholder', 'true')
            localStorage.setItem('fcmToken', token)
          } else {
            showPrompt.value = true
          }
        }
      }
    }
  }

  // Always fetch announcements
  try {
    loading.value = true
    announcements.value = await $fetch<any>('/api/announcements/fetchAll?schoolId=' + schoolId)
    newsLetters.value = await $fetch<any>('/api/newsletters/fetchAll?schoolId=' + schoolId)
    gradesClassStaff.value = await $fetch<any>('/api/schools/fetchGradesClassesStaff?schoolId=' + schoolId)
    loading.value = false
  } catch (err) {
    console.error('Failed to fetch announcements:', err)
  }
})




const verify = () => {
  showPrompt.value = false;
  localStorage.setItem('isVisitor', 'false');
  showVerifyModal.value = true;
  //navigateTo('/verify')
}


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
      showPrompt.value = false;
      // Wait 2 seconds before hiding the modal
      setTimeout(() => {
        showVerifyModal.value = false
      
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


const dismiss = () => {
  localStorage.setItem('isVisitor', 'true')
  showPrompt.value = false
}
const activeComponent = ref<null | string>(null);
const generateId = () => Math.random().toString(36).substring(2, 9)
const publicEvents = ref([
  {
    id: generateId(),
    date: new Date(2025, 3, 7), // April 7
    title: 'Parent-Teacher Conferences',
    description: 'Meet with teachers to discuss student progress',
    type: 'event'
  },
  {
    id: generateId(),
    date: new Date(2025, 3, 14), // April 14
    title: 'Science Fair',
    description: 'Annual school science competition',
    type: 'event'
  },
  {
    id: generateId(),
    date: new Date(2025, 3, 21), // April 21
    title: 'Term Papers Due',
    description: 'Final submission deadline for all term papers',
    type: 'deadline'
  },
  {
    id: generateId(),
    date: new Date(2025, 3, 25), // April 25
    title: 'Midterm Exams Start',
    description: 'All grade midterm examinations begin',
    type: 'exam'
  },
  {
    id: generateId(),
    date: new Date(2025, 4, 1), // May 1
    title: 'Labor Day Holiday',
    description: 'School closed for Labor Day',
    type: 'holiday'
  }
])


function openComponent(component: string) {
  activeComponent.value = component
}

const resolvedComponent = computed(() => {
  switch (activeComponent.value) {
    case 'Calendar':
      return {
        component: Calendar,
        props: {
          events: publicEvents.value,
          editable: false,
        },
      }
    case 'Newsletter':
      return {
        component: NewsLetter,
        props: {
          schoolId: schoolId,
          grades: gradesClassStaff.grades!,
          items: newsLetters.value
        }
      }

    case 'Announcements':
      return { component: Announcements, props: { items: announcements.value } }
    default:
      return { component: null, props: {} }
  }
})

</script>
<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
