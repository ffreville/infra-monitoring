<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <KubernetesHeader 
      :loading="state.loading" 
      @refresh="refreshData" 
    />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Filtres (incluant les clusters) -->
      <div class="px-4 py-6 sm:px-0">
        <ResourceFilters
          :namespaces="state.namespaces"
          :selected-namespaces="selectedNamespaces"
          :selected-resource-types="selectedResourceTypes"
          :selected-clusters="selectedClusters"
          :cluster-statuses="state.clusterStatuses"
          :cluster-errors="state.clusterErrors"
          :show-only-different-versions="showOnlyDifferentVersions"
          :total-count="totalResourcesCount"
          @update:selected-namespaces="selectedNamespaces = $event"
          @update:selected-resource-types="selectedResourceTypes = $event"
          @update:selected-clusters="selectedClusters = $event"
          @update:show-only-different-versions="showOnlyDifferentVersions = $event"
          @reset-filters="resetFilters"
        />
      </div>

      <!-- Message d'erreur -->
      <Transition name="fade">
        <div v-if="state.error && selectedClusters.length > 0" class="px-4 sm:px-0 mb-6">
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fill-rule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                    clip-rule="evenodd" 
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
                <p class="mt-1 text-sm text-red-700">{{ state.error }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Message si aucun cluster sélectionné -->
      <div v-if="selectedClusters.length === 0" class="px-4 sm:px-0">
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p class="text-sm text-yellow-800">
            Veuillez sélectionner au moins un cluster pour afficher les ressources.
          </p>
        </div>
      </div>

      <!-- Ressources groupées par namespace -->
      <div v-else class="px-4 sm:px-0">
        <!-- Actions globales -->
        <div v-if="Object.keys(groupedResourcesByNamespace).length > 0" class="mb-6">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              {{ Object.keys(groupedResourcesByNamespace).length }} namespace{{ Object.keys(groupedResourcesByNamespace).length > 1 ? 's' : '' }} avec des ressources
            </div>
            <div class="flex gap-2">
              <button
                @click="expandAllNamespaces"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
              >
                Tout déplier
              </button>
              <button
                @click="collapseAllNamespaces"
                class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                Tout replier
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des namespaces -->
        <div class="space-y-4">
          <NamespaceGroup
            v-for="(namespaceResources, namespaceName) in groupedResourcesByNamespace"
            :key="namespaceName"
            :namespace-name="namespaceName"
            :namespace-resources="namespaceResources"
            :selected-clusters="selectedClusters"
            :initial-expanded="namespaceExpandedState[namespaceName] !== false"
            @view-details="handleViewDetails"
            @scale="handleScale"
            @trigger="handleTrigger"
            ref="namespaceGroups"
          />
        </div>

        <!-- Message si aucune ressource trouvée -->
        <div v-if="Object.keys(groupedResourcesByNamespace).length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune ressource trouvée</h3>
          <p class="mt-1 text-sm text-gray-500">
            Aucune ressource ne correspond aux critères de filtrage sélectionnés.
          </p>
          <div class="mt-4">
            <button
              @click="resetFilters"
              class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- État de chargement -->
      <Transition name="fade">
        <div v-if="state.loading && !state.error" class="px-4 sm:px-0">
          <LoadingSpinner />
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useKubernetesData } from './composables/useKubernetesData'

// Composants
import KubernetesHeader from './components/KubernetesHeader.vue'
import ResourceFilters from './components/ResourceFilters.vue'
import NamespaceGroup from './components/NamespaceGroup.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// Composable pour la gestion des données
const {
  state,
  selectedNamespaces,
  selectedResourceTypes,
  selectedClusters,
  showOnlyDifferentVersions,
  groupedResourcesByNamespace,
  totalResourcesCount,
  loadAllData,
  refreshData,
  resetFilters,
  shouldShowResourceType
} = useKubernetesData()

// État pour gérer l'expansion des namespaces
const namespaceExpandedState = ref({})
const namespaceGroups = ref([])

// Gestionnaires d'événements
function handleViewDetails(resource) {
  console.log('Voir les détails de:', resource)
  // Ici vous pourriez ouvrir une modal ou naviguer vers une page de détails
}

function handleScale(resource) {
  console.log('Scale resource:', resource)
  // Ici vous pourriez ouvrir une modal pour modifier le nombre de réplicas
}

function handleTrigger(cronjob) {
  console.log('Déclencher cronjob:', cronjob)
  // Ici vous pourriez déclencher manuellement le cronjob
}

// Fonctions pour gérer l'expansion/contraction globale
function expandAllNamespaces() {
  Object.keys(groupedResourcesByNamespace.value).forEach(namespaceName => {
    namespaceExpandedState.value[namespaceName] = true
  })
  // Forcer la mise à jour des composants enfants
  namespaceGroups.value.forEach(group => {
    if (group && group.isExpanded !== undefined) {
      group.isExpanded = true
    }
  })
}

function collapseAllNamespaces() {
  Object.keys(groupedResourcesByNamespace.value).forEach(namespaceName => {
    namespaceExpandedState.value[namespaceName] = false
  })
  // Forcer la mise à jour des composants enfants
  namespaceGroups.value.forEach(group => {
    if (group && group.isExpanded !== undefined) {
      group.isExpanded = false
    }
  })
}

// Charger les données au montage
onMounted(() => {
  loadAllData()
})
</script>
