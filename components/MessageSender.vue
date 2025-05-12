<template>
    <div class="p-4 max-w-2xl mx-auto bg-white rounded-xl shadow space-y-6">
        <!-- Group Checkboxes -->
        <div>
            <!-- Response Message -->
            <div v-if="responseMessage" :class="[
                'p-3 rounded-lg text-center font-semibold transition-all',
                responseMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            ]">
                {{ responseMessage.text }}
            </div>

            <h2 class="text-lg font-semibold mb-2">Send To:</h2>

            <div class="flex flex-wrap gap-4">
                <div v-for="group in groups" :key="group"
                    class="flex justify-between items-center w-full sm:w-auto gap-2 border p-2 rounded-md shadow-sm min-w-[150px]">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" v-model="selectedGroups" :value="group" class="accent-blue-600"
                            @change="fetchTotals" />
                        <span class="uppercase font-semibold">{{ group }}</span>
                    </label>
                    <span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        S:{{ groupTotals[group]?.messages ?? 0 }} N:{{ groupTotals[group]?.notifications ?? 0 }}
                    </span>
                </div>
            </div>

            <!-- Dynamic Sections -->
            <div v-if="showGradeClassSelect"
                class="border border-gray-200 dark:border-gray-700 mt-2 rounded-lg p-4 overflow-x-auto">
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


                </div>
            </div>

        </div>


        <!-- Totals Display -->
        <div class="text-sm text-gray-700">
            <strong>Total valid:</strong>
            SMS ({{ totals.messages }}) & Notifications ({{ totals.notifications }})
        </div>
        <!-- Radio Buttons -->
        <div>
            <h3 class="text-lg font-semibold mb-2">Send As:</h3>
            <div class="flex flex-wrap gap-4">
                <label class="flex items-center gap-2">
                    <input type="radio" value="notifications" v-model="sendType" class="accent-blue-600" />
                    Notifications Only
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" value="sms" v-model="sendType" class="accent-blue-600" />
                    SMS Only
                </label>
                <label class="flex items-center gap-2">
                    <input type="radio" value="both" v-model="sendType" class="accent-blue-600" />
                    Both
                </label>
            </div>
        </div>



        <!-- Title Input -->
        <div v-if="sendType !== 'sms'">
            <label class="block text-sm font-medium">Title</label>
            <input v-model="title" type="text" class="w-full border rounded p-2 mt-1" placeholder="Enter title" />
        </div>

        <!-- Message Textarea -->
        <div>
            <label class="block text-sm font-medium">Message</label>
            <textarea v-model="message" rows="5" class="w-full border rounded p-2 mt-1"
                placeholder="Type your message..." />
        </div>



        <!-- Send Button -->
        <div class="text-center">
            <button @click="sendMessage" :disabled="!title || !message || selectedGroups.length === 0"
                class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                {{
                    sendType === 'notifications'
                        ? 'Send Notification'
                        : sendType === 'sms'
                            ? 'Send SMS'
                            : 'Send Notifications & SMS'
                }}
            </button>
        </div>
        <div v-if="isSending"
            class="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center text-xl font-bold text-blue-700">
            Sending...
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetch } from '#app'
const props = defineProps<{
    schoolId: string
    grades: string[]
    classes: string[]
    staffGroups: string[]
}>()

const groups = ['Parents', 'Learners', 'SMT', 'Educators', 'SGB', 'LRC', 'PS Staff']

const groupTotals = ref<Record<string, { messages: number; notifications: number }>>({})
const totals = ref({ messages: 0, notifications: 0 })
const title = ref('')
const message = ref('')
const sendType = ref<'notifications' | 'sms' | 'both'>('notifications')

const selectedGroups = ref<string[]>([])
const selectedGrades = ref<string[]>(['All'])
const selectedClasses = ref<string[]>(['All'])

const grades = computed(() => ['All', ...props.grades])
const classes = computed(() => ['All', ...props.classes])
const selectedStaffGroups = ref<string[]>([])




function handleExclusiveAllSelection(selected: string[], list: Ref<string[]>) {
    if (selected.includes('All') && selected.length > 1) {
        list.value = ['All'] // Keep only "All"
    } else if (!selected.includes('All') && list.value.includes('All')) {
        list.value = selected.filter(item => item !== 'All') // Remove "All"
    }
}

function normalizeAllSelection(newVal: string[], list: Ref<string[]>) {
    // If selecting "All", keep only it
    if (newVal.includes('All') && newVal.length > 1) {
        list.value = ['All']
    }
    // If selecting other items while "All" is already selected, remove "All"
    else if (!newVal.includes('All') && list.value.includes('All')) {
        list.value = newVal.filter(item => item !== 'All')
    }
}

watch(selectedGrades, (newVal) => {
    normalizeAllSelection(newVal, selectedGrades)
})

watch(selectedClasses, (newVal) => {
    normalizeAllSelection(newVal, selectedClasses)
})


const showGradeClassSelect = computed(() =>
    selectedGroups.value.includes('Parents') || selectedGroups.value.includes('Learners')
)

const showStaffGroupSelect = computed(() =>
    selectedGroups.value.includes('Educators') || selectedGroups.value.includes('SMT') || selectedGroups.value.includes('ps staff')
)

const isSending = ref(false)
const responseMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)



const fetchTotals = async () => {

    const validGroups = new Set(selectedGroups.value);
    const schoolId = props.schoolId;
    for (const group in groupTotals.value) {
        if (!validGroups.has(group)) {
            delete groupTotals.value[group]
        }
    }

    for (const group of selectedGroups.value) {
        if (!groupTotals.value[group]) {
            const data: any = await $fetch('/api/stakeholders/getTotalByGroup', {
                params: { group, schoolId }
            });


            groupTotals.value[group] = {
                messages: data.messages ?? 0,
                notifications: data.notifications ?? 0
            }
        }
    }

    totals.value = selectedGroups.value.reduce(
        (acc, group) => {
            const g = groupTotals.value[group]
            acc.messages += g?.messages || 0
            acc.notifications += g?.notifications || 0
            return acc
        },
        { messages: 0, notifications: 0 }
    )
}

const sendMessage = async () => {
    isSending.value = true
    responseMessage.value = null

    try {
        const payload = {
            schoolId: props.schoolId,
            title: title.value,
            message: message.value,
            groups: selectedGroups.value,
            sendType: sendType.value,
            grades: selectedGrades.value,
            classes: selectedClasses.value,
            staffGroups: selectedStaffGroups.value
        }
     

        const response = await $fetch('/api/messages/send-announcement', {
            method: 'POST',
            body: payload
        })

        responseMessage.value = { type: 'success', text: response.message || 'Sent successfully!' }

        // Clear message after timeout
        setTimeout(() => {
            responseMessage.value = null
        }, 4000)
    } catch (err: any) {
        responseMessage.value = {
            type: 'error',
            text: err?.data?.statusMessage || 'Something went wrong!'
        }

        setTimeout(() => {
            responseMessage.value = null
        }, 5000)
    } finally {
        isSending.value = false
    }
}


</script>