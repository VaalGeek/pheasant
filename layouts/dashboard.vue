<template>
    <div>
        <DashboardHeader />
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