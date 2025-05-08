<template>
    <UContainer >


        <!-- Tabs Navigation -->
        <div class="flex justify-center space-x-4 border-b border-gray-200 dark:border-gray-700 my-6">

            <button v-for="tab in tabs" :key="tab" @click="selectedTab = tab"
                class="py-2 px-4 text-lg font-medium transition-colors" :class="selectedTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'">
                {{ tab }}
            </button>
        </div>


        <!-- Announcements Panel -->
        <div v-if="selectedTab === 'Message'">
            <MessageSender :grades="grades" :classes="classes" :staff-groups="staffGroups" :school-id="schoolId" />
        </div>

        <!-- Calendar Panel -->
        <div v-if="selectedTab === 'Calendar'" class="overflow-hidden">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 max-w-6xl mx-auto">
                <div class="max-h-[700px] overflow-y-auto">
                    <Calendar class="w-full" :school-id="schoolId" :events="events" :editable="true"
                        @create="handleEventCreate" @edit="handleEventEdit" />
                </div>
            </div>
        </div>

        <!-- Announcements Panel -->
        <div v-if="selectedTab === 'Newsletters'">
            <NewsLetter :grades="grades" :school-id="schoolId" />
        </div>

    

        <!-- Parents Panel -->
        <div v-if="selectedTab === 'Parents'">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 max-w-6xl mx-auto">
                <StakeholderTable :school-id="schoolId" :data="parentsData" role="Parent" @edit="" @delete=""
                    @update-groups="handleGroupUpdate" @refreshStakeholders="fetchStakeholders('Parent')" />
            </div>
        </div>

        <!-- Learners Panel -->
        <div v-if="selectedTab === 'Learners'">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 max-w-6xl mx-auto">
                <StakeholderTable :school-id="schoolId" :data="learnersData" role="Learner" @edit="" @delete=""
                    @update-groups="handleGroupUpdate" />
            </div>
        </div>

        <!-- Staff Panel -->
        <div v-if="selectedTab === 'Staff'">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 max-w-6xl mx-auto">
                <StakeholderTable :school-id="schoolId" :data="staffData" role="Staff" @edit="" @delete=""
                    @update-groups="handleGroupUpdate" @refreshStakeholders="fetchStakeholders('Staff')" />
            </div>
        </div>


        <div v-if="selectedTab === 'QrCodes Letters'">
            <OTPManager :school="schoolDetails" />
        </div>


        <!-- Event Modal -->
        <EventModal v-if="showEventModal" :grades="grades" :classes="classes" :staffGroups="staffGroups"
            :show="showEventModal" :isEditing="isEditing" :currentEvent="currentEvent" @onDelete="handleEventDelete"
            @onCreate="handleEventCreate" @onClose="handleModalClose" />

    </UContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});


const route = useRoute();
const userId = route.query.userId;
let schoolId = ref('');
let grades = ref([])
let classes = ref([])
let staffGroups = ref([]);
let schoolDetails:any = ref(null);

if (typeof userId === 'string') {
    try {
         schoolDetails.value = await $fetch(`/api/schools/fetchByUserId?userId=${userId}`);

        schoolId.value = schoolDetails.value._id;

    

        // Transform grades and classes
         grades.value = schoolDetails.value.grades.map((grade:any) => ({
            label: `${parseInt(grade, 10)}`, // e.g., '08' → 8 → 'Grade 8'
            value: parseInt(grade, 10).toString()
        }));

        classes.value = schoolDetails.value.classes.map((cls:any) => ({
            label: cls,
            value: cls
        }));

        staffGroups.value = schoolDetails.value.staffGroups.map((sg:any) => ({
            label: sg,
            value: sg
        }));


    } catch (error) {
        console.error('Failed to fetch school details', error);
    }
} else {
    console.warn('Invalid or missing schoolId in route query');
}


//api/school/grades?schoolId=schoolId
//api/school/classes?schoolId=schoolId

const hasFetched = {
    Parent: ref(false),
    Learner: ref(false),
    Staff: ref(false)
}


// Tabs
const tabs = ['Message', 'Calendar', 'Newsletters','Parents', 'Learners', 'Staff', 'QrCodes Letters']
const selectedTab = ref('Message')

const showEventModal = ref(false);


watch(selectedTab, (tab) => {
    if (tab === 'Parents' && !hasFetched.Parent.value) {
        fetchStakeholders('Parent')
        hasFetched.Parent.value = true
    }
    if (tab === 'Learners' && !hasFetched.Learner.value) {
        fetchStakeholders('Learner')
        hasFetched.Learner.value = true
    }
    if (tab === 'Staff' && !hasFetched.Staff.value) {
        fetchStakeholders('Staff')
        hasFetched.Staff.value = true
    }
})






// Sample Stakeholder Data (to be replaced with actual data or props)

const parentsData: any = ref([])
const learnersData: any = ref([])
const staffData: any = ref([])

// Calendar Event Types
type EventType = 'event' | 'deadline' | 'exam' | 'holiday'

// Calendar Event Interface
interface CalendarEvent {
    _id: string
    date: Date
    title: string
    description: string
    type: EventType
}

interface EventPayload {
    schoolId: string
    title: string
    description?: string
    type: EventType
    date: string
}




// Calendar Events State
const events = ref<CalendarEvent[]>([
    {
        _id: generateId(),
        date: new Date(2025, 3, 7),
        title: 'Parent-Teacher Conferences',
        description: 'Meet with teachers to discuss student progress',
        type: 'event'
    },
    {
        _id: generateId(),
        date: new Date(2025, 3, 14),
        title: 'Science Fair',
        description: 'Annual school science competition',
        type: 'event'
    },
    {
        _id: generateId(),
        date: new Date(2025, 3, 21),
        title: 'Term Papers Due',
        description: 'Final submission deadline for all term papers',
        type: 'deadline'
    },
    {
        _id: generateId(),
        date: new Date(2025, 3, 25),
        title: 'Midterm Exams Start',
        description: 'All grade midterm examinations begin',
        type: 'exam'
    },
    {
        _id: generateId(),
        date: new Date(2025, 4, 1),
        title: 'Labor Day Holiday',
        description: 'School closed for Labor Day',
        type: 'holiday'
    }
])

// Modal State

const isEditing = ref(false)
const currentEvent = ref<CalendarEvent>(createBlankEvent())



// Event Helpers
function generateId(): string {
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
    showEventModal.value = false
    currentEvent.value = createBlankEvent()
}

function handleEventCreate(date: Date) {
    currentEvent.value = { ...createBlankEvent(), date }
    isEditing.value = false
    showEventModal.value = true
}

function handleEventEdit(event: CalendarEvent) {
    currentEvent.value = { ...event }
    isEditing.value = true
    showEventModal.value = true
}

function handleEventDelete() {
    events.value = events.value.filter(e => e._id !== currentEvent.value._id)
    handleModalClose()
}

async function saveEvent() {
    if (!currentEvent.value.title.trim()) return

    const payload: EventPayload = {
        schoolId: String(1),
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

        const { data, error } = await useFetch<CalendarEvent>(url, {
            method,
            body: payload
        })

        if (error.value) throw error.value
        const saved = data.value!

        if (isEditing.value) {
            const idx = events.value.findIndex(e => e._id === saved._id)
            if (idx !== -1) events.value[idx] = saved
        } else {
            events.value.push(saved)
        }

        resetCurrentEvent()
        isEditing.value = false
        showEventModal.value = false
    } catch (err: any) {
        console.error('Failed to save event:', err)
    }
}

async function fetchStakeholders(role: string) {
    try {

        const res: any = await $fetch(`/api/stakeholders/fetchByRole?role=${role}&schoolId=${schoolId.value}`);

        
        if (role === 'Parent') parentsData.value = res
        else if (role === 'Learner') learnersData.value = res
        else if (role === 'Staff') staffData.value = res
    } catch (error) {
        console.error(`Failed to fetch ${role} data`, error)
    }

}

async function handleGroupUpdate(updatedStakeholders: any) {


    const role = updatedStakeholders[0]?.role // assumes each stakeholder has a role field

    // Update local state
    switch (role) {
        case 'Parent':
            parentsData.value = applyUpdate(parentsData.value, updatedStakeholders)
            break
        case 'Learner':
            learnersData.value = applyUpdate(learnersData.value, updatedStakeholders)
            break
        case 'Staff':
            staffData.value = applyUpdate(staffData.value, updatedStakeholders)
            break
    }


    // Send update to backend
    try {
        await $fetch('/api/stakeholders/assignGroup', {
            method: 'POST',
            body: updatedStakeholders,
        })
    } catch (error) {
        console.error('Failed to update groups:', error)
    }
}

function applyUpdate<T extends { _id: string }>(originalArray: T[], updates: T[]): T[] {
    return originalArray.map(original => {
        const updated = updates.find(u => u._id === original._id)
        return updated ? { ...original, ...updated } : original
    })
}



function resetCurrentEvent() {
    currentEvent.value = createBlankEvent()
}
</script>