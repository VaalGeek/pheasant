<template>
    <div>
        <form @submit.prevent="submitNewsletter"
            class="space-y-5 p-6 max-w-lg bg-white rounded-lg shadow-lg mx-auto mt-10 border border-gray-200">
            <h2 class="text-2xl font-semibold text-center text-gray-700">Upload Newsletter</h2>

            <label for="grades" class="block text-sm font-medium text-gray-700 mb-1">Select Grade(s)</label>
            <USelect v-model="form.grades" :items="gradeItems" multiple placeholder="Select grades" class="w-full" />
            <input v-model="form.title" type="text" placeholder="Title"
                class="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-blue-500" required />

            <textarea v-model="form.description" rows="4" maxlength="120" placeholder="Description (max 120 chars)"
                class="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 resize-none"
                required />

            <div class="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 w-full">
                <!-- File Display & Select Button -->
                <label for="file-upload" class="flex items-center gap-2 cursor-pointer w-full hover:bg-gray-50">
                    <!-- PDF Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V8l-4-4H4zm8 0v4h4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V2h8z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-gray-700 truncate">
                        {{ file?.name || 'Choose PDF file' }}
                    </span>
                </label>

                <!-- Remove Button -->
                <button v-if="file" type="button" @click="clearFile" class="text-red-500 hover:text-red-700">
                    ✕
                </button>
            </div>

            <input id="file-upload" type="file" accept="application/pdf" @change="handleFileUpload" class="hidden" />



            <button type="submit" :disabled="loading"
                class="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <span v-if="loading"
                    class="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                {{ loading ? 'Uploading...' : 'Upload Newsletter' }}
            </button>

            <p v-if="message" :class="messageColor + ' text-center text-sm'">{{ message }}</p>
        </form>
        <!-- Fullscreen Loading Overlay -->
        <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div class="flex flex-col items-center space-y-3">
                <span class="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10"></span>
                <p class="text-blue-700 font-medium">Uploading newsletter...</p>
            </div>
        </div>

    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
const props = defineProps<{ schoolId: string, grades: any[] }>()

const supabase = useSupabaseClient()

const form = ref({ title: '', description: '', grades: [] as string[] })
const file = ref<File | null>(null)
const message = ref('')
const messageColor = ref('text-green-600')
const loading = ref(false)


const gradeItems = computed(() => [
    { label: 'All', value: 'All' },
    ...props.grades.map((grade: any) => ({
        label: grade.value || grade,  // in case grade is a string or object
        value: grade.value || grade,
    })),
])


watch(() => form.value.grades, (newGrades) => {
    if (newGrades.includes('all') && newGrades.length > 1) {
        form.value.grades = ['all']
    }
})

function clearFile() {
    file.value = null
}

function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files?.length) {
        const selected = target.files[0]
        if (selected.type === 'application/pdf') {
            file.value = selected
        } else {
            message.value = 'Only PDF files are allowed.'
            messageColor.value = 'text-red-600'
            file.value = null
        }
    }
}

async function submitNewsletter() {
    if (!file.value) {
        message.value = 'Please upload a PDF file.'
        messageColor.value = 'text-red-600'
        return
    }

    loading.value = true
    message.value = ''

    try {
        const filename = `${Date.now()}_${file.value.name}`
        const { error: uploadError } = await supabase.storage
            .from('newsletters')
            .upload(filename, file.value)

        if (uploadError) throw new Error(uploadError.message)

        const { publicUrl } = supabase.storage
            .from('newsletters')
            .getPublicUrl(filename).data

        const newsLetter: any = await $fetch('/api/newsletters/create', {
            method: 'POST',
            body: {
                title: form.value.title,
                description: form.value.description,
                fileUrl: publicUrl,
                target: form.value.grades.toString(),
                schoolId:props.schoolId,

            },
        })


        await $fetch('/api/messages/send-newsletter', {
            method: 'POST',
            body: {
                title: form.value.title,
                description: form.value.description,
                grades: form.value.grades,
                schoolId: props.schoolId,
                newsletterId: newsLetter.newsletter._id
            },
        })

        message.value = 'Newsletter created and Notification was send to parents'
        messageColor.value = 'text-green-600'
        form.value = { title: '', description: '', grades: [] }
        file.value = null
    } catch (err: any) {
        message.value = err.data?.message || err.message || 'An error occurred.'
        messageColor.value = 'text-red-600'
    } finally {
        loading.value = false
    }
}
</script>