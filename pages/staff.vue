<template>
    <StaffTabs v-if="content" :staffData="content.staffList" />
    <div class="flex justify-center items-center" v-else>Loading staff data...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import StoryblokClient from "storyblok-js-client"

const content = ref<any>(null)

onMounted(async () => {
  const Storyblok = new StoryblokClient({
    accessToken: '2VJfB25aKyY5tWCxbutCQgtt',
    region: 'au'
  })

  try {
    const story = await Storyblok.get('cdn/stories/staff', { version: 'draft' })
   
    content.value = story.data.story.content
  } catch (error) {
    console.error('Error loading staff data:', error)
  }
})
</script>
