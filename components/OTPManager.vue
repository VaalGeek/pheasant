<template>
    <div class="space-y-4">
        <div v-if="loading" class="text-gray-500">Loading unsubscribed stakeholders...</div>

        <div v-else>
            <div v-if="hasUnsubscribers" class="space-y-4 max-w-md">
                <div class="text-lg font-semibold text-gray-800">Unsubscribed Stakeholders:</div>
                <ul class="space-y-2">
                    <li v-if="unsubscribed.parents.length" class="flex flex-col gap-2 p-4 bg-orange-50 rounded border">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-800">👨‍👩‍👧‍👦 Parents: {{ unsubscribed.parents.length }}</span>
                            <div class="flex gap-2">
                                <!--
                                <button @click="sendOtp('Parent')" :disabled="otpLoading.Parent"
                                    class="px-3 py-1 cursor-pointer text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
                                    <span v-if="otpLoading.Parent">Sending...</span>
                                    <span v-else>Send OTP</span>
                                </button>-->
                                <button @click="showParentFilter = !showParentFilter"
                                    class="px-3 py-1 cursor-pointer text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                    {{ showParentFilter ? 'Hide Filter' : 'Download Letters' }}
                                </button>
                            </div>
                        </div>
                        <div v-if="otpMessages.Parent" class="text-sm text-gray-700">{{ otpMessages.Parent }}</div>

                        <div v-if="showParentFilter" class="space-y-2 mt-2">
                            <!-- Grade select -->
                            <label class="text-sm text-gray-700 font-medium">Select Grade(s)</label>
                            <USelect v-model="selectedGrade" multiple :items="gradeOptions"
                                class="border rounded p-1 w-full" />

                            <!-- Class select -->
                            <label v-if="!selectedGrade.includes('All')"
                                class="text-sm text-gray-700 font-medium">Select Class(es)</label>
                            <USelect v-if="!selectedGrade.includes('All')" v-model="selectedClass" multiple
                                :items="classOptions" class="border rounded p-1 w-full" />


                            <!-- Send Letters button -->
                            <button @click="sendFilteredLetters('Parent')" :disabled="printLoading.Parent"
                                class="px-3 py-1 cursor-pointer text-sm bg-purple-700 text-white rounded hover:bg-purple-800 w-full disabled:opacity-50">
                                <span v-if="printLoading.Parent">Preparing letters...</span>
                                <span v-else>Download Letters</span>
                            </button>
                        </div>
                    </li>


                    <li v-if="unsubscribed.learners.length" class="flex flex-col gap-2 p-4 bg-blue-50 rounded border">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-800">🎓 Learners: {{ unsubscribed.learners.length }}</span>
                            <div class="flex gap-2">
                                <!--<button @click="sendOtp('Learner')" :disabled="otpLoading.Learner"
                                    class="px-3 py-1 cursor-pointer text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                                    <span v-if="otpLoading.Learner">Sending...</span>
                                    <span v-else>Send OTP</span>
                                </button>-->
                                <button @click="showFilter.Learner = !showFilter.Learner"
                                    class="px-3 py-1 cursor-pointer text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                    {{ showFilter.Learner ? 'Hide Filter' : 'Download Letters' }}
                                </button>
                            </div>
                        </div>

                        <div v-if="otpMessages.Learner" class="text-sm text-gray-700">{{ otpMessages.Learner }}</div>

                        <div v-if="showFilter.Learner" class="space-y-2 mt-2">
                            <label class="text-sm text-gray-700 font-medium">Select Grade(s)</label>
                            <USelect v-model="selectedGrade" multiple :items="gradeOptions"
                                class="border rounded p-1 w-full" />

                            <label v-if="!selectedGrade.includes('All')"
                                class="text-sm text-gray-700 font-medium">Select Class(es)</label>
                            <USelect v-if="!selectedGrade.includes('All')" v-model="selectedClass" multiple
                                :items="classOptions" class="border rounded p-1 w-full" />

                            <button @click="sendFilteredLetters('Learner')" :disabled="printLoading.Learner"
                                class="px-3 py-1 cursor-pointer text-sm bg-purple-700 text-white rounded hover:bg-purple-800 w-full disabled:opacity-50">
                                <span v-if="printLoading.Learner">Preparing letters...</span>
                                <span v-else>Download Letters</span>
                            </button>
                        </div>
                    </li>


                    <li v-if="unsubscribed.staff.length" class="flex flex-col gap-2 p-4 bg-green-50 rounded border">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-800">👨‍🏫 Staff: {{ unsubscribed.staff.length }}</span>
                           <!-- <button @click="sendOtp('Staff')" :disabled="otpLoading.Staff"
                                class="px-3 py-1 text-sm cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                                <span v-if="otpLoading.Staff">Sending...</span>
                                <span v-else>Send OTP</span>
                            </button>-->
                            <button @click="printLetters('Staff')" :disabled="printLoading.Staff"
                                class="px-3 py-1 cursor-pointer text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                                <span v-if="printLoading.Staff">Busy preparing letters...</span>
                                <span v-else>Download Letters</span>
                            </button>
                        </div>
                        <div v-if="otpMessages.Staff" class="text-sm text-gray-700">{{ otpMessages.Staff }}</div>
                    </li>

                </ul>
            </div>
            <div v-else class="text-green-600">✅ All stakeholders are subscribed to notifications.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
const unsubscribed = ref({ parents: [], learners: [], staff: [] })
const loading = ref(true)
const props = defineProps<{
    school: {
        _id: string;
        type: string;
        name: string;
        emis: string;
        username: string;
        email: string;
        phone: string;
        grades: string[];
        classes: string[];
        staffGroups: string[];
    };
}>()
const showParentFilter = ref(false)
const selectedGrade = ref(['All'])
const selectedClass = ref(['All'])

const showFilter = reactive({
    Parent: false,
    Learner: false
})




watch(selectedGrade, () => handleAllSelection(selectedGrade))
watch(selectedClass, () => handleAllSelection(selectedClass))

function handleAllSelection(selectedArray: Ref<string[]>) {
    if (selectedArray.value.includes('All') && selectedArray.value.length > 1) {
        // If All + others selected → remove All
        selectedArray.value = selectedArray.value.filter(v => v !== 'All')
    } else if (!selectedArray.value.includes('All') && selectedArray.value.length === 0) {
        // If nothing selected → fallback to All
        selectedArray.value = ['All']
    }
}


// Add "All" option at the beginning of the grades and classes lists
const gradeOptions = ref([{ label: 'All', value: 'All' }, ...props.school.grades.map(g => ({ label: g, value: g }))])
const classOptions = ref([{ label: 'All', value: 'All' }, ...props.school.classes.map(c => ({ label: c, value: c }))])


type Role = 'Parent' | 'Learner' | 'Staff'
const printLoading = ref<Record<Role, boolean>>({
    Parent: false,
    Learner: false,
    Staff: false
})

const otpLoading = ref<Record<Role, boolean>>({
    Parent: false,
    Learner: false,
    Staff: false
})

const otpMessages = ref<Record<Role, string>>({
    Parent: '',
    Learner: '',
    Staff: ''
})

const hasUnsubscribers = computed(() => {
    return unsubscribed.value.parents.length > 0 ||
        unsubscribed.value.learners.length > 0 ||
        unsubscribed.value.staff.length > 0
})

const sendFilteredLetters = async (role: 'Parent' | 'Learner') => {
  printLoading.value[role] = true
  try {
    // Remove grades and classes from props
    const { grades, classes, ...schoolDetails } = props.school

    const res: any = await $fetch(`/api/notifications/print-letters`, {
      method: 'POST',
      body: {
        role,
        details: schoolDetails,
        filter: {
          grade: selectedGrade.value,
          class: selectedClass.value
        }
      },
      responseType: 'blob'
    })

    const blob = new Blob([res], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${role}-Letters.pdf`
    link.click()
  } catch (e) {
    console.error(`Failed to generate letters for ${role}`, e)
  } finally {
    printLoading.value[role] = false
  }
}



const fetchUnsubscribers = async () => {
    loading.value = true
    unsubscribed.value = await $fetch<any>('/api/notifications/fetchUnsubscribers')
    loading.value = false
}

onMounted(fetchUnsubscribers)

const printLetters = async (role: Role) => {
    printLoading.value[role] = true

    const payload: any = {
        role,
        details: {
            type: props.school.type,
            name: props.school.name,
            emis: props.school.emis,
            email: props.school.email,
            phone: props.school.phone
        }
    }

    if (role === 'Parent' || role === 'Learner') {
        payload.filter = { grade: selectedGrade.value, class: selectedClass.value }
    }


    try {
        const res: any = await $fetch(`/api/notifications/print-letters`, {
            method: 'POST',
            body: payload,
            responseType: 'blob'
        })
        const blob = new Blob([res], { type: 'application/pdf' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${role}-Letters.pdf`
        link.click()
    } catch (e) {
        console.error('Failed to generate letters', e)
    } finally {
        printLoading.value[role] = false
    }
}

const sendOtp = async (role: Role) => {
    otpLoading.value[role] = true
    otpMessages.value[role] = ''

    try {
        await $fetch('/api/notifications/send-otp', {
            method: 'POST',
            body: { target: role }
        })
        otpMessages.value[role] = `✅ OTP sent to unsubscribed ${role}s!`
        await fetchUnsubscribers()
    } catch (e) {
        otpMessages.value[role] = `❌ Failed to send OTP to ${role}s.`
    } finally {
        otpLoading.value[role] = false
        setTimeout(() => {
            otpMessages.value[role] = ''
        }, 5000)
    }
}
</script>
