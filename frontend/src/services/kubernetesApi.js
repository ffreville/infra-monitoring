import { clusters } from '../config/clusters'

// Fonction générique pour les appels API
async function apiCall(clusterApiUrl, endpoint) {
  try {
    const response = await fetch(`${clusterApiUrl}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${clusterApiUrl}${endpoint}:`, error)
    throw error
  }
}

// API Kubernetes pour un cluster spécifique
class ClusterApi {
  constructor(cluster) {
    this.cluster = cluster
    this.apiUrl = cluster.apiUrl
  }

  async getDeployments() {
    const data = await apiCall(this.apiUrl, '/deployments')
    return this.addClusterInfo(data.deployments || [])
  }

  async getCronJobs() {
    const data = await apiCall(this.apiUrl, '/cronjobs')
    return this.addClusterInfo(data.cronjobs || [])
  }

  async getStatefulSets() {
    const data = await apiCall(this.apiUrl, '/statefulsets')
    return this.addClusterInfo(data.statefulsets || [])
  }

  async getNamespaces() {
    const data = await apiCall(this.apiUrl, '/namespaces')
    return data.namespaces || []
  }

  // Ajouter les informations du cluster à chaque ressource
  addClusterInfo(resources) {
    return resources.map(resource => ({
      ...resource,
      clusterId: this.cluster.id,
      clusterName: this.cluster.name,
      clusterColor: this.cluster.color
    }))
  }

  async getAllResources() {
    try {
      const [deployments, cronjobs, statefulsets, namespaces] = await Promise.all([
        this.getDeployments(),
        this.getCronJobs(),
        this.getStatefulSets(),
        this.getNamespaces()
      ])

      return {
        deployments,
        cronjobs,
        statefulsets,
        namespaces
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ressources pour ${this.cluster.name}:`, error)
      throw error
    }
  }
}

// API pour gérer plusieurs clusters
export const kubernetesApi = {
  // Récupérer les données de tous les clusters sélectionnés
  async getAllClustersResources(selectedClusterIds) {
    const selectedClusters = clusters.filter(c => selectedClusterIds.includes(c.id))
    
    if (selectedClusters.length === 0) {
      return {
        deployments: [],
        cronjobs: [],
        statefulsets: [],
        namespaces: []
      }
    }

    const clusterPromises = selectedClusters.map(cluster => {
      const api = new ClusterApi(cluster)
      return api.getAllResources()
        .then(data => ({ cluster, data }))
        .catch(error => {
          console.error(`Erreur pour le cluster ${cluster.name}:`, error)
          // Retourner des données vides en cas d'erreur pour ce cluster
          return {
            cluster,
            data: {
              deployments: [],
              cronjobs: [],
              statefulsets: [],
              namespaces: []
            },
            error: error.message
          }
        })
    })

    const results = await Promise.all(clusterPromises)
    
    // Combiner les résultats de tous les clusters
    const combinedData = {
      deployments: [],
      cronjobs: [],
      statefulsets: [],
      namespaces: [],
      errors: []
    }

    results.forEach(({ cluster, data, error }) => {
      if (error) {
        combinedData.errors.push({ cluster: cluster.name, error })
      }
      
      combinedData.deployments.push(...data.deployments)
      combinedData.cronjobs.push(...data.cronjobs)
      combinedData.statefulsets.push(...data.statefulsets)
      
      // Pour les namespaces, on évite les doublons
      data.namespaces.forEach(ns => {
        if (!combinedData.namespaces.some(existing => existing.name === ns.name)) {
          combinedData.namespaces.push(ns)
        }
      })
    })

    return combinedData
  }
}

// Données de démonstration pour le développement
export const mockData = {
  namespaces: [
    { name: 'default' },
    { name: 'kube-system' },
    { name: 'production' },
    { name: 'staging' },
    { name: 'monitoring' }
  ],

  deployments: [
    { name: 'nginx-deployment', namespace: 'default', replicas: 3, status: 'Running', ready: '3/3', clusterId: 'cluster-1', clusterName: 'Production EU', clusterColor: 'blue' },
    { name: 'api-server', namespace: 'production', replicas: 5, status: 'Running', ready: '5/5', clusterId: 'cluster-1', clusterName: 'Production EU', clusterColor: 'blue' },
    { name: 'frontend-app', namespace: 'staging', replicas: 2, status: 'Running', ready: '2/2', clusterId: 'cluster-2', clusterName: 'Production US', clusterColor: 'green' },
    { name: 'worker-service', namespace: 'production', replicas: 4, status: 'Running', ready: '4/4', clusterId: 'cluster-3', clusterName: 'Staging', clusterColor: 'yellow' },
    { name: 'auth-service', namespace: 'production', replicas: 2, status: 'Running', ready: '2/2', clusterId: 'cluster-4', clusterName: 'Development', clusterColor: 'purple' }
  ],

  cronjobs: [
    { name: 'backup-job', namespace: 'default', schedule: '0 2 * * *', status: 'Active', lastRun: '2024-01-15T02:00:00Z', clusterId: 'cluster-1', clusterName: 'Production EU', clusterColor: 'blue' },
    { name: 'cleanup-logs', namespace: 'production', schedule: '0 0 * * 0', status: 'Active', lastRun: '2024-01-14T00:00:00Z', clusterId: 'cluster-2', clusterName: 'Production US', clusterColor: 'green' },
    { name: 'report-generator', namespace: 'staging', schedule: '0 6 * * 1', status: 'Suspended', lastRun: '2024-01-08T06:00:00Z', clusterId: 'cluster-3', clusterName: 'Staging', clusterColor: 'yellow' },
    { name: 'db-backup', namespace: 'production', schedule: '0 3 * * *', status: 'Active', lastRun: '2024-01-15T03:00:00Z', clusterId: 'cluster-5', clusterName: 'Testing', clusterColor: 'orange' }
  ],

  statefulsets: [
    { name: 'postgres-cluster', namespace: 'production', replicas: 3, status: 'Running', ready: '3/3', clusterId: 'cluster-1', clusterName: 'Production EU', clusterColor: 'blue' },
    { name: 'redis-cluster', namespace: 'default', replicas: 3, status: 'Running', ready: '3/3', clusterId: 'cluster-2', clusterName: 'Production US', clusterColor: 'green' },
    { name: 'elasticsearch', namespace: 'production', replicas: 5, status: 'Running', ready: '5/5', clusterId: 'cluster-3', clusterName: 'Staging', clusterColor: 'yellow' },
    { name: 'mongodb-replica', namespace: 'staging', replicas: 3, status: 'Running', ready: '2/3', clusterId: 'cluster-4', clusterName: 'Development', clusterColor: 'purple' }
  ]
}
