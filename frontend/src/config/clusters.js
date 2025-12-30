// Configuration des clusters Kubernetes
export const clusters = [
  {
    id: 'cluster-dev',
    name: 'Dev',
    apiUrl: import.meta.env.VITE_CLUSTER_DEV_URL || 'http://localhost:3001/api',
    color: 'green'
  },
  {
    id: 'cluster-dev-2',
    name: 'Dev 2',
    apiUrl: import.meta.env.VITE_CLUSTER_DEV_2_URL || 'http://localhost:3002/api',
    color: 'blue'
  },
  {
    id: 'cluster-test',
    name: 'Test',
    apiUrl: import.meta.env.VITE_CLUSTER_TEST_URL || 'http://localhost:3003/api',
    color: 'yellow'
  },
  {
    id: 'cluster-infra',
    name: 'Infra',
    apiUrl: import.meta.env.VITE_CLUSTER_INFRA_URL || 'http://localhost:3004/api',
    color: 'purple'
  },
  {
    id: 'cluster-prod',
    name: 'Prod',
    apiUrl: import.meta.env.VITE_CLUSTER_PROD_URL || 'http://localhost:3005/api',
    color: 'red'
  }
]
