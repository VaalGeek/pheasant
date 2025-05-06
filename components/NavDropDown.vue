<template>
    <li class="relative" ref="dropdownRef">
      <!-- Dropdown trigger -->
      <button
        @click="toggleDropdown"
        class="flex items-center gap-1 text-white font-medium cursor-pointer" 
      >
        {{ label }}
        <UIcon :name="isOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
      </button>
  
      <!-- Dropdown content -->
      <transition name="fade">
        <ul
          v-show="isOpen"
          class="absolute left-0 mt-2 bg-white text-black rounded-md shadow-lg w-52 z-50"
        >
          <slot />
        </ul>
      </transition>
    </li>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { onClickOutside } from '@vueuse/core'
  
  defineProps<{ label: string }>()
  
  const isOpen = ref(false)
  const dropdownRef = ref(null)
  
  function toggleDropdown() {
    isOpen.value = !isOpen.value
  }
  
  onClickOutside(dropdownRef, () => {
    isOpen.value = false
  })
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  