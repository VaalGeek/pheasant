<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

type Stakeholder = {
    _id: string
    name: string
    email: string
    cell: string
    grade?: string
    class?: string
    groups?: string[]
}

const props = defineProps<{
    data: Stakeholder[]
    role: 'Parent' | 'Learner' | 'Staff' | string
    schoolId?: string
}>()

const emit = defineEmits<{
    (e: 'updateGroups', updated: Stakeholder[]): void
    (e: 'refreshStakeholders'): void
}>()

const searchQuery = ref('')
const assignGroup = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const isUploading = ref(false)
const showEditModal = ref(false)
const stakeholderToEdit = ref<Stakeholder | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedIds = ref<Set<string>>(new Set())

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') showEditModal.value = false
}

const filteredData = computed(() => {
    if (!searchQuery.value.trim()) return props.data
    const query = searchQuery.value.toLowerCase()
    return props.data.filter(item =>
        Object.entries(item).some(([key, value]) => {
            if (key === 'id') return false
            const stringValue = Array.isArray(value) ? value.join(' ') : String(value || '')
            return stringValue.toLowerCase().includes(query)
        })
    )
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredData.value.slice(start, start + pageSize.value)
})

const assignOptions = computed(() => {
    const roles = props.role === 'Parent' ? ['SGB']
        : props.role === 'Learner' ? ['SGB', 'RCL']
            : props.role === 'Staff' ? ['SGB', 'SMT']
                : []
    return roles.map(role => ({ label: role, value: role }))
})

function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
    } else {
        selectedIds.value.add(id)
    }
    // force Vue to notice change
    selectedIds.value = new Set([...selectedIds.value])
}

function selectAll(checked: boolean) {
    const currentIds = paginatedData.value.map(item => item._id)
    if (checked) {
        currentIds.forEach(id => selectedIds.value.add(id))
    } else {
        currentIds.forEach(id => selectedIds.value.delete(id))
    }
    selectedIds.value = new Set([...selectedIds.value])
}


const allowedGroupOptions = computed(() => {
    if (props.role === 'Parent') return ['SGB', 'Parents']
    if (props.role === 'Learner') return ['SGB', 'RCL', 'Learners']
    if (props.role === 'Staff') return ['SGB', 'SMT']
    return []
})



function isSelected(id: string) {
    return selectedIds.value.has(id)
}
const groupOptions = ['SGB', 'RCL', 'SMT', 'Parents', 'Learners']

function openEditModal(stakeholder: any) {
    const allowedGroups =
        props.role === 'Parent'
            ? ['SGB', 'Parents']
            : props.role === 'Learner'
                ? ['SGB', 'RCL', 'Learners']
                : props.role === 'Staff'
                    ? ['SGB', 'SMT']
                    : []

    const existingGroups = stakeholder.groups || []

    stakeholderToEdit.value = {
        ...stakeholder,
        // keep only groups that are allowed for this role
        groups: existingGroups.filter((g: string) => allowedGroups.includes(g))
    }

    showEditModal.value = true
}






function saveEdit() {
    if (stakeholderToEdit.value) {
        emit('updateGroups', [stakeholderToEdit.value])
        showEditModal.value = false
    }
}

function confirmDelete(stakeholder: Stakeholder) {
    if (confirm(`Delete ${stakeholder.name}?`)) {
        alert(`(Demo) Delete API to be implemented for ${stakeholder.name}`)
    }
}

watch(assignGroup, (newGroup) => {
    if (!newGroup) return
    const updated = props.data
        .filter(item => selectedIds.value.has(item._id))
        .map(item => {
            const groups = item.groups ?? []
            return !groups.includes(newGroup)
                ? { ...item, groups: [...groups, newGroup] }
                : null
        })
        .filter(Boolean) as Stakeholder[]

    if (updated.length) emit('updateGroups', updated)
    assignGroup.value = ''
    selectedIds.value.clear()
    selectedIds.value = new Set([...selectedIds.value])
})

async function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || !/\.(xls|xlsx)$/i.test(file.name)) {
        alert('Please upload a valid Excel file')
        return
    }

    const formData = new FormData()

    formData.append('stakeholders', file);
    if (props.schoolId) {
        formData.append('schoolId', props.schoolId)
    }


    const endpoint = props.role === 'Parent'
        ? '/api/stakeholders/upload-parent'
        : '/api/stakeholders/upload-staff'

    try {
        isUploading.value = true
        const res = await fetch(endpoint, { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        emit('refreshStakeholders')
        alert('✅ Upload successful')
    } catch (error: any) {
        alert(`❌ Error: ${error.message}`)
    } finally {
        isUploading.value = false
    }
}

function triggerFileInput() {
    fileInput.value?.click()
}
</script>

<template>
    <div v-if="isUploading" class="fixed inset-0 bg-black/25 bg-opacity-50 flex items-center justify-center z-50">
        <span class="text-white text-lg">Uploading...</span>
    </div>

    <div class="space-y-4">
        <div class="flex flex-wrap justify-between gap-4 items-center">
            <UInput v-model="searchQuery" placeholder="Search stakeholders..."
                icon="i-heroicons-magnifying-glass-20-solid" class="max-w-md" />

            <div class="flex gap-4 items-center">
                <div v-if="['Parent', 'Staff'].includes(props.role)">
                    <input ref="fileInput" type="file" accept=".xls,.xlsx" class="hidden" @change="handleFileUpload" />
                    <div class="flex items-center gap-2 relative group">
                        <UButton @click="triggerFileInput" label="Upload Excel" icon="i-heroicons-cloud-arrow-up" />

                        <div class="relative group">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>

                            <div
                                class="absolute left-1/2 z-10 w-72 -translate-x-1/2 top-8 hidden group-hover:block bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 border dark:border-gray-700 rounded-lg shadow-lg p-4">
                                <p class="font-semibold mb-1">To Update {{ props.role }} follow the following steps:</p>
                                <ol class="list-decimal list-inside space-y-1">
                                    <li>Go to SA SAMS</li>
                                    <template v-if="props.role === 'Parent'">
                                        <li>
                                            Click on menu Item 3 → 3.1 →
                                            <span class="font-bold text-green-400">3.1.13</span>
                                        </li>
                                        <li>In 3.1.13 click on Show All and click on Export Button</li>
                                        <li>Save (Open) the export file on desktop inside a folder you will remember
                                        </li>
                                        <li>Come back here and click on Upload Parents Excel</li>
                                    </template>
                                    <template v-else-if="props.role === 'Staff'">
                                        <li>Click on HR <span class="font-bold text-green-400">3.1.13</span></li>
                                        <li>HR Listing</li>
                                        <li>Select only mobile from the left field</li>
                                        <li>Click View All and Export</li>
                                    </template>
                                </ol>
                            </div>
                        </div>

                    </div>

                </div>

                <div v-if="selectedIds.size > 0" class="flex gap-2 items-center">
                    <label class="text-sm font-medium">Assign As:</label>
                    <USelect v-model="assignGroup" :items="assignOptions" placeholder="Select group..." />
                </div>
            </div>
        </div>

        <div class="border rounded-lg overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-3">
                            <input type="checkbox"
                                :checked="paginatedData.length > 0 && paginatedData.every(item => isSelected(item._id))"
                                :indeterminate="paginatedData.some(item => isSelected(item._id)) && !paginatedData.every(item => isSelected(item._id))"
                                @change="selectAll(($event.target as HTMLInputElement).checked)"
                                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium uppercase">Mobile</th>
                        <th class="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                        <th v-if="['Parent', 'Learner'].includes(props.role)"
                            class="px-6 py-3 text-left text-xs font-medium uppercase">Grade</th>
                        <th v-if="['Parent', 'Learner'].includes(props.role)"
                            class="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                        <th class="px-6 py-3 text-left text-xs font-medium uppercase">Groups</th>
                        <th class="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                    </tr>
                </thead>

                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="item in paginatedData" :key="item._id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td class="px-6 py-4">
                            <input type="checkbox" :checked="isSelected(item._id)" @change="toggleSelect(item._id)"
                                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td class="px-6 py-4 text-sm">{{ item.name || '—' }}</td>
                        <td class="px-6 py-4 text-sm">{{ item.cell.toString() || '—' }}</td>
                        <td class="px-6 py-4 text-sm">{{ item.email || '—' }}</td>
                        <td v-if="['Parent', 'Learner'].includes(props.role)" class="px-6 py-4 text-sm">{{ item.grade ||
                            '—' }}</td>
                        <td v-if="['Parent', 'Learner'].includes(props.role)" class="px-6 py-4 text-sm">{{ item.class ||
                            '—' }}</td>
                        <td class="px-6 py-4 text-sm">{{ item.groups?.join(', ') || '—' }}</td>
                        <td class="px-6 py-4 space-x-2 text-sm">
                            <button @click="openEditModal(item)"
                                class="text-blue-600 hover:text-blue-900 cursor-pointer">Edit</button>
                            <button @click="confirmDelete(item)"
                                class="text-red-600 hover:text-red-900 cursor-pointer">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="paginatedData.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800">
                No stakeholders found
            </div>

            <div class="flex justify-between items-center px-6 py-4 border-t bg-gray-50 dark:bg-gray-800">
                <div class="flex items-center gap-2">
                    <span class="text-sm">Rows per page:</span>
                    <select v-model="pageSize" class="rounded-md border-gray-300 shadow-sm">
                        <option v-for="opt in [10, 15, 20]" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
                    <div class="flex gap-2">
                        <button @click="currentPage--" :disabled="currentPage <= 1"
                            class="px-3 py-1 rounded-md border shadow-sm disabled:opacity-50">Previous</button>
                        <button @click="currentPage++" :disabled="currentPage >= totalPages"
                            class="px-3 py-1 rounded-md border shadow-sm disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showEditModal" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                <h2 class="text-xl font-semibold mb-4">Edit Stakeholder</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Name</label>
                        <UInput v-model="stakeholderToEdit!.name" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <UInput v-model="stakeholderToEdit!.email" class="w-full" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Mobile</label>
                        <UInput v-model="stakeholderToEdit!.cell" class="w-full" />
                    </div>

                    <template v-if="['Parent', 'Learner'].includes(props.role)">
                        <div>
                            <label class="block text-sm font-medium mb-1">Grade</label>
                            <UInput v-model="stakeholderToEdit!.grade" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Class</label>
                            <UInput v-model="stakeholderToEdit!.class" class="w-full" />
                        </div>
                    </template>

                    <div>
                        <label class="block text-sm font-medium mb-1">Groups</label>
                        <USelect v-model="stakeholderToEdit!.groups" :items="allowedGroupOptions" multiple
                            class="w-full" />


                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <UButton @click="showEditModal = false" label="Cancel" />
                    <UButton @click="saveEdit" label="Save Changes" color="primary" />
                </div>
            </div>
        </div>

    </div>
</template>
