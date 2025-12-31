<template>
  <div class="bg-white overflow-hidden shadow rounded-lg mb-4">
    <!-- En-tête du namespace (cliquable pour plier/déplier) -->
    <div 
      @click="toggleExpanded"
      class="px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <!-- Icône de pliage/dépliage -->
          <svg 
            class="w-5 h-5 mr-3 transition-transform duration-200"
            :class="{ 'rotate-90': isExpanded }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <!-- Icône namespace -->
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <!-- Nom du namespace -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ namespaceName }}</h3>
            <p class="text-sm text-gray-500">
              {{ totalResources }} ressource{{ totalResources > 1 ? 's' : '' }}
              <span v-if="resourceCounts.deployments > 0" class="ml-2">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ resourceCounts.deployments }} dep
                </span>
              </span>
              <span v-if="resourceCounts.cronjobs > 0" class="ml-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {{ resourceCounts.cronjobs }} cron
                </span>
              </span>
              <span v-if="resourceCounts.statefulsets > 0" class="ml-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ resourceCounts.statefulsets }} sts
                </span>
              </span>
            </p>
          </div>
        </div>
        
        <!-- Badge du nombre total -->
        <div class="text-right">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {{ totalResources }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Contenu dépliable -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-screen opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="max-h-screen opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="isExpanded" class="overflow-hidden">
        <div class="p-4 space-y-6">
          <!-- Deployments -->
          <div v-if="namespaceResources.deployments.length > 0">
            <div class="flex items-center mb-3">
              <div class="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <h4 class="text-md font-medium text-gray-900">Deployments</h4>
              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ namespaceResources.deployments.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DeploymentCard
                v-for="deployment in namespaceResources.deployments"
                :key="`${deployment.namespace}-${deployment.name}`"
                :deployment="deployment"
                :selected-clusters="selectedClusters"
                :check-for-updates="checkForUpdates"
                :version-updates="versionUpdates"
                @view-details="$emit('view-details', $event)"
                @scale="$emit('scale', $event)"
              />
            </div>
          </div>
          
          <!-- CronJobs -->
          <div v-if="namespaceResources.cronjobs.length > 0">
            <div class="flex items-center mb-3">
              <div class="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
              <h4 class="text-md font-medium text-gray-900">CronJobs</h4>
              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {{ namespaceResources.cronjobs.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CronJobCard
                v-for="cronjob in namespaceResources.cronjobs"
                :key="`${cronjob.namespace}-${cronjob.name}`"
                :cronjob="cronjob"
                :selected-clusters="selectedClusters"
                :check-for-updates="checkForUpdates"
                :version-updates="versionUpdates"
                @view-details="$emit('view-details', $event)"
                @trigger="$emit('trigger', $event)"
              />
            </div>
          </div>
          
          <!-- StatefulSets -->
          <div v-if="namespaceResources.statefulsets.length > 0">
            <div class="flex items-center mb-3">
              <div class="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
              <h4 class="text-md font-medium text-gray-900">StatefulSets</h4>
              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {{ namespaceResources.statefulsets.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatefulSetCard
                v-for="statefulset in namespaceResources.statefulsets"
                :key="`${statefulset.namespace}-${statefulset.name}`"
                :statefulset="statefulset"
                :selected-clusters="selectedClusters"
                :check-for-updates="checkForUpdates"
                :version-updates="versionUpdates"
                @view-details="$emit('view-details', $event)"
                @scale="$emit('scale', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DeploymentCard from './DeploymentCard.vue'
import CronJobCard from './CronJobCard.vue'
import StatefulSetCard from './StatefulSetCard.vue'

const props = defineProps({
  namespaceName: {
    type: String,
    required: true
  },
  namespaceResources: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.deployments && value.cronjobs && value.statefulsets
    }
  },
  selectedClusters: {
    type: Array,
    default: () => []
  },
  initialExpanded: {
    type: Boolean,
    default: true
  },
  checkForUpdates: {
    type: Boolean,
    default: false
  },
  versionUpdates: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['view-details', 'scale', 'trigger'])

const isExpanded = ref(props.initialExpanded)

// Computed pour compter les ressources
const resourceCounts = computed(() => ({
  deployments: props.namespaceResources.deployments.length,
  cronjobs: props.namespaceResources.cronjobs.length,
  statefulsets: props.namespaceResources.statefulsets.length
}))

const totalResources = computed(() => {
  return resourceCounts.value.deployments + 
         resourceCounts.value.cronjobs + 
         resourceCounts.value.statefulsets
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
}

/* Animation personnalisée pour le contenu dépliable */
.max-h-0 {
  max-height: 0;
}

.max-h-screen {
  max-height: 100vh;
}
</style>
