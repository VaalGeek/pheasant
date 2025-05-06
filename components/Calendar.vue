<template>
  <div class="p-4 relative bg-gray-50 rounded-md shadow mx-2 sm:mx-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 px-1">
      <button @click="goToPreviousMonth" class="text-2xl px-2 hover:text-blue-600">‹</button>
      <h2 class="text-base sm:text-xl font-semibold mx-2 text-center">
        {{ format(currentDate, 'MMMM yyyy') }}
      </h2>
      <button @click="goToNextMonth" class="text-2xl px-2 hover:text-blue-600">›</button>
    </div>

    <!-- Weekdays -->
    <div class="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-white bg-blue-500 py-2 rounded">
      <div v-for="day in weekdays" :key="day">{{ day.slice(0, 3) }}</div>
    </div>

    <!-- Scrollable Grid Wrapper for Mobile -->
    <div class="overflow-x-auto">
      <div class="grid grid-cols-7 gap-1 mt-2 text-xs">
        <!-- Blank Days -->
        <div v-for="blank in blanks" :key="'b' + blank" class="min-h-[60px]"></div>

        <!-- Days -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="relative p-1 border rounded bg-white cursor-pointer hover:bg-blue-50 min-h-[60px] flex flex-col"
          :class="{ 'bg-blue-100': isToday(day) }"
          @click="selectDay(day)"
        >
          <span class="text-xs font-medium mb-1">{{ day }}</span>

          <!-- Events (with spacing for button) -->
          <div class="flex-1 overflow-y-auto space-y-0.5 pb-6">
            <div
              v-for="event in getEventsForDay(day)"
              :key="event._id"
              class="text-[10px] leading-tight px-1 py-0.5 bg-blue-100 rounded truncate"
            >
              {{ event.title }}
            </div>
          </div>

          <!-- Add Event Button -->
          <button
            v-if="editable"
            @click.stop="createEvent(day)"
            class="absolute bottom-1 cursor-pointer right-1 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs shadow hover:bg-blue-600"
            title="Add Event"
          >
            ＋
          </button>
        </div>
      </div>
    </div>

    <!-- Day Modal -->
    <div v-if="selectedDay" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2">
      <div class="bg-white w-full max-w-sm rounded-lg shadow-lg relative max-h-[80vh] flex flex-col">
        <div class="p-4 flex-shrink-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">
              {{ format(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay), 'PPP') }}
            </h3>
            <button @click="selectedDay = null" class="text-gray-500 hover:text-red-500 text-xl">
              ✕
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="event in getEventsForDay(selectedDay)"
              :key="event._id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span class="text-sm truncate">{{ event.title }}</span>
              <button
                v-if="editable"
                @click.stop="editEvent(event)"
                class="text-blue-600 hover:text-blue-700 text-xs px-2"
              >
                Edit
              </button>
            </div>
            <p v-if="getEventsForDay(selectedDay).length === 0" class="text-gray-500 text-sm">
              No events for this day
            </p>
          </div>
        </div>
        <div class="mt-auto p-4 border-t">
          <button
            @click="selectedDay = null"
            class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  getDay,
  isSameDay,
  getDate,
  parseISO,
} from 'date-fns'

const props = defineProps<{
  events: Array<{
    _id: string
    title: string
    date: string | Date
  }>
  editable?: boolean
  schoolId?:string
}>()

const emit = defineEmits(['create', 'edit'])

const currentDate = ref(new Date())
const selectedDay = ref<number | null>(null)

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDate(d: string | Date): Date {
  return typeof d === 'string' ? parseISO(d) : d
}

const startDay = computed(() => startOfMonth(currentDate.value))
const daysInMonth = computed(() =>
  Array.from({ length: getDate(endOfMonth(currentDate.value)) }, (_, i) => i + 1)
)
const blanks = computed(() => Array(getDay(startDay.value)).fill(0))

function isToday(day: number) {
  return isSameDay(new Date(), new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day))
}

function getEventsForDay(day: number) {
  const month = currentDate.value.getMonth()
  const year = currentDate.value.getFullYear()

  return props.events.filter((event) => {
    const eventDate = toDate(event.date)
    return (
      eventDate.getDate() === day &&
      eventDate.getMonth() === month &&
      eventDate.getFullYear() === year
    )
  })
}

function goToPreviousMonth() {
  currentDate.value = subMonths(currentDate.value, 1)
}
function goToNextMonth() {
  currentDate.value = addMonths(currentDate.value, 1)
}
function createEvent(day: number) {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  emit('create', date)
}
function editEvent(event: any) {
  emit('edit', event)
}
function selectDay(day: number) {
  selectedDay.value = day
}


</script>
