<template>
  <Transition name="slide-panel">
    <div
      v-if="visible"
      class="fixed right-0 w-full md:w-[480px] z-50 bg-white shadow-lg flex flex-col overflow-hidden
             top-24 h-[calc(100vh-6rem)] md:top-0 md:h-full"
    >
      <!-- Close Button -->
      <div class="flex justify-end p-4 shrink-0">
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>
      </div>

      <!-- Slot Content -->
      <div class="flex-1 overflow-y-auto px-4 relative">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  visible: Boolean,
})
defineEmits(['close'])
</script>

<style scoped>
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.4s ease;
}
.slide-panel-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-panel-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-panel-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
