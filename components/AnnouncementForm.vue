<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Create Announcement</h2>
    <form @submit.prevent="submit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input v-model="form.title" type="text" placeholder="Enter title" class="form-input" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea v-model="form.content" placeholder="Enter content" class="form-textarea" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input v-model="form.category" type="text" placeholder="e.g. General, Events" class="form-input" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
        <input v-model="form.link" type="url" placeholder="https://example.com" class="form-input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Link Label (optional)</label>
        <input v-model="form.linkLabel" type="text" placeholder="Learn More" class="form-input" />
      </div>

      <div class="flex items-center gap-2">
        <input id="pinned" type="checkbox" v-model="form.pinned" class="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        <label for="pinned" class="text-sm text-gray-700">Pinned Announcement</label>
      </div>

      <div class="pt-4">
        <button type="submit" class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
          Create Announcement
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ schoolId: string }>()
const form = reactive({
  title: '',
  content: '',
  category: '',
  pinned: false,
  link: '',
  linkLabel: ''
})

const submit = async () => {
  await $fetch('/api/announcements/create', {
    method: 'POST',
    body: form
  })
  alert('Announcement created!')
}
</script>

<style scoped>

</style>
