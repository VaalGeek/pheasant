<template>
  <!-- Added id to match navigation -->
  <section
    id="values"
    class="relative min-h-screen w-full bg-cover bg-fixed bg-center"
    style="background-image: linear-gradient(rgba(0, 32, 78, 0.9), rgba(0, 32, 78, 0.7)), url('/pattern.svg');"
  >
    <div class="mx-auto py-24 px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <!-- Metric Card: Learners -->
        <div class="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div class="flex items-baseline justify-center gap-2 mb-4">
            <span ref="learnersCount" class="font-oswald font-bold text-6xl md:text-7xl text-blue-400">0</span>
            <span class="text-3xl text-blue-200">+</span>
          </div>
          <h3 class="text-center text-lg md:text-xl font-semibold text-blue-100 uppercase tracking-wide">
            Dedicated Learners
          </h3>
        </div>

        <!-- Core Values -->
        <div class="lg:col-span-1 order-first lg:order-none">
          <h2
            ref="valuesHeader"
            class="text-center mb-12 font-playfairsc font-bold text-5xl md:text-6xl text-white values-title"
          >
            Our Core Values
          </h2>
          <ul class="space-y-8">
            <li
              v-for="(value, index) in values"
              :key="index"
              class="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ease-in-out"
              :ref="el => valueItems[index] = el"
            >
              <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l"></div>
              <div class="pl-8">
                <h3 class="font-oswald text-3xl md:text-4xl font-bold text-blue-400 mb-2">{{ value.title }}</h3>
                <p class="text-blue-100 text-lg leading-relaxed">{{ value.description }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Metric Card: Educators -->
        <div class="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div class="flex items-baseline justify-center gap-2 mb-4">
            <span ref="educatorsCount" class="font-oswald font-bold text-6xl md:text-7xl text-blue-400">0</span>
            <span class="text-3xl text-blue-200">+</span>
          </div>
          <h3 class="text-center text-lg md:text-xl font-semibold text-blue-100 uppercase tracking-wide">
            Expert Educators
          </h3>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useScrollTriggerAnimation from '~/composables/useScrollAnimation'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const learnersCount = ref(null)
const educatorsCount = ref(null)
const valuesHeader = ref(null)
const valueItems = ref([])

const props = defineProps({
  learners: { type: Number, default: 1805 },
  educators: { type: Number, default: 45 },
  values: {
    type: Array,
    default: () => [
      {
        title: 'Respect',
        description: 'Cultivating mutual understanding and appreciation in our learning community'
      },
      {
        title: 'Integrity',
        description: 'Upholding ethical principles in all academic and social interactions'
      },
      {
        title: 'Excellence',
        description: 'Striving for continuous improvement in educational outcomes'
      }
    ]
  }
})

const setupAnimations = () => {
  const tl = gsap.timeline({ paused: true })

  gsap.set([learnersCount.value, educatorsCount.value], { innerText: 0 })
  gsap.set(valueItems.value, { x: -50, opacity: 0 })
  gsap.set(valuesHeader.value, { opacity: 0, y: 20 })

  tl.to([learnersCount.value, educatorsCount.value], {
    innerText: (i) => i === 0 ? props.learners : props.educators,
    duration: 2,
    snap: { innerText: 1 },
    ease: "power3.out",
    overwrite: true
  }, 0)

  tl.to(valuesHeader.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "back.out(1.7)"
  }, 0.4)

  tl.to(valueItems.value, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  }, 0.6)

  return tl
}

useScrollTriggerAnimation('#values', setupAnimations)

onMounted(() => {
  gsap.set(valueItems.value, { x: -50, opacity: 0 })
  gsap.set(valuesHeader.value, { opacity: 0, y: 20 })
  gsap.set([learnersCount.value, educatorsCount.value], { innerText: 0 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#values",
      start: "top 75%",
      end: "bottom 25%",
      toggleActions: "play none none none",
      markers: false,
      onEnter: () => ScrollTrigger.refresh()
    }
  })

  tl.to(learnersCount.value, {
    innerText: props.learners,
    duration: 2,
    snap: { innerText: 1 },
    ease: "power3.out"
  }, 0)

  tl.to(educatorsCount.value, {
    innerText: props.educators,
    duration: 2,
    snap: { innerText: 1 },
    ease: "power3.out"
  }, 0.2)

  tl.to(valuesHeader.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "back.out(1.7)"
  }, 0.4)

  tl.to(valueItems.value, {
    x: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  }, 0.6)
})
</script>

<style>
/* Global styles */
.values-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
