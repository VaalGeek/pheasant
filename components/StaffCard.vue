<template>
    <div class="bg-white rounded-lg shadow-lg p-4 w-64 text-center">
        <img :src="employee.image" :alt="employee.name" class="w-64 h-64 rounded-full mx-auto mb-4" />
        <h3 class="text-lg font-semibold">{{ employee.name }}</h3>
    </div>
</template>
<script setup lang="ts">
const props = defineProps(['employee'])
</script>