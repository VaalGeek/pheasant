<script setup lang="ts">
import { onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  gsap.set("#historyContent", { x: -50, opacity: 0 });
  gsap.set("#historyMedia", { x: 50, opacity: 0 });
  gsap.set(".history-item", { y: 30, opacity: 0 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#historySection",
      start: "top 70%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
    },
  });

  timeline.to("#historyContent", {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out",
  });

  timeline.to("#historyMedia", {
    x: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out",
  }, "<0.2");

  timeline.to(".history-item", {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.2)",
  }, "<0.4");
});
</script>

<template>
  <section id="historySection" class="relative py-24 md:py-32 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <!-- Text Content -->
        <div id="historyContent" class="relative z-10">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold font-playfairsc text-gray-800 dark:text-gray-100">
              Our Journey Through Time
            </h2>
          </div>

          <div class="space-y-6">
            <div class="history-item p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
              <h3 class="text-xl font-semibold text-blue-600 mb-3">Established in 1992</h3>
              <p class="text-gray-600 leading-relaxed">
                Founded in the heart of Evaton, Setlabotjha Primary began as a small community initiative
                with just 3 classrooms and a vision for quality education.
              </p>
            </div>

            <div class="history-item p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
              <h3 class="text-xl font-semibold text-blue-600 mb-3">Milestone Achievements</h3>
              <ul class="space-y-3 list-disc pl-5 text-gray-600">
                <li>1998: First computer lab in the district</li>
                <li>2005: Awarded Blue Ribbon School status</li>
                <li>2012: Expanded to include 15 new classrooms</li>
              </ul>
            </div>

            <div class="history-item p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default">
              <h3 class="text-xl font-semibold text-blue-600 mb-3">Today's Legacy</h3>
              <p class="text-gray-600 leading-relaxed">
                Now serving 800+ students annually, we continue to innovate while maintaining our
                core values of community, excellence, and empowerment.
              </p>
            </div>
          </div>
        </div>

        <!-- Media Content -->
        <div id="historyMedia" class="relative">
          <div class="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
            <img src="https://picsum.photos/620/780?random=1" alt="School history"
              class="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105" />
          </div>

          <!-- Decorative Overlay (mimics ::before) -->
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-blue-200 rounded-2xl opacity-50 -z-10 rotate-[15deg]"></div>

          <div class="absolute -bottom-8 -left-8 z-0 hidden lg:block">
            <div class="w-64 h-64 bg-blue-100 rounded-2xl transform rotate-12"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="absolute inset-0 -z-10 opacity-10"
      style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cud3Mub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIyQzE3LjUyMjggMjIgMjIgMTcuNTIyOCAyMiAxMkMyMiA2LjQ3NzE1IDE3LjUyMjggMiAxMiAyQzYuNDc3MTUgMiAyIDYuNDc3MTUgMiAxMkMyIDE3LjUyMjggNi40NzcxNSAyMiAxMiAyMloiIHN0cm9rZT0iIzQ2N2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPgo=')">
    </div>
  </section>
</template>
