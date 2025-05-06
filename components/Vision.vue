<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const images = [
  'https://picsum.photos/1920/1080?random=1',
  'https://picsum.photos/1920/1080?random=2',
  'https://picsum.photos/1920/1080?random=3',
  'https://picsum.photos/1920/1080?random=4',
  'https://picsum.photos/1920/1080?random=5',
  'https://picsum.photos/1920/1080?random=6',
]

onMounted(() => {
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#visionSection',
      start: 'top 70%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      markers: false,
    },
  })

  timeline.from(['.vision-text', '.mission-text'], {
    x: -100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.3,
    ease: 'power3.out',
  })

  timeline.from('#visionCarousel', {
    x: 100,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '<0.2')
})
</script>

<template>
  <section id="visionSection" class="relative overflow-hidden py-20 md:py-32 px-4 md:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
      <!-- Text Content -->
      <div class="space-y-16">
        <div class="vision-text p-8 rounded-xl bg-white bg-opacity-50 backdrop-blur-sm border border-gray-100 shadow-md">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold font-playfairsc text-gray-800">
              Our Vision
            </h2>
          </div>
          <p class="text-lg md:text-xl text-gray-600 leading-relaxed">
            Established in 1992, Setlabotjha Primary School serves the EATONSIDE community on the fringes of EVATON, 
            providing foundational education that empowers learners to reach their full potential.
          </p>
        </div>

        <div class="mission-text">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold font-playfairsc text-gray-800">
              Our Mission
            </h2>
          </div>
          <p class="text-lg md:text-xl text-gray-600 leading-relaxed">
            To deliver exceptional, inclusive education that equips diverse learners with the academic foundation, 
            critical thinking skills, and moral compass needed for lifelong success.
          </p>
        </div>
      </div>

      <!-- Carousel -->
      <div id="visionCarousel" class="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/10]">
        <Carousel 
          class="h-full"
          :time="5000"
          :direction="'horizontal'"
          :items="images"
          :type="'images'"
          :controls="true"
          :indicators="true"
        />
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute inset-0 -z-10 opacity-10" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cud3Mub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgMEwwIDZWNmg2bDYgNlY2SDZMNCA0aDJWMkg0djJIMnYySDJWMHoiIGZpbGw9IiM0NjdmZmYiLz4KPC9zdmc+Cg==')"></div>
  </section>
</template>

