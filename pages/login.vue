<template>
    <Login/>
</template>

<script setup lang="ts">
const route = useRoute()
definePageMeta({
    layout: 'dashboard',
})

onMounted(() => {
  const code = route.query.code as string

  if (code) {
    // Handle the code (e.g., finish email verification or sign in)
    // For Supabase: client.auth.exchangeCodeForSession(code) if needed

    // Then clean the URL
    const url = new URL(window.location.href)
    url.searchParams.delete('code')
    window.history.replaceState({}, document.title, url.pathname)
  }
})

</script>