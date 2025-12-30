<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Sélection des clusters</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="cluster in clusters" :key="cluster.id" class="relative">
        <label class="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            :value="cluster.id"
            :checked="selectedClusters.includes(cluster.id)"
            @change="toggleCluster(cluster.id)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div class="flex items-center space-x-2">
            <span 
              class="w-3 h-3 rounded-full" 
              :class="getClusterColorClass(cluster.color)"
            ></span>
            <span class="text-sm text-gray-700">{{ cluster.name }}</span>
          </div>
        </label>
        
        <!-- Indicateur de statut -->
        <div 
          v-if="clusterStatuses[cluster.id]"
          class="absolute top-0 right-0 -mt-1 -mr-1"
        >
          <span 
            v-if="clusterStatuses[cluster.id] === 'loading'"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
          >
            <svg class="animate-spin -ml-0.5 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span 
            v-else-if="clusterStatuses[cluster.id] === 'error'"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            :title="clusterErrors[cluster.id]"
          >
            !
          </span>
          <span 
            v-else-if="clusterStatuses[cluster.id] === 'success'"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            ✓
          </span>
        </div>
      </div>
    </div>
    
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        {{ selectedClusters.length }} cluster(s) sélectionné(s)
      </div>
      <div class="space-x-2">
        <button
          @click="selectAll"
          class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
        >
          Tout sélectionner
        </button>
        <button
          @click="deselectAll"
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          Tout désélectionner
        </button>
      </div>
    </div>
    
    <!-- Affichage des erreurs -->
    <div v-if="hasErrors" class="mt-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <h4 class="text-sm font-medium text-red-800 mb-1">Erreurs de connexion</h4>
        <ul class="text-xs text-red-700 space-y-1">
          <li v-for="(error, clusterId) in clusterErrors" :key="clusterId">
            <strong>{{ getClusterName(clusterId) }}:</strong> {{ error }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { clusters } from '../config/clusters'

const props = defineProps({
  selectedClusters: {
    type: Array,
    default: () => []
  },
  clusterStatuses: {
    type: Object,
    default: () => ({})
  },
  clusterErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:selectedClusters'])

const hasErrors = computed(() => {
  return Object.keys(props.clusterErrors).length > 0
})

function toggleCluster(clusterId) {
  const newSelection = [...props.selectedClusters]
  const index = newSelection.indexOf(clusterId)
  
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(clusterId)
  }
  
  emit('update:selectedClusters', newSelection)
}

function selectAll() {
  emit('update:selectedClusters', clusters.map(c => c.id))
}

function deselectAll() {
  emit('update:selectedClusters', [])
}

function getClusterName(clusterId) {
  const cluster = clusters.find(c => c.id === clusterId)
  return cluster ? cluster.name : clusterId
}

function getClusterColorClass(color) {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }
  return colorMap[color] || 'bg-gray-500'
}
</script>
