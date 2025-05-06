<template>
  <div class="w-full bg-teal-800 text-white text-sm pl-20">
    <div class="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 gap-3 md:gap-0">
      <!-- Social Media -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        
        <div v-if="showMenu" class="flex gap-2">
          <div
            v-for="icon in socialIcons"
            :key="icon"
            class="bg-teal-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-teal-600 cursor-pointer transition"
          >
            <UIcon :name="icon" class="text-white w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div
        class="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 text-white text-sm"
      >
        <div
          v-for="item in contactItems"
          :key="item.text"
          class="flex items-center gap-2"
        >
          <UIcon :name="item.icon" class="text-[#00e0c2] w-4 h-4" />
          <span>{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const config = useRuntimeConfig();
const showMenu = config.public.showMenu === '1'


const socialIcons = [
  'i-fa6-brands-facebook-f',
  'i-fa6-brands-instagram',
  'i-fa6-brands-youtube',
  'i-fa6-brands-whatsapp',
]

const contactItems = [
  { icon: 'i-heroicons-map-pin-solid', text: config.public.address },
  { icon: 'i-heroicons-envelope-solid', text: config.public.email },
  { icon: 'i-heroicons-phone-solid', text: config.public.tel },
]
</script>
