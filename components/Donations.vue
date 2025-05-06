<template>
    <div class="p-6 space-y-12 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-gray-900">🎓 Support Our School</h2>
        <p class="text-gray-600 text-lg">
          Total Raised: <span class="text-[#0097B2] font-bold">{{ formatCurrency(totalRaised) }}</span>
        </p>
      </div>
  
      <!-- Campaign List -->
      <div class="space-y-6">
        <div 
          v-for="campaign in activeCampaigns"
          :key="campaign.id"
          class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ campaign.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ campaign.description }}</p>
            </div>
            <span class="text-sm text-gray-400 whitespace-nowrap">
              ⏳ Ends {{ formatDate(campaign.endDate) }}
            </span>
          </div>
  
          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1 text-gray-600 font-medium">
              <span>{{ formatCurrency(campaign.currentAmount) }} raised</span>
              <span>Goal: {{ formatCurrency(campaign.goal) }}</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-[#0097B2] transition-all duration-700 ease-out"
                :style="{ width: `${campaignProgress(campaign)}%` }"
              ></div>
            </div>
          </div>
  
          <!-- Donation Button -->
          <button
            @click="selectCampaign(campaign)"
            class="w-full bg-[#0097B2] hover:bg-[#007A8C] text-white py-2.5 px-4 rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            ❤️ Donate Now
          </button>
        </div>
      </div>
  
      <!-- Donation Form Modal -->
      <transition name="fade">
        <div v-if="selectedCampaign" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-gray-800">
                Donate to "{{ selectedCampaign.title }}"
              </h3>
              <button 
                @click="selectedCampaign = null"
                class="text-gray-500 hover:text-red-500 transition"
              >
                <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
              </button>
            </div>
  
            <form @submit.prevent="handleDonation" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Amount (USD)</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    v-model="donationAmount"
                    type="number"
                    min="1"
                    step="1"
                    required
                    class="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0097B2] focus:outline-none"
                    placeholder="e.g. 25"
                  >
                </div>
              </div>
  
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
                <select
                  v-model="paymentMethod"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0097B2] focus:outline-none"
                >
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
  
              <button
                type="submit"
                class="w-full bg-[#0097B2] hover:bg-[#007A8C] text-white py-2.5 px-4 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 transition"
              >
                <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5" />
                Confirm Donation
              </button>
            </form>
          </div>
        </div>
      </transition>
  
      <!-- Recent Donors -->
      <div class="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-100">
        <h3 class="text-xl font-bold text-gray-800 mb-5">🫶 Recent Supporters</h3>
        <div class="space-y-3">
          <div 
            v-for="donor in recentDonors"
            :key="donor.id"
            class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gray-100 rounded-full">
                <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ donor.name }}</p>
                <p class="text-sm text-gray-500">{{ formatCurrency(donor.amount) }}</p>
              </div>
            </div>
            <span class="text-sm text-gray-400 whitespace-nowrap">{{ formatDate(donor.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  
  interface DonationCampaign {
    id: number
    title: string
    description: string
    goal: number
    currentAmount: number
    endDate: Date
  }
  
  interface RecentDonor {
    id: number
    name: string
    amount: number
    date: Date
  }
  
  // Sample data
  const campaigns = ref<DonationCampaign[]>([
    {
      id: 1,
      title: 'Technology Upgrade Fund',
      description: 'New computers and STEM lab equipment for our students',
      goal: 15000,
      currentAmount: 8450,
      endDate: new Date(2024, 11, 31)
    },
    {
      id: 2,
      title: 'Library Expansion Project',
      description: 'Expand our learning resources and reading spaces',
      goal: 8000,
      currentAmount: 3200,
      endDate: new Date(2024, 8, 15)
    },
    {
      id: 3,
      title: 'Student Lunch Program',
      description: 'Support free lunches for students in need',
      goal: 5000,
      currentAmount: 2100,
      endDate: new Date(2024, 6, 30)
    }
  ])
  
  const recentDonors = ref<RecentDonor[]>([
    { id: 1, name: 'Anonymous', amount: 100, date: new Date(2024, 4, 1) },
    { id: 2, name: 'Sarah Johnson', amount: 250, date: new Date(2024, 3, 28) },
    { id: 3, name: 'Mike Chen', amount: 500, date: new Date(2024, 3, 25) }
  ])
  
  // Donation state
  const selectedCampaign = ref<DonationCampaign | null>(null)
  const donationAmount = ref('')
  const paymentMethod = ref('credit')
  
  // Computed properties
  const totalRaised = computed(() => 
    campaigns.value.reduce((sum, campaign) => sum + campaign.currentAmount, 0)
  )
  
  const activeCampaigns = computed(() => 
    campaigns.value.filter(campaign => new Date(campaign.endDate) > new Date())
  )
  
  // Helpers
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  
  const formatDate = (date: Date) => 
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  
  const campaignProgress = (campaign: DonationCampaign) => 
    Math.min((campaign.currentAmount / campaign.goal) * 100, 100)
  
  // Donation handling
  const selectCampaign = (campaign: DonationCampaign) => {
    selectedCampaign.value = campaign
    donationAmount.value = ''
  }
  
  const handleDonation = () => {
    const amount = parseFloat(donationAmount.value)
    if (selectedCampaign.value && amount > 0) {
      // Update campaign progress
      selectedCampaign.value.currentAmount += amount
      
      // Add to recent donors
      recentDonors.value.unshift({
        id: Date.now(),
        name: 'Anonymous',
        amount,
        date: new Date()
      })
      
      // Reset form
      selectedCampaign.value = null
      donationAmount.value = ''
      paymentMethod.value = 'credit'
    }
  }
  </script>