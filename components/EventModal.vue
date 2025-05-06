<template>
    <div
        class="fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex items-center justify-center px-4 transition-opacity duration-200">
        <div
            class="bg-white dark:bg-gray-900 w-full max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl relative border dark:border-gray-700">

            <!-- Close Button -->
            <button @click="handleModalClose"
                class="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-150">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Header -->
            <div class="mb-2">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ isEditing ? 'Edit' : 'Create' }} Event
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ formattedModalDate }}
                </p>
            </div>

            <!-- Form Content -->
            <form class="space-y-2">
                <!-- Type Select -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Type</label>
                    <USelect v-model="selectedEvent" :items="eventTypes" class="w-48" />
                </div>

                <!-- Target Groups -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Target Groups</label>
                    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div class="flex flex-wrap gap-3">
                            <label v-for="group in groupOptions" :key="group"
                                class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 cursor-pointer transition-colors">
                                <input type="checkbox" :value="group" v-model="selectedGroups"
                                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800">
                                <span class="text-sm text-gray-700 dark:text-gray-300">{{ group }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Dynamic Sections -->
                <div v-if="showGradeClassSelect || showStaffGroupSelect"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
                    <div class="flex flex-wrap gap-6 items-start">
                        <div v-if="showGradeClassSelect" class="flex flex-col min-w-[10rem]">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select
                                Grades</label>
                            <USelect v-model="selectedGrades" multiple :items="grades" />
                        </div>

                        <div v-if="showGradeClassSelect" class="flex flex-col min-w-[10rem]">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select
                                Classes</label>
                            <USelect v-model="selectedClasses" multiple :items="classes" />
                        </div>

                        <div v-if="showStaffGroupSelect" class="flex flex-col min-w-[12rem]">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff
                                Groups</label>
                            <USelect v-model="selectedStaffGroups" multiple :items="staffGroups" />
                        </div>
                    </div>
                </div>

                <!-- Title Input -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title <span
                            class="text-red-500">*</span></label>
                    <input v-model="currentEvent.title"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600/20 dark:focus:border-blue-600 transition-all outline-none"
                        placeholder="Team meeting">
                </div>

                <!-- Description Input -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea v-model="currentEvent.description"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600/20 dark:focus:border-blue-600 transition-all outline-none h-32"
                        placeholder="Add event details"></textarea>
                </div>

                <!-- Send As -->
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Send As</label>
                <div class="flex flex-wrap gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="notification" v-model="selectedSendMethod"
                            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Notification Only</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="sms" v-model="selectedSendMethod"
                            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800">
                        <span class="text-sm text-gray-700 dark:text-gray-300">SMS Only</span>
                    </label>

                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="both" v-model="selectedSendMethod"
                            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800">
                        <span class="text-sm text-gray-700 dark:text-gray-300">Both</span>
                    </label>
                </div>

                <!-- Actions -->
                <div class="flex justify-end space-x-3 pt-6 border-t dark:border-gray-800">
                    <UButton @click="handleModalClose" variant="ghost"
                        class="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancel</UButton>
                    <UButton v-if="isEditing" @click="" variant="solid" class="px-5 py-2.5">Delete</UButton>
                    <UButton @click="saveEvent" color="primary" variant="solid"
                        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white">
                        {{ isEditing ? 'Save Changes' : 'Send And Create Event' }}
                    </UButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, parseISO } from 'date-fns'

// Props
const props = defineProps<{
    grades: Array<{ label: string, value: string }>
    classes: Array<{ label: string, value: string }>
    staffGroups: string[]
    show: boolean
    isEditing: boolean
    currentEvent: CalendarEvent
}>()

const emit = defineEmits(['onDelete', 'onCreate', 'onClose'])




// Refs
const selectedEvent = ref('Meeting')
const selectedGroups = ref<string[]>([])
const selectedGrades = ref<string[]>([])
const selectedClasses = ref<string[]>([])
const selectedStaffGroups = ref<string[]>([])
const selectedSendMethod = ref('notification')

const currentEvent = ref<CalendarEvent>(createBlankEvent())
const showEventModal = ref(false)
const isEditing = ref(false)

// Computed logic
const groupOptions = ['Parents', 'Learners', 'Staff']

const showGradeClassSelect = computed(() =>
    selectedGroups.value.includes('Parents') || selectedGroups.value.includes('Learners')
)
const showStaffGroupSelect = computed(() =>
    selectedGroups.value.includes('Staff')
)
const formattedModalDate = computed(() =>
    format(currentEvent.value.date, 'MMM dd, yyyy')
)

// Type Definitions
type EventType = 'event' | 'deadline' | 'exam' | 'holiday' | 'meeting'

interface CalendarEvent {
    _id: string
    date: Date
    title: string
    description: string
    type: EventType
}

interface EventPayload {
    schoolId: string,
    title: string
    description?: string
    type: EventType
    date: string
}

// Event Options
const eventTypes = [
    { label: 'Meeting', value: 'meeting' },
    { label: 'Early Learners Release', value: 'early' },
    { label: 'Event', value: 'event' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Exam', value: 'exam' },
    { label: 'Test', value: 'test' },
    { label: 'Holiday', value: 'holiday' }
]

// Helpers
function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

function createBlankEvent(): CalendarEvent {
    return {
        _id: generateId(),
        date: new Date(),
        title: '',
        description: '',
        type: 'event'
    }
}

function handleModalClose() {
    emit('onClose')
    currentEvent.value = createBlankEvent()
}



async function saveEvent() {
    if (!currentEvent.value.title.trim()) return

    const payload: EventPayload = {
        schoolId: '1',
        title: currentEvent.value.title,
        description: currentEvent.value.description || undefined,
        type: currentEvent.value.type,
        date: currentEvent.value.date.toISOString()
    }

    try {
        const url = isEditing.value
            ? `/api/notifications/update/${currentEvent.value._id}`
            : '/api/notifications/send'
        const method = isEditing.value ? 'PUT' : 'POST'

        await $fetch(url, { method, body: payload })
        handleModalClose()
    } catch (err) {
        console.error(err)
    }
}
</script>