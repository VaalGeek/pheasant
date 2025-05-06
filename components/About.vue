<script setup lang="ts">
import History from './History.vue';
import Uniform from './Uniform.vue';
import Values from './Values.vue';
import Vision from './Vision.vue';

</script>

<template>
     <ClientOnly>
        <Vision id="vision"/>
        <Values id="values"/>
        <History id="history"/>
        <Uniform id="uniform"/>
     </ClientOnly>
</template>