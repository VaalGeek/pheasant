<template>
    <div>
      <ContactBar class="hidden md:block" />
      <NotificationHeader />
      <slot />
  
      
    </div>
  </template>
  
  <script setup lang="ts">
  useHead({
  link: [
    { rel: 'manifest', href: '/manifest.webmanifest' }
  ]
})
  </script>