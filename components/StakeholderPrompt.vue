<!-- components/StakeholderPrompt.vue -->
<template>
    <div class="fixed bottom-4 left-4 bg-white shadow-lg p-4 rounded-xl max-w-sm z-50">
      <p class="mb-3 text-gray-800">
        Are you a parent, learner, or staff member who received a letter with a QR code from the school but are no longer receiving notifications
      </p>
      <div class="flex justify-end gap-3">
        <button @click="$emit('verify')" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Yes, verify
        </button>
        <button @click="$emit('dismiss')" class="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300">
          No, just browsing
        </button>
      </div>
    </div>
  </template>
  
  

  