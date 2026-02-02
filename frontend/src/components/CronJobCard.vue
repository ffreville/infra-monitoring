<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
    <!-- En-tête -->
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-medium text-gray-900 truncate">
        {{ cronjob.name }}
      </h4>
      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {{ cronjob.namespace }}
      </span>
    </div>
    
    <!-- Tableau des versions par cluster -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cluster
            </th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image:Version
            </th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière exec.
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="cluster in availableClusters" :key="cluster.id">
            <td class="px-3 py-2 whitespace-nowrap">
              <div class="flex items-center">
                <span 
                  class="w-2 h-2 rounded-full mr-2" 
                  :class="getClusterColorClass(cluster.color)"
                ></span>
                <span class="text-xs font-medium text-gray-900">{{ cluster.name }}</span>
              </div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <span 
                class="text-xs font-mono"
                :class="getVersionClass(cronjob.clusterVersions[cluster.id])"
              >
                {{ formatVersion(cronjob.clusterVersions[cluster.id]?.version) }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <span class="text-xs font-mono">
                {{ cronjob.clusterVersions[cluster.id]?.schedule || cronjob.schedule || 'N/A' }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <span 
                class="text-xs font-medium"
                :class="getStatusClass(cronjob.clusterVersions[cluster.id])"
              >
                {{ getStatusText(cronjob.clusterVersions[cluster.id]) }}
              </span>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <span class="text-xs">
                {{ formatLastRun(cronjob.clusterVersions[cluster.id]?.lastRun) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Actions -->
    <!--div class="mt-3 flex justify-end space-x-2">
      <button 
        @click="$emit('view-details', cronjob)"
        class="text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        Détails
      </button>
      <button 
        @click="$emit('trigger', cronjob)"
        class="text-xs text-green-600 hover:text-green-800 font-medium"
      >
        Déclencher
      </button>
    </div-->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { clusters } from '../config/clusters'

const props = defineProps({
  cronjob: {
    type: Object,
    required: true
  },
  selectedClusters: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-details', 'trigger'])

// Obtenir seulement les clusters sélectionnés
const availableClusters = computed(() => {
  return clusters.filter(cluster => props.selectedClusters.includes(cluster.id))
})

function getClusterColorClass(color) {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }
  return colorMap[color] || 'bg-gray-500'
}

function getVersionClass(clusterVersion) {
  const version = clusterVersion?.version
  return version === 'N/A' ? 'text-gray-400' : 'text-gray-700'
}

function getStatusClass(clusterVersion) {
  if (!clusterVersion) return 'text-gray-400'
  
  const suspend = clusterVersion.suspend
  const active = clusterVersion.active || 0
  
  if (suspend) {
    return 'text-yellow-600'
  } else if (active > 0) {
    return 'text-blue-600'
  } else {
    return 'text-green-600'
  }
}

function getStatusText(clusterVersion) {
  if (!clusterVersion) return 'N/A'
  
  const suspend = clusterVersion.suspend
  const active = clusterVersion.active || 0
  
  if (suspend) {
    return 'Suspendu'
  } else if (active > 0) {
    return `Actif (${active})`
  } else {
    return 'Actif'
  }
}

function formatVersion(version) {
  if (!version || version === 'N/A') return 'N/A'
  
  // Extraire juste le nom de l'image et la version si possible
  const parts = version.split(':')
  if (parts.length > 1) {
    const imageName = parts[0].split('/').pop()
    return `${imageName}:${parts[1]}`
  }
  
  return version.split('/').pop()
}

function formatLastRun(lastRun) {
  if (!lastRun || lastRun === 'N/A') return 'N/A'
  
  try {
    const date = new Date(lastRun)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 60) {
      return `Il y a ${diffMins}min`
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`
    } else {
      return `Il y a ${diffDays}j`
    }
  } catch (error) {
    return 'N/A'
  }
}
</script>
