import { ref, reactive, computed, watch } from 'vue'
import { kubernetesApi, mockData } from '../services/kubernetesApi'
import { clusters } from '../config/clusters'

export function useKubernetesData() {
  // État réactif
  const state = reactive({
    deployments: [],
    cronjobs: [],
    statefulsets: [],
    namespaces: [],
    loading: false,
    error: null,
    clusterStatuses: {}, // { clusterId: 'loading' | 'success' | 'error' }
    clusterErrors: {} // { clusterId: errorMessage }
  })

  // Filtres
  const selectedNamespaces = ref([]) // Changé en array
  const selectedResourceTypes = ref([]) // Changé en array
  const selectedClusters = ref(['cluster-dev']) // Dev sélectionné par défaut
  const showOnlyDifferentVersions = ref(false)

  // Fonction pour regrouper les déploiements par nom (méthode originale)
  function groupDeploymentsByName(deployments) {
    const grouped = {}
    
    // Initialiser les groupes avec tous les déploiements uniques
    deployments.forEach(deployment => {
      const key = `${deployment.namespace}-${deployment.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: deployment.name,
          namespace: deployment.namespace,
          status: deployment.status,
          ready: deployment.ready,
          replicas: deployment.replicas,
          clusterVersions: {} // { clusterId: { version, status, ready } }
        }
      }
      
      // Ajouter les informations de version pour ce cluster
      grouped[key].clusterVersions[deployment.clusterId] = {
        version: deployment.images?.[0] || 'N/A',
        status: deployment.status,
        ready: deployment.ready,
        replicas: deployment.replicas
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée (même vide)
    Object.values(grouped).forEach(deployment => {
      selectedClusters.value.forEach(clusterId => {
        if (!deployment.clusterVersions[clusterId]) {
          deployment.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            ready: 'N/A',
            replicas: 'N/A'
          }
        }
      })
    })
    
    return Object.values(grouped)
  }

  // Fonction pour regrouper les CronJobs par nom
  function groupCronJobsByName(cronjobs) {
    const grouped = {}
    
    cronjobs.forEach(cronjob => {
      const key = `${cronjob.namespace}-${cronjob.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: cronjob.name,
          namespace: cronjob.namespace,
          schedule: cronjob.schedule,
          lastRun: cronjob.lastRun,
          status: cronjob.status,
          clusterVersions: {}
        }
      }
      
      // Ajouter les informations pour ce cluster
      grouped[key].clusterVersions[cronjob.clusterId] = {
        version: cronjob.images?.[0] || 'N/A',
        status: cronjob.status,
        schedule: cronjob.schedule,
        lastRun: cronjob.lastRun,
        active: cronjob.active || 0,
        suspend: cronjob.suspend || false
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée
    Object.values(grouped).forEach(cronjob => {
      selectedClusters.value.forEach(clusterId => {
        if (!cronjob.clusterVersions[clusterId]) {
          cronjob.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            schedule: 'N/A',
            lastRun: 'N/A',
            active: 0,
            suspend: false
          }
        }
      })
    })
    
    return Object.values(grouped)
  }

  // Fonction pour regrouper les StatefulSets par nom
  function groupStatefulSetsByName(statefulsets) {
    const grouped = {}
    
    statefulsets.forEach(statefulset => {
      const key = `${statefulset.namespace}-${statefulset.name}`
      if (!grouped[key]) {
        grouped[key] = {
          name: statefulset.name,
          namespace: statefulset.namespace,
          status: statefulset.status,
          clusterVersions: {}
        }
      }
      
      // Ajouter les informations pour ce cluster
      grouped[key].clusterVersions[statefulset.clusterId] = {
        version: statefulset.images?.[0] || 'N/A',
        status: statefulset.status,
        ready: statefulset.ready,
        replicas: statefulset.replicas
      }
    })
    
    // S'assurer que tous les clusters sélectionnés ont une entrée
    Object.values(grouped).forEach(statefulset => {
      selectedClusters.value.forEach(clusterId => {
        if (!statefulset.clusterVersions[clusterId]) {
          statefulset.clusterVersions[clusterId] = {
            version: 'N/A',
            status: 'N/A',
            ready: 'N/A',
            replicas: 'N/A'
          }
        }
      })
    })
    
    return Object.values(grouped)
  }

  // Fonction pour vérifier si une ressource a des versions différentes
  function hasDifferentVersions(resource) {
    const clusterVersions = Object.values(resource.clusterVersions || {})
    
    // Si on n'a aucune donnée de cluster, pas de différence détectable
    if (clusterVersions.length === 0) return false
    
    // Récupérer seulement les versions valides (non "N/A")
    const validVersions = clusterVersions
      .map(cluster => cluster.version)
      .filter(version => version && version !== 'N/A')
    
    // Si on a moins de 2 versions valides, pas de différence possible
    // (ressource déployée sur un seul cluster ou pas déployée du tout)
    if (validVersions.length < 2) return false
    
    // Vérifier s'il y a des versions différentes parmi les versions valides
    const uniqueValidVersions = [...new Set(validVersions)]
    return uniqueValidVersions.length > 1
  }

  // Charger les données des clusters sélectionnés
  async function loadAllData() {
    if (selectedClusters.value.length === 0) {
      state.deployments = []
      state.cronjobs = []
      state.statefulsets = []
      state.namespaces = []
      return
    }

    state.loading = true
    state.error = null
    state.clusterStatuses = {}
    state.clusterErrors = {}

    // Marquer tous les clusters sélectionnés comme en cours de chargement
    selectedClusters.value.forEach(clusterId => {
      state.clusterStatuses[clusterId] = 'loading'
    })

    try {
      const data = await kubernetesApi.getAllClustersResources(selectedClusters.value)
      
      // Regrouper les ressources par nom
      state.deployments = groupDeploymentsByName(data.deployments)
      state.cronjobs = groupCronJobsByName(data.cronjobs)
      state.statefulsets = groupStatefulSetsByName(data.statefulsets)
      state.namespaces = data.namespaces

      // Mettre à jour les statuts des clusters
      selectedClusters.value.forEach(clusterId => {
        const hasError = data.errors?.some(e => e.cluster === clusters.find(c => c.id === clusterId)?.name)
        if (hasError) {
          const error = data.errors.find(e => e.cluster === clusters.find(c => c.id === clusterId)?.name)
          state.clusterStatuses[clusterId] = 'error'
          state.clusterErrors[clusterId] = error.error
        } else {
          state.clusterStatuses[clusterId] = 'success'
        }
      })

      // S'il y a des erreurs mais aussi des données, on affiche un message d'avertissement
      if (data.errors && data.errors.length > 0) {
        const failedClusters = data.errors.map(e => e.cluster).join(', ')
        state.error = `Impossible de charger les données de certains clusters: ${failedClusters}`
      }
    } catch (error) {
      state.error = `Erreur générale: ${error.message}`
      console.warn('Utilisation des données de démonstration')
      
      // Utiliser les données de démonstration en cas d'erreur complète
      state.deployments = groupDeploymentsByName(mockData.deployments)
      state.cronjobs = groupCronJobsByName(mockData.cronjobs)
      state.statefulsets = groupStatefulSetsByName(mockData.statefulsets)
      state.namespaces = mockData.namespaces

      // Marquer tous les clusters comme en erreur
      selectedClusters.value.forEach(clusterId => {
        state.clusterStatuses[clusterId] = 'error'
        state.clusterErrors[clusterId] = error.message
      })
    } finally {
      state.loading = false
    }
  }

  // Recharger quand les clusters sélectionnés changent
  watch(selectedClusters, () => {
    loadAllData()
  }, { deep: true })

  // Filtrer les ressources par namespace et cluster
  function getFilteredResources(resourceType) {
    let resources = []
    
    switch (resourceType) {
      case 'deployments':
        resources = state.deployments
        break
      case 'cronjobs':
        resources = state.cronjobs
        break
      case 'statefulsets':
        resources = state.statefulsets
        break
      default:
        return []
    }

    // Filtrer par namespaces si nécessaire (sélection multiple)
    if (selectedNamespaces.value.length > 0) {
      resources = resources.filter(resource => 
        selectedNamespaces.value.includes(resource.namespace)
      )
    }

    // Filtrer par versions différentes si nécessaire
    if (showOnlyDifferentVersions.value) {
      resources = resources.filter(resource => hasDifferentVersions(resource))
    }

    return resources
  }

  // Vérifier si un type de ressource doit être affiché
  function shouldShowResourceType(resourceType) {
    // Si aucun type sélectionné, afficher tous
    if (selectedResourceTypes.value.length === 0) return true
    // Sinon, afficher seulement les types sélectionnés
    return selectedResourceTypes.value.includes(resourceType)
  }

  // Fonction pour regrouper les ressources par namespace
  function groupResourcesByNamespace() {
    const namespaces = {}
    
    // Ajouter les deployments
    if (shouldShowResourceType('deployments')) {
      filteredDeployments.value.forEach(deployment => {
        if (!namespaces[deployment.namespace]) {
          namespaces[deployment.namespace] = {
            deployments: [],
            cronjobs: [],
            statefulsets: []
          }
        }
        namespaces[deployment.namespace].deployments.push(deployment)
      })
    }
    
    // Ajouter les cronjobs
    if (shouldShowResourceType('cronjobs')) {
      filteredCronJobs.value.forEach(cronjob => {
        if (!namespaces[cronjob.namespace]) {
          namespaces[cronjob.namespace] = {
            deployments: [],
            cronjobs: [],
            statefulsets: []
          }
        }
        namespaces[cronjob.namespace].cronjobs.push(cronjob)
      })
    }
    
    // Ajouter les statefulsets
    if (shouldShowResourceType('statefulsets')) {
      filteredStatefulSets.value.forEach(statefulset => {
        if (!namespaces[statefulset.namespace]) {
          namespaces[statefulset.namespace] = {
            deployments: [],
            cronjobs: [],
            statefulsets: []
          }
        }
        namespaces[statefulset.namespace].statefulsets.push(statefulset)
      })
    }
    
    return namespaces
  }

  // Computed properties
  const filteredDeployments = computed(() => getFilteredResources('deployments'))
  const filteredCronJobs = computed(() => getFilteredResources('cronjobs'))
  const filteredStatefulSets = computed(() => getFilteredResources('statefulsets'))
  
  const groupedResourcesByNamespace = computed(() => groupResourcesByNamespace())

  const totalResourcesCount = computed(() => {
    let total = 0
    if (shouldShowResourceType('deployments')) {
      total += filteredDeployments.value.length
    }
    if (shouldShowResourceType('cronjobs')) {
      total += filteredCronJobs.value.length
    }
    if (shouldShowResourceType('statefulsets')) {
      total += filteredStatefulSets.value.length
    }
    return total
  })

  // Fonction pour actualiser les données
  function refreshData() {
    loadAllData()
  }

  // Réinitialiser les filtres
  function resetFilters() {
    selectedNamespaces.value = []
    selectedResourceTypes.value = []
    selectedClusters.value = ['cluster-dev'] // Garder dev par défaut
    showOnlyDifferentVersions.value = false
  }

  // Obtenir les clusters disponibles
  function getAvailableClusters() {
    return clusters
  }

  return {
    // État
    state,
    selectedNamespaces,
    selectedResourceTypes,
    selectedClusters,
    showOnlyDifferentVersions,
    
    // Computed
    filteredDeployments,
    filteredCronJobs,
    filteredStatefulSets,
    groupedResourcesByNamespace,
    totalResourcesCount,
    
    // Méthodes
    loadAllData,
    refreshData,
    resetFilters,
    getFilteredResources,
    shouldShowResourceType,
    getAvailableClusters,
    hasDifferentVersions
  }
}
