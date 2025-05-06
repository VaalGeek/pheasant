<template>
  <nav class="shadow-md bg-[#0097B2]">
    <div class="container mx-auto flex justify-between items-center px-4 py-3">
      <!-- Logo -->
      <NuxtLink to="/" class="text-2xl font-bold text-teal-700">
        <Logo />
      </NuxtLink>



      <!-- Desktop Menu (Hidden on Mobile) -->
      <ul v-if="showMenu" class="hidden md:flex gap-6 items-center text-white font-medium">
        <NavItem label="Home" to="/" />

        <NavDropDown label="About">
          <NuxtLink to="/about#vision" class="block px-4 py-2 hover:bg-gray-100">Vision & Mission</NuxtLink>
          <NuxtLink to="/about#values" class="block px-4 py-2 hover:bg-gray-100">Values</NuxtLink>
          <NuxtLink to="/about#history" class="block px-4 py-2 hover:bg-gray-100">History</NuxtLink>
          <NuxtLink to="/about#uniform" class="block px-4 py-2 hover:bg-gray-100">School Uniform</NuxtLink>
          <NuxtLink to="/about#times" class="block px-4 py-2 hover:bg-gray-100">School Times</NuxtLink>
        </NavDropDown>

        <NavItem label="Our Staff" to="/staff" />
        <NavItem label="Best Learners" to="/achievers" />
        <NavItem label="Mural Activities" to="/activities" />
        <NavItem label="FAQ" to="/faq" />
        <NavItem label="Contact Us" to="/contact" />
      </ul>


      <!-- Mobile Contact Info (visible only on small screens) -->
      <div class="md:hidden flex flex-col ml-4 gap-1 text-white text-xs">
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
          <span>{{ config.public.address }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span>{{ config.public.tel }}</span>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
          <span>{{ config.public.email }}</span>
        </div>
      </div>


      <!-- Mobile Menu Icon (Hamburger) -->
      <div v-if="showMenu" class="md:hidden flex items-center">
        <button @click="toggleMobileMenu" class="text-white">
          <div class="w-6 h-1 bg-white my-1 rounded-sm"></div>
          <div class="w-6 h-1 bg-white my-1 rounded-sm"></div>
          <div class="w-6 h-1 bg-white my-1 rounded-sm"></div>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu (Hidden on Desktop) -->
  <div v-show="isMobileMenuOpen"
    class="fixed top-0 right-0 w-2/3 bg-teal-800 text-white p-6 z-50 h-full transition-transform transform md:hidden"
    :class="{ 'translate-x-0': isMobileMenuOpen, '-translate-x-full': !isMobileMenuOpen }">

    <!-- Close Button (X) -->
    <div v-if="showMenu" class="flex justify-end">
      <button @click="toggleMobileMenu" class="text-white text-3xl">
        &times;
      </button>
    </div>

    <!-- Mobile Menu Items -->
    <ul class="flex flex-col items-start gap-4 py-4">
      <NavItem label="Home" to="/" />

      <NavDropDown label="About">
        <NuxtLink to="/about#vision" class="block px-4 py-2 hover:bg-gray-100">Vision & Mission</NuxtLink>
        <NuxtLink to="/about#values" class="block px-4 py-2 hover:bg-gray-100">Values</NuxtLink>
        <NuxtLink to="/about#history" class="block px-4 py-2 hover:bg-gray-100">History</NuxtLink>
        <NuxtLink to="/about#uniform" class="block px-4 py-2 hover:bg-gray-100">School Uniform</NuxtLink>
        <NuxtLink to="/about#times" class="block px-4 py-2 hover:bg-gray-100">School Times</NuxtLink>
      </NavDropDown>

      <NavItem label="Our Staff" to="/staff" />
      <NavItem label="Best Learners" to="/achievers" />
      <NavItem label="Mural Activities" to="/activities" />
      <NavItem label="FAQ" to="/faq" />
      <NavItem label="Contact Us" to="/contact" />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const config = useRuntimeConfig();

const showMenu = config.public.showMenu === '1'

const isMobileMenuOpen = ref(false)

// Toggle mobile menu visibility
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<style scoped>
/* Add transition for smooth slide-in and slide-out */
.transition-transform {
  transition: transform 0.3s ease-in-out;
}
</style>
