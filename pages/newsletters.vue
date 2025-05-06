<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()
const newsId = route.query.nid as string

const config = useRuntimeConfig()
const schoolId = config.public.SCHOOL_ID

const newsLetters = ref<any[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
   
    newsLetters.value = await $fetch<any>(`/api/newsletters/fetchAll?schoolId=${schoolId}`)
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading">Loading newsletters...</div>
    <div v-else-if="error">Failed to load newsletters.</div>
    <NewsLetters v-else :items="newsLetters" :selected="newsId" />
  </div>
</template>
