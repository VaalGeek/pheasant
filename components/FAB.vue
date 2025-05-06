<template>
    <div
      v-if="visible"
      class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- FAB Items -->
      <transition-group name="fab-stagger" tag="div" class="flex flex-col items-end gap-3">
        <div
          v-for="(item, index) in fabItems"
          v-show="isOpen"
          :key="item.label"
          class="flex items-center gap-3"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <span class="text-sm font-medium text-white bg-gray-800 px-3 py-1 rounded-lg shadow-lg">
            {{ item.label }}
          </span>
          <button
            @click="selectItem(item.component)"
            class="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            <UIcon
              :name="item.icon"
              class="text-[#0097B2] w-6 h-6 group-hover:text-[#007A8C] transition-colors cursor-pointer"
            />
          </button>
        </div>
      </transition-group>
  
      <!-- Main FAB Button -->
      <button
        @click="toggleFAB"
        class="flex items-center justify-center w-14 h-14 rounded-full bg-[#0097B2] shadow-xl hover:shadow-2xl hover:bg-[#007A8C] transition-all duration-300 group"
      >
        <UIcon
          :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-light-bulb'"
          class="w-7 h-7 text-white group-hover:rotate-12 transition-transform cursor-pointer"
        />
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, defineProps, defineEmits } from 'vue'
  
  const emit = defineEmits(['select'])
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: true,
    },
  })
  
  const isHovered = ref(false)
  const isClicked = ref(false)
  
  const isOpen = computed(() => isHovered.value || isClicked.value)
  
  const fabItems = [
    { label: 'Calendar', icon: 'i-heroicons-calendar-days', component: 'Calendar' },
    { label: 'Newsletter', icon: 'i-heroicons-envelope', component: 'Newsletter' },
    { label: 'Announcements', icon: 'i-heroicons-megaphone', component: 'Announcements' },
  ]
  
  function toggleFAB() {
    isClicked.value = !isClicked.value
    if (isClicked.value) isHovered.value = false
  }
  
  function handleMouseEnter() {
    if (!isClicked.value) isHovered.value = true
  }
  
  function handleMouseLeave() {
    if (!isClicked.value) isHovered.value = false
  }
  
  function selectItem(component: string) {
    isClicked.value = false
    isHovered.value = false
    emit('select', component)
  }
  </script>
  
  <style scoped>
  .fab-stagger-enter-active,
  .fab-stagger-leave-active {
    transition: all 0.4s ease;
  }
  
  .fab-stagger-enter-from,
  .fab-stagger-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  
  .fab-stagger-leave-active {
    position: absolute;
  }
  </style>
  