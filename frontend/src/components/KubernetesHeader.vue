<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg 
              class="h-8 w-8 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
              />
            </svg>
          </div>
          <div class="ml-4">
            <h1 class="text-2xl font-bold text-gray-900">
              Dashboard Kubernetes
            </h1>
            <p class="text-sm text-gray-500">
              Gestion des ressources du cluster
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <button 
            @click="$emit('refresh')" 
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg 
              class="w-4 h-4 mr-2" 
              :class="{ 'animate-spin': loading }" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {{ loading ? 'Actualisation...' : 'Actualiser' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])
</script>
