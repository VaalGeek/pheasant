export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  const publicPaths = ['/', '/login', '/register', '/verify', '/newsletters', '/announcements']

  const isPublic = publicPaths.some(path => to.path === path || to.path.startsWith(path + '/'))

  if (!user.value && !isPublic) {
    return navigateTo('/login')
  }
})
