<template>
    <div>
       
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