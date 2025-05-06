<template>
    <nav class="shadow-md bg-[#0097B2]">
      <div class="container mx-auto flex justify-between items-center px-4 py-3">
        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-bold text-teal-700">
          <Logo />
        </NuxtLink>
        <h1 class="text-3xl font-bold text-white">SchoolComm Dashboard</h1>
  
  
  
       
  
  
        <!-- Mobile Contact Info (visible only on small screens) -->
        <div class="md:hidden flex flex-col ml-4 gap-1 text-white text-xs">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
            <span>Sebokeng Zone 10</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            <span>+27 71 234 5678</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            <span>info@setlabothja.co.za</span>
          </div>
        </div>
  
  
       
      </div>
    </nav>
  
    
  </template>
  
  <script setup lang="ts">

  
 
  </script>
  
  <style scoped>
  /* Add transition for smooth slide-in and slide-out */
  .transition-transform {
    transition: transform 0.3s ease-in-out;
  }
  </style>
  