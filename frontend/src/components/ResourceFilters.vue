<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex flex-col gap-4">
      <!-- En-tête avec compteur et reset -->
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Filtres</h3>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">
            <span class="font-medium">{{ totalCount }}</span> 
            ressource(s) trouvée(s)
          </div>
          <button
            @click="$emit('reset-filters')"
            class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Filtres principaux en ligne -->
      <div class="flex flex-wrap gap-4 items-center">
        <!-- Dropdown Clusters -->
        <div class="relative" ref="clusterDropdown">
          <button
            @click="toggleClusterDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            <span v-if="selectedClusters.length === 0">Aucun cluster</span>
            <span v-else>{{ selectedClusters.length }} cluster{{ selectedClusters.length > 1 ? 's' : '' }}</span>
            <svg class="w-4 h-4 ml-2 transition-transform duration-200" :class="{ 'rotate-180': showClusterDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Menu déroulant Clusters -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="showClusterDropdown"
              class="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <!-- Option "Tous les clusters" -->
              <div
                @click="toggleAllClusters"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="isAllClustersSelected"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <span class="ml-3 font-medium text-gray-900">Tous les clusters</span>
                </div>
              </div>
              
              <!-- Séparateur -->
              <div class="border-t border-gray-200 my-1"></div>
              
              <!-- Clusters individuels -->
              <div
                v-for="cluster in clusterList"
                :key="cluster.id"
                @click="toggleCluster(cluster.id)"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="selectedClusters.includes(cluster.id)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <div class="ml-3 flex items-center">
                    <span 
                      class="w-3 h-3 rounded-full mr-2" 
                      :class="getClusterColorClass(cluster.color)"
                    ></span>
                    <span class="text-gray-900">{{ cluster.name }}</span>
                    <!-- Indicateur de statut -->
                    <span 
                      v-if="clusterStatuses[cluster.id]"
                      class="ml-2"
                    >
                      <span 
                        v-if="clusterStatuses[cluster.id] === 'loading'"
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        ⏳
                      </span>
                      <span 
                        v-else-if="clusterStatuses[cluster.id] === 'error'"
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        :title="clusterErrors[cluster.id]"
                      >
                        ❌
                      </span>
                      <span 
                        v-else-if="clusterStatuses[cluster.id] === 'success'"
                        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        ✅
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Dropdown Namespaces -->
        <div class="relative" ref="namespaceDropdown">
          <button
            @click="toggleNamespaceDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
            </svg>
            <span v-if="selectedNamespaces.length === 0">Tous les namespaces</span>
            <span v-else>{{ selectedNamespaces.length }} namespace{{ selectedNamespaces.length > 1 ? 's' : '' }}</span>
            <svg class="w-4 h-4 ml-2 transition-transform duration-200" :class="{ 'rotate-180': showNamespaceDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Menu déroulant Namespaces -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="showNamespaceDropdown"
              class="absolute z-10 mt-1 w-80 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              <!-- Option "Tous les namespaces" -->
              <div
                @click="toggleAllNamespaces"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="selectedNamespaces.length === 0"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <span class="ml-3 font-medium text-gray-900">Tous les namespaces</span>
                </div>
              </div>
              
              <!-- Séparateur -->
              <div class="border-t border-gray-200 my-1"></div>
              
              <!-- Namespaces individuels -->
              <div
                v-for="ns in namespaces"
                :key="ns.name"
                @click="toggleNamespace(ns.name)"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="selectedNamespaces.includes(ns.name)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <span class="ml-3 text-gray-900">{{ ns.name }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Dropdown Types de ressources -->
        <div class="relative" ref="resourceTypeDropdown">
          <button
            @click="toggleResourceTypeDropdown"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            <span v-if="selectedResourceTypes.length === 0">Tous les types</span>
            <span v-else>{{ selectedResourceTypes.length }} type{{ selectedResourceTypes.length > 1 ? 's' : '' }}</span>
            <svg class="w-4 h-4 ml-2 transition-transform duration-200" :class="{ 'rotate-180': showResourceTypeDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Menu déroulant Types de ressources -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="showResourceTypeDropdown"
              class="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <!-- Option "Tous les types" -->
              <div
                @click="toggleAllResourceTypes"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="selectedResourceTypes.length === 0"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <span class="ml-3 font-medium text-gray-900">Tous les types</span>
                </div>
              </div>
              
              <!-- Séparateur -->
              <div class="border-t border-gray-200 my-1"></div>
              
              <!-- Types de ressources -->
              <div
                v-for="resourceType in resourceTypes"
                :key="resourceType.value"
                @click="toggleResourceType(resourceType.value)"
                class="cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100"
              >
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    :checked="selectedResourceTypes.includes(resourceType.value)"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <div class="ml-3 flex items-center">
                    <div 
                      class="w-3 h-3 rounded-full mr-2" 
                      :class="resourceType.colorClass"
                    ></div>
                    <span class="text-gray-900">{{ resourceType.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Checkbox versions différentes -->
        <div class="flex items-center">
          <input
            id="different-versions-filter"
            type="checkbox"
            :checked="showOnlyDifferentVersions"
            @change="$emit('update:showOnlyDifferentVersions', $event.target.checked)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label 
            for="different-versions-filter" 
            class="ml-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap"
          >
            Versions différentes
          </label>
        </div>

        <!-- Checkbox vérifier mises à jour -->
        <div class="flex items-center">
          <input
            id="check-updates-filter"
            type="checkbox"
            :checked="checkForUpdates"
            @change="$emit('update:checkForUpdates', $event.target.checked)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label 
            for="check-updates-filter" 
            class="ml-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap"
          >
            Vérifier mises à jour
          </label>
        </div>
      </div>

      <!-- Indicateurs de filtres actifs -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
        <!-- Indicateur clusters -->
        <div v-if="selectedClusters.length > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd" />
          </svg>
          {{ getSelectedClusterNames }}
        </div>

        <!-- Indicateur namespaces -->
        <div v-if="selectedNamespaces.length > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
          </svg>
          {{ selectedNamespaces.join(', ') }}
        </div>

        <!-- Indicateur types de ressources -->
        <div v-if="selectedResourceTypes.length > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
          {{ getSelectedResourceTypeNames }}
        </div>

        <!-- Indicateur versions différentes -->
        <div v-if="showOnlyDifferentVersions" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Versions différentes
        </div>

        <!-- Indicateur vérifier mises à jour -->
        <div v-if="checkForUpdates" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Mises à jour
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { clusters } from '../config/clusters'

const props = defineProps({
  namespaces: {
    type: Array,
    default: () => []
  },
  selectedNamespaces: {
    type: Array,
    default: () => []
  },
  selectedResourceTypes: {
    type: Array,
    default: () => []
  },
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
  },
  showOnlyDifferentVersions: {
    type: Boolean,
    default: false
  },
  checkForUpdates: {
    type: Boolean,
    default: false
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:selectedNamespaces', 
  'update:selectedResourceTypes',
  'update:selectedClusters',
  'update:showOnlyDifferentVersions',
  'update:checkForUpdates',
  'reset-filters'
])

// Refs pour les dropdowns
const namespaceDropdown = ref(null)
const resourceTypeDropdown = ref(null)
const clusterDropdown = ref(null)
const showNamespaceDropdown = ref(false)
const showResourceTypeDropdown = ref(false)
const showClusterDropdown = ref(false)

// Liste des clusters
const clusterList = clusters

// Types de ressources disponibles
const resourceTypes = [
  { 
    value: 'deployments', 
    label: 'Deployments', 
    colorClass: 'bg-green-500' 
  },
  { 
    value: 'cronjobs', 
    label: 'CronJobs', 
    colorClass: 'bg-yellow-500' 
  },
  { 
    value: 'statefulsets', 
    label: 'StatefulSets', 
    colorClass: 'bg-purple-500' 
  }
]

// Computed properties
const hasActiveFilters = computed(() => {
  return props.selectedNamespaces.length > 0 || 
         props.selectedResourceTypes.length > 0 || 
         props.selectedClusters.length > 0 ||
         props.showOnlyDifferentVersions ||
         props.checkForUpdates
})

const isAllClustersSelected = computed(() => {
  return props.selectedClusters.length === clusters.length
})

const getSelectedClusterNames = computed(() => {
  return props.selectedClusters
    .map(id => clusters.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join(', ')
})

const getSelectedResourceTypeNames = computed(() => {
  return props.selectedResourceTypes
    .map(t => resourceTypes.find(rt => rt.value === t)?.label)
    .filter(Boolean)
    .join(', ')
})

// Fonctions pour les dropdowns
function toggleNamespaceDropdown() {
  showNamespaceDropdown.value = !showNamespaceDropdown.value
  showResourceTypeDropdown.value = false
  showClusterDropdown.value = false
}

function toggleResourceTypeDropdown() {
  showResourceTypeDropdown.value = !showResourceTypeDropdown.value
  showNamespaceDropdown.value = false
  showClusterDropdown.value = false
}

function toggleClusterDropdown() {
  showClusterDropdown.value = !showClusterDropdown.value
  showNamespaceDropdown.value = false
  showResourceTypeDropdown.value = false
}

// Fonctions pour les namespaces
function toggleNamespace(namespace) {
  const current = [...props.selectedNamespaces]
  const index = current.indexOf(namespace)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(namespace)
  }
  
  emit('update:selectedNamespaces', current)
}

function toggleAllNamespaces() {
  if (props.selectedNamespaces.length === 0) {
    return
  } else {
    emit('update:selectedNamespaces', [])
  }
}

// Fonctions pour les types de ressources
function toggleResourceType(resourceType) {
  const current = [...props.selectedResourceTypes]
  const index = current.indexOf(resourceType)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(resourceType)
  }
  
  emit('update:selectedResourceTypes', current)
}

function toggleAllResourceTypes() {
  if (props.selectedResourceTypes.length === 0) {
    return
  } else {
    emit('update:selectedResourceTypes', [])
  }
}

// Fonctions pour les clusters
function toggleCluster(clusterId) {
  const current = [...props.selectedClusters]
  const index = current.indexOf(clusterId)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(clusterId)
  }
  
  emit('update:selectedClusters', current)
}

function toggleAllClusters() {
  if (props.selectedClusters.length === clusters.length) {
    // Si tous sont sélectionnés, on désélectionne tout
    emit('update:selectedClusters', [])
  } else {
    // Sinon, on sélectionne tous
    emit('update:selectedClusters', clusters.map(c => c.id))
  }
}

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

// Fermer les dropdowns quand on clique ailleurs
function handleClickOutside(event) {
  if (namespaceDropdown.value && !namespaceDropdown.value.contains(event.target)) {
    showNamespaceDropdown.value = false
  }
  if (resourceTypeDropdown.value && !resourceTypeDropdown.value.contains(event.target)) {
    showResourceTypeDropdown.value = false
  }
  if (clusterDropdown.value && !clusterDropdown.value.contains(event.target)) {
    showClusterDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
