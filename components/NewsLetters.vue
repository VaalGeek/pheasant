<template>
  <div class="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
    <h2 class="text-2xl font-bold mb-4 text-center">Newsletters</h2>

    <div v-if="loading" class="text-center text-gray-500 py-10">
      Loading newsletters...
    </div>

    <div v-else-if="props.items.length === 0" class="text-center text-gray-500 py-10">
      No newsletters available.
    </div>

    <ul v-else class="space-y-4">
      <li v-for="(newsletter, index) in props.items" :key="newsletter._id || index"
        :ref="el => setItemRef(newsletter._id, el)" :class="[
          'border border-gray-200 rounded p-4 flex items-start justify-between transition-all duration-500',
          highlightedId === newsletter._id ? 'bg-yellow-100 shadow-md scale-[1.02] animate-pulse-fast' : ''
        ]">
        <div>
          <h3 class="font-semibold text-lg text-blue-700">{{ newsletter.title }}</h3>
          <p class="text-gray-600 text-sm">{{ newsletter.description }}</p>
          <p class="text-xs text-gray-400 mt-1">
            Posted: {{ formatDate(newsletter.createdAt) }} · {{ timeAgo(newsletter.createdAt) }}
          </p>
        </div>
        <a :href="newsletter.fileUrl" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V8l-4-4H4zm8 0v4h4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V2h8z"
              clip-rule="evenodd" />
          </svg>
          View PDF
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface NewsLetters {
  _id: string
  title: string
  description: string
  fileUrl: string
  target: string,
  createdAt: string
}

const props = defineProps<{
  schoolId?: string
  items: NewsLetters[]
  source?: string
  selected?: string
}>()

const loading = ref(true)
const itemRefs = ref<Record<string, HTMLElement>>({})
const highlightedId = ref<string | null>(null)

function setItemRef(key: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    itemRefs.value[key] = el
  }
}

function scrollToSelected() {
  const el = props.selected ? itemRefs.value[props.selected] : null
  if (el instanceof HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Highlight the selected item
    highlightedId.value = props.selected!

    // Remove highlight after 2 seconds
    setTimeout(() => {
      highlightedId.value = null
    }, 2000)
  }
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour format
  }
  return new Date(dateString).toLocaleString(undefined, options)
}


function timeAgo(dateString: string) {
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



// Wait for items to render before scrolling
watch(
  () => props.items,
  async (newItems) => {
    if (newItems.length > 0) {
      loading.value = false
      await nextTick()
      // Wait a little more to ensure all refs are set
      setTimeout(() => {
        scrollToSelected()
      }, 100)
    }
  },
  { immediate: true }
)

// ALSO watch for selected changing (e.g., via query param change)
watch(
  () => props.selected,
  async (newSelected) => {
    await nextTick()
    setTimeout(() => {
      scrollToSelected()
    }, 100)
  }
)


</script>


<style scoped>
a:hover svg {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Custom faster pulse animation */
@keyframes pulse-fast {

  0%,
  100% {
    transform: scale(1.02);
    background-color: #fef3c7;
    /* tailwind's yellow-100 */
  }

  50% {
    transform: scale(1.04);
    background-color: #fde68a;
    /* tailwind's yellow-200 */
  }
}

.animate-pulse-fast {
  animation: pulse-fast 0.8s ease-in-out;
}
</style>
