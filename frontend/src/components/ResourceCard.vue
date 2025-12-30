<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <!-- En-tête de la carte -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <div 
            class="w-3 h-3 rounded-full mr-3" 
            :class="colorClass"
          ></div>
          {{ title }}
          <span 
            class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="badgeClass"
          >
            {{ resources.length }}
          </span>
        </h3>
      </div>
      
      <!-- Contenu -->
      <div v-if="resources.length === 0" class="text-center py-8 text-gray-500">
        {{ emptyMessage }}
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <slot :resources="resources"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  resources: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['deployments', 'cronjobs', 'statefulsets'].includes(value)
  },
  emptyMessage: {
    type: String,
    default: 'Aucune ressource trouvée'
  }
})

const colorClass = computed(() => {
  const colors = {
    deployments: 'bg-green-500',
    cronjobs: 'bg-yellow-500',
    statefulsets: 'bg-purple-500'
  }
  return colors[props.type]
})

const badgeClass = computed(() => {
  const classes = {
    deployments: 'bg-green-100 text-green-800',
    cronjobs: 'bg-yellow-100 text-yellow-800',
    statefulsets: 'bg-purple-100 text-purple-800'
  }
  return classes[props.type]
})
</script>
