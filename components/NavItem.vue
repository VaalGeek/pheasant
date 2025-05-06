<template>
    <li v-if="asListItem">
      <NuxtLink :to="to" class="block px-4 py-2 hover:bg-gray-100">
        {{ label }}
      </NuxtLink>
    </li>
    <NuxtLink v-else :to="to" class="text-white hover:text-orange-400">
      {{ label }}
    </NuxtLink>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    label: string
    to: string
    asListItem?: boolean
  }>()
  </script>
  