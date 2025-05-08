<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'
import Announcements from '~/components/Announcements.vue'

// Route and runtime config
const route = useRoute()
const config = useRuntimeConfig()
const schoolId = config.public.SCHOOL_ID
const newsId = route.query.nid as string

// Define announcement structure (customize as needed)
interface Announcement {
  id: string
  title: string
  content: string
  date: string
  category: string
  pinned?: boolean
  archived?: boolean
  link?: string
  linkLabel?: string
}

// Reactive state
const announcements = ref<Announcement[]>([])
const loading = ref(true)
const error = ref(false)

// Fetch data on mount
onMounted(async () => {
  try {
    const data = await $fetch<Announcement[]>(`/api/announcements/fetchAll?schoolId=${schoolId}`)
    announcements.value = data
  
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading">Loading Announcements...</div>
    <div v-else-if="error">Failed to load Announcements.</div>
    <Announcements v-else :items="announcements" :source="'public'" />
  </div>
</template>
