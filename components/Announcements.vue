<template>
  <div class="p-6 space-y-8 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-gray-800">📢 School Announcements</h2>
      <div class="flex gap-3 items-center w-full md:w-auto">
        <div class="relative flex-1">
          <input v-model="searchQuery" type="text" placeholder="Search announcements..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2]">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <select v-model="selectedCategory"
          class="py-2 pl-3 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0097B2] focus:border-[#0097B2]">
          <option value="all">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- Emergency Banner -->
    <div v-if="hasEmergency" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-pulse">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
        <p class="font-medium">🚨 Emergency Announcements Active</p>
      </div>
    </div>

    <!-- Announcements -->
    <div class="space-y-6">
      <div v-for="announcement in filteredAnnouncements" :key="announcement.id"
        class="bg-white p-6 rounded-xl border-l-4 shadow-sm hover:shadow-lg transition-all" :class="{
          'border-red-500': announcement.category === 'Emergency',
          'border-[#0097B2]': announcement.category === 'General',
          'border-yellow-400': announcement.category === 'Events',
          'border-purple-500': announcement.category === 'Facilities',
          'border-green-500': announcement.category === 'Academic'
        }">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">
              {{ announcement.title }}
            </h3>
            <div class="flex items-center flex-wrap gap-2 text-sm text-gray-500">
              <span>Posted: {{ formatDate(announcement.date) }}</span>
              <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                {{ announcement.category }}
              </span>
              <span v-if="announcement.pinned" class="px-2 py-0.5 rounded-full bg-[#0097B2]/10 text-[#0097B2] text-xs">
                📌 Pinned
              </span>
            </div>

          </div>
        </div>

        <p class="mt-3 text-gray-600 whitespace-pre-line leading-relaxed">
          {{ announcement.content }}
        </p>

        <div v-if="announcement.link" class="mt-4">
          <a :href="announcement.link" target="_blank"
            class="text-[#0097B2] hover:text-[#007A8C] flex items-center gap-1 font-medium">
            <UIcon name="i-heroicons-link" class="w-4 h-4" />
            {{ announcement.linkLabel || 'View Details' }}
          </a>
        </div>
        <div v-if="props.source === 'dashboard'" class="flex justify-end gap-2 mt-4">
          <button @click="editAnnouncement(announcement)" class="text-blue-600 hover:underline text-sm">
            Edit
          </button>
          <button @click="deleteAnnouncement(announcement.id)" class="text-red-600 hover:underline text-sm">
            Delete
          </button>
        </div>

      </div>

      <!-- Empty State -->
      <div v-if="filteredAnnouncements.length === 0" class="text-center py-12 text-gray-500">
        <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto mb-4" />
        <p>No announcements found matching your criteria</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  items?: Announcement[]
  source?: string
}>()

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

const announcements = ref<Announcement[]>([])
const searchQuery = ref('')
const selectedCategory = ref('all')
const categories = ['General', 'Emergency', 'Events', 'Facilities', 'Academic']

// Watch for new props.items and populate local announcements
watch(() => props.items, (newItems) => {
  if (newItems && newItems.length) {
    announcements.value = newItems
  }
}, { immediate: true })

const hasEmergency = computed(() =>
  announcements.value.some(a => a.category === 'Emergency' && !a.archived)
)

const filteredAnnouncements = computed(() => {
  return announcements.value
    .filter(a => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesCategory =
        selectedCategory.value === 'all' || a.category === selectedCategory.value

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const timeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
  ]

  for (const [secondsPerUnit, unit] of intervals) {
    const interval = Math.floor(seconds / secondsPerUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

const editAnnouncement = (announcement: Announcement) => {
  console.log('Edit', announcement)
}

const deleteAnnouncement = async (id: string) => {
  const confirmed = confirm('Are you sure you want to delete this announcement?')
  if (!confirmed) return

  try {
    await $fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    announcements.value = announcements.value.filter(a => a.id !== id)
  } catch (error) {
    console.error('Delete failed', error)
  }
}
</script>
