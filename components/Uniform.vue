<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Weekly Uniform Schedule</h2>
  
      <!-- Day Navigation -->
      <div class="flex justify-center gap-2 mb-8 flex-wrap">
        <button 
          v-for="(day, index) in uniforms" 
          :key="day.day"
          @click="setActiveDay(index)"
          :class="[
            'px-4 py-2 rounded-lg font-medium',
            activeDay === index 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ day.day }}
        </button>
      </div>
  
      <!-- Gender Tabs -->
      <div class="flex gap-4 mb-6 justify-center border-b border-gray-200">
        <button
          v-for="gender in ['boys', 'girls']"
          :key="gender"
          @click="activeGender = gender"
          :class="[
            'pb-2 px-4 font-medium',
            activeGender === gender
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
        </button>
      </div>
  
      <!-- Uniform Display -->
      <div v-if="activeUniform" class="bg-white rounded-xl shadow-lg p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Full Outfit Display -->
          <div class="relative">
            <div class="bg-gray-100 rounded-xl p-4 aspect-square">
              <img 
                :src="activeUniform[activeGender].fullImage" 
                :alt="`Full ${activeDay} ${activeGender} uniform`"
                class="w-full h-full object-contain"
              >
            </div>
            <p class="text-center mt-4 text-sm text-gray-500">
              Full {{ activeGender }} uniform for {{ uniforms[activeDay].day }}
            </p>
          </div>
  
          <!-- Individual Items Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div 
              v-for="(item, key) in activeUniform[activeGender].items" 
              :key="key"
              class="group relative bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
            >
              <div class="aspect-square mb-2">
                <img 
                  :src="item.image" 
                  :alt="`${item.text}`"
                  class="w-full h-full object-contain"
                >
              </div>
              <div class="text-center">
                <h3 class="font-medium text-gray-900 capitalize">
                  {{ key.replace('-', ' ') }}
                </h3>
                <p class="text-sm text-gray-600">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  

  
  <script setup>
  import { ref, computed } from 'vue'
  
  const activeDay = ref(0)
  const activeGender = ref('boys')
  
  const uniforms = ref([
    {
      day: 'Monday',
      boys: {
        fullImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        items: {
          shirt: { text: 'White Formal Shirt', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-1.2.1&w=800&q=80' },
          tie: { text: 'School Striped Tie', image: 'https://images.unsplash.com/photo-1581655353564-df123a1df790?ixlib=rb-1.2.1&w=800&q=80' },
          trousers: { text: 'Grey Dress Pants', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2d?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Leather Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&w=800&q=80' },
          blazer: { text: 'Navy School Blazer', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'Black Dress Socks', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      },
      girls: {
        fullImage: 'https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          blouse: { text: 'White Peter Pan Blouse', image: 'https://images.unsplash.com/photo-1618354691373-d8514735ec8e?ixlib=rb-1.2.1&w=800&q=80' },
          skirt: { text: 'Plaid Knee-length Skirt', image: 'https://images.unsplash.com/photo-1636202339025-415d8f60a978?ixlib=rb-1.2.1&w=800&q=80' },
          cardigan: { text: 'Navy Cardigan', image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Mary Janes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'Navy Knee-high Socks', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' },
          blazer: { text: 'Navy School Blazer', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-1.2.1&w=800&q=80' }
        }
      }
    },
    {
      day: 'Tuesday',
      boys: {
        fullImage: 'https://images.unsplash.com/photo-1588072432904-843af35f02cd?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          polo: { text: 'Blue Polo Shirt', image: 'https://images.unsplash.com/photo-1624378439661-24c3d160c7e1?ixlib=rb-1.2.1&w=800&q=80' },
          shorts: { text: 'Navy Shorts', image: 'https://images.unsplash.com/photo-1589144669593-9d3e2548b3a5?ixlib=rb-1.2.1&w=800&q=80' },
          jersey: { text: 'Sports Jersey', image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'White Sneakers', image: 'https://images.unsplash.com/photo-1543508280-6406cac4c8f9?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'White Crew Socks', image: 'https://images.unsplash.com/photo-1621330396164-3c46d64d2a68?ixlib=rb-1.2.1&w=800&q=80' },
          cap: { text: 'Baseball Cap', image: 'https://images.unsplash.com/photo-1598983062497-5d0ad46a50c1?ixlib=rb-1.2.1&w=800&q=80' }
        }
      },
      girls: {
        fullImage: 'https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          polo: { text: 'Blue Polo Shirt', image: 'https://images.unsplash.com/photo-1624378439661-24c3d160c7e1?ixlib=rb-1.2.1&w=800&q=80' },
          skort: { text: 'Navy Skort', image: 'https://images.unsplash.com/photo-1589144669593-9d3e2548b3a5?ixlib=rb-1.2.1&w=800&q=80' },
          jersey: { text: 'Sports Jersey', image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'White Sneakers', image: 'https://images.unsplash.com/photo-1543508280-6406cac4c8f9?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'White Ankle Socks', image: 'https://images.unsplash.com/photo-1621330396164-3c46d64d2a68?ixlib=rb-1.2.1&w=800&q=80' },
          visor: { text: 'Sports Visor', image: 'https://images.unsplash.com/photo-1598983062497-5d0ad46a50c1?ixlib=rb-1.2.1&w=800&q=80' }
        }
      }
    },
    {
      day: 'Wednesday',
      boys: {
        fullImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          shirt: { text: 'White Lab Coat', image: 'https://images.unsplash.com/photo-1584302179602-e4ec5ddf7ffc?ixlib=rb-1.2.1&w=800&q=80' },
          tie: { text: 'School Crest Tie', image: 'https://images.unsplash.com/photo-1581655353564-df123a1df790?ixlib=rb-1.2.1&w=800&q=80' },
          trousers: { text: 'Black Dress Pants', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2d?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Oxfords', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&w=800&q=80' },
          sweater: { text: 'V-neck Sweater', image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'Black Dress Socks', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      },
      girls: {
        fullImage: 'https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          dress: { text: 'Pinafore Dress', image: 'https://images.unsplash.com/photo-1636202339025-415d8f60a978?ixlib=rb-1.2.1&w=800&q=80' },
          blouse: { text: 'White Blouse', image: 'https://images.unsplash.com/photo-1618354691373-d8514735ec8e?ixlib=rb-1.2.1&w=800&q=80' },
          tights: { text: 'Black Tights', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Loafers', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&w=800&q=80' },
          sweater: { text: 'Cardigan', image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'White Ankle Socks', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      }
    },
    {
      day: 'Thursday',
      boys: {
        fullImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          shirt: { text: 'White Dress Shirt', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-1.2.1&w=800&q=80' },
          tie: { text: 'School Crest Tie', image: 'https://images.unsplash.com/photo-1581655353564-df123a1df790?ixlib=rb-1.2.1&w=800&q=80' },
          trousers: { text: 'Grey Dress Pants', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2d?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Oxfords', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-1.2.1&w=800&q=80' },
          sweater: { text: 'V-neck Sweater', image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'Black Dress Socks', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      },
      girls: {
        fullImage: 'https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          skirt: { text: 'Plaid Skirt', image: 'https://images.unsplash.com/photo-1636202339025-415d8f60a978?ixlib=rb-1.2.1&w=800&q=80' },
          blouse: { text: 'White Blouse', image: 'https://images.unsplash.com/photo-1618354691373-d8514735ec8e?ixlib=rb-1.2.1&w=800&q=80' },
          cardigan: { text: 'Navy Cardigan', image: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Black Mary Janes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&w=800&q=80' },
          tights: { text: 'Navy Tights', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' },
          hairbow: { text: 'School Ribbon', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      }
    },
    {
      day: 'Friday',
      boys: {
        fullImage: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          polo: { text: 'School Spirit Shirt', image: 'https://images.unsplash.com/photo-1624378439661-24c3d160c7e1?ixlib=rb-1.2.1&w=800&q=80' },
          jeans: { text: 'Dark Wash Jeans', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-1.2.1&w=800&q=80' },
          jacket: { text: 'School Jacket', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Casual Sneakers', image: 'https://images.unsplash.com/photo-1543508280-6406cac4c8f9?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'White Crew Socks', image: 'https://images.unsplash.com/photo-1621330396164-3c46d64d2a68?ixlib=rb-1.2.1&w=800&q=80' },
          hat: { text: 'School Baseball Cap', image: 'https://images.unsplash.com/photo-1598983062497-5d0ad46a50c1?ixlib=rb-1.2.1&w=800&q=80' }
        }
      },
      girls: {
        fullImage: 'https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?ixlib=rb-1.2.1&w=800&q=80',
        items: {
          shirt: { text: 'School Spirit Shirt', image: 'https://images.unsplash.com/photo-1624378439661-24c3d160c7e1?ixlib=rb-1.2.1&w=800&q=80' },
          jeans: { text: 'Dark Wash Jeans', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-1.2.1&w=800&q=80' },
          jacket: { text: 'School Jacket', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&w=800&q=80' },
          shoes: { text: 'Casual Sneakers', image: 'https://images.unsplash.com/photo-1543508280-6406cac4c8f9?ixlib=rb-1.2.1&w=800&q=80' },
          socks: { text: 'Ankle Socks', image: 'https://images.unsplash.com/photo-1621330396164-3c46d64d2a68?ixlib=rb-1.2.1&w=800&q=80' },
          hairbow: { text: 'School Spirit Bow', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff07?ixlib=rb-1.2.1&w=800&q=80' }
        }
      }
    }
  ])
  
  const activeUniform = computed(() => uniforms.value[activeDay.value])
  
  function setActiveDay(index) {
    activeDay.value = index
  }
  </script>