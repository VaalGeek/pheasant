<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Define prop type
interface StaffProp {
  _uid: string;
  name: string;
  role: string[] | string; // Allow both array and string
  grade?: string;
  image?: { // Make optional
    filename?: string;
  };
  category: string[] | string; // Allow both array and string
}

const props = defineProps<{
  staffData: StaffProp[];
}>();

// Convert props to internal structure
interface Staff {
  name: string;
  role: string[];
  image: string;
  categories: string[];
}

// Initial category
const currentCategory = ref<string>("SMT");
const staffSection = ref<HTMLElement | null>(null);
// Extract categories from staffData dynamically
const categories = computed(() => {
  const unique = new Set<string>();
  (props.staffData || []).forEach(staff => {
    const cats = Array.isArray(staff.category) ? staff.category : [staff.category]
    cats.forEach(cat => cat && unique.add(cat))
  });
  return Array.from(unique);
});

// Normalize staffData
const staffList = computed<Staff[]>(() =>
  (props.staffData || []).map((staff) => ({
    name: staff.name || 'Unknown',
    role: Array.isArray(staff.role) ? staff.role : [staff.role || ''],
    image: staff.image?.filename || '/default-staff.jpg',
    categories: Array.isArray(staff.category) ? staff.category : [staff.category || '']
  }))
);

const sortedCategories = computed(() => {
  const otherCategories = categories.value.filter(
    (category) => category !== "SMT"
  );
  const sortedOtherCategories = otherCategories.sort((a, b) =>
    a.localeCompare(b)
  );
  return ["SMT", ...sortedOtherCategories];
});

// Filtered staff
const filteredStaff = computed(() => {
  const categoryStaff = staffList.value.filter(staff => 
    staff.categories.includes(currentCategory.value)
  );
  return currentCategory.value === "SMT" 
    ? categoryStaff 
    : categoryStaff.sort((a, b) => a.name.localeCompare(b.name));
});

// Animation functions
const setupAnimations = () => {
  // Header animation
  gsap.from("#staffHeader", {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#staffSection",
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  // Category buttons animation
  gsap.from(".category-button", {
    y: 50,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#staffSection",
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  // Initial staff items animation
  animateStaffList();
};



const animateStaffList = () => {
  gsap.fromTo(
    ".staff-item",
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#staffSection",
        start: "top 75%",
        toggleActions: "play none none none"
      }
    }
  );
};

// On category change
const changeCategory = async (category: string) => {
  currentCategory.value = category;
  await nextTick();
  
  // Animate new items without ScrollTrigger
  gsap.fromTo(
    ".staff-item",
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    }
  );
};

onMounted(() => {
  setupAnimations();
});
</script>

<template>
  <section id="staffSection" ref="staffSection" class="bg-blue-50 min-h-screen w-full p-4 pt-24 bg-staff bg-no-repeat bg-center bg-cover bg-fixed object-contain">
    <h1 id="staffHeader" class="text-white text-center mb-5 font-bold font-playfairsc text-3xl sm:text-4xl lg:text-5xl">
      Our Staff
    </h1>

    <!-- Category Tabs -->
    <div class="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
      <button 
        v-for="category in sortedCategories" 
        :key="category"
        class="category-button px-3 sm:px-4 py-2 text-sm sm:text-base lg:text-xl font-medium rounded w-auto min-w-[100px]"
        :class="[
          currentCategory === category
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]" 
        @click="changeCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <!-- Staff Grid -->
    <div v-if="filteredStaff.length" class="flex flex-wrap justify-center gap-6">
      <div 
        v-for="staff in filteredStaff" 
        :key="staff.name"
        class="bg-white shadow-md rounded-lg overflow-hidden w-80 staff-item"
      >
        <img :src="staff.image" alt="Staff image" class="w-full h-48 object-cover" />
        <div class="p-4 text-center">
          <h3 class="text-lg font-semibold">{{ staff.name }}</h3>
          <div class="flex flex-wrap justify-center gap-2 mt-2">
            <span 
              v-for="r in staff.role" 
              :key="r"
              class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
            >
              {{ r }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 mt-6">
      No staff available for this category.
    </div>
  </section>
</template>

<style scoped>
/* Add any custom styles here */
</style>