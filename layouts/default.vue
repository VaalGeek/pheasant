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
const  gradesClassStaff:any = ref([]);

const loading = ref(true);
const schoolId = config.public.SCHOOL_ID;
onMounted(async () => {
  const isStakeholder = localStorage.getItem('isStakeholder') === 'true'
  const isVisitor = localStorage.getItem('isVisitor') === 'true'


  if (!(isStakeholder || isVisitor)) {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    if (!(isIOS && !isStandalone)) {
      const { getFCMToken } = useFCM()
      const token = await getFCMToken()
      if (token) {
        const res: any = await $fetch('/api/notifications/check-fcm', {
          method: 'POST',
          body: { token }
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

  // Always fetch announcements
  try {
   
    loading.value = true
    announcements.value = await $fetch<any>('/api/announcements/fetchAll?schoolId='+schoolId);
    newsLetters.value = await $fetch<any>('/api/newsletters/fetchAll?schoolId='+schoolId);
 
    gradesClassStaff.value = await $fetch<any>('/api/schools/fetchGradesClassesStaff?schoolId='+schoolId);
    
   
    loading.value = false;

  } catch (err) {
    console.error('Failed to fetch announcements:', err)
  }
})



const verify = () => {
  localStorage.setItem('isVisitor', 'false')
  navigateTo('/verify')
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
          schoolId:schoolId,
          grades:gradesClassStaff.grades!,
          items:newsLetters.value
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
