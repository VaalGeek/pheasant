<template>
  <section class="relative h-[80vh] bg-gray-900 text-white overflow-hidden">
    <div class="absolute inset-0 w-full h-full">
      <div v-for="(slide, index) in slides" :key="index" class="absolute inset-0 w-full h-full">
        <!-- Image Slide -->
        <div class="absolute inset-0 overflow-hidden">
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${slide.image})` }"
            ref="images"
          />
        </div>

        <!-- Text Content -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-full max-w-3xl px-6 text-center">
            <h2 class="text-4xl md:text-5xl font-bold mb-4" ref="titles">
              {{ slide.title }}
            </h2>
            <p class="text-lg md:text-xl" ref="descriptions">
              {{ slide.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 bg-black/40"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, type Ref } from 'vue'
import gsap from 'gsap'

const slides = [
  {
    title: 'Unlock Your Potential With Eduka',
    description: 'Empowering students through quality education and modern tools.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2070&q=80'
  },
  {
    title: 'Learn from Experts Anywhere',
    description: 'Join thousands of learners around the world from the comfort of your home.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2071&q=80'
  },
  {
    title: 'Achieve Your Academic Dreams',
    description: 'With the right guidance and community support, anything is possible.',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=2071&q=80'
  }
]

const images = ref<HTMLElement[]>([])
const titles = ref<HTMLElement[]>([])
const descriptions = ref<HTMLElement[]>([])

onMounted(async () => {
  await nextTick()

  const totalSlides = slides.length
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })

  // Initial states
  gsap.set(images.value, { opacity: 0 })
  gsap.set(titles.value, { y: -60, opacity: 0 })
  gsap.set(descriptions.value, { y: -40, opacity: 0 })

  slides.forEach((_, index) => {
    const slideStart = index * 7 // Each slide lasts 7 seconds

    // Image fade in
    tl.to(images.value[index], {
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out'
    }, slideStart)

    // Title appears after image
    tl.to(titles.value[index], {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, slideStart + 1.2)

    // Description appears after title
    tl.to(descriptions.value[index], {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, slideStart + 2.2)

    // Hold, then fade out text
    tl.to([titles.value[index], descriptions.value[index]], {
      opacity: 0,
      y: -50,
      duration: 0.6,
      ease: 'power2.in'
    }, slideStart + 5.2)

    // Image fade out
    tl.to(images.value[index], {
      opacity: 0,
      duration: 1,
      ease: 'power2.in'
    }, slideStart + 5.8)
  })
})
</script>
