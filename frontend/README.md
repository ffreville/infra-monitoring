# Dashboard Kubernetes Vue.js

Une application Vue.js moderne pour gérer et visualiser les ressources Kubernetes (Deployments, CronJobs, StatefulSets).

## 🚀 Fonctionnalités

- **Visualisation des ressources** : Deployments, CronJobs, StatefulSets
- **Filtrage avancé** : Par namespace et type de ressource
- **Interface responsive** : Design moderne avec Tailwind CSS
- **Temps réel** : Actualisation des données avec gestion d'erreur
- **Actions** : Scale, déclencher, voir les détails

## 📋 Prérequis

- Node.js 16+ 
- npm ou yarn
- Une API REST Kubernetes avec les endpoints :
  - `GET /deployments`
  - `GET /cronjobs`
  - `GET /statefulsets`
  - `GET /namespaces`

## 🛠️ Installation

1. **Cloner et installer les dépendances**
```bash
npm create vue@latest infra-monitoring-backend
cd nfra-monitoring-backend
npm install
npm install -D tailwindcss postcss autoprefixer @heroicons/vue
npx tailwindcss init -p
```

2. **Copier les fichiers du projet**
Copiez tous les fichiers fournis dans la structure appropriée.

3. **Configuration de l'environnement**
```bash
cp .env.example .env
# Modifier VITE_API_URL avec l'URL de votre API
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🏗️ Structure du projet

```
src/
├── components/           # Composants Vue réutilisables
│   ├── KubernetesHeader.vue
│   ├── ResourceFilters.vue
│   ├── ResourceCard.vue
│   ├── DeploymentCard.vue
│   ├── CronJobCard.vue
│   ├── StatefulSetCard.vue
│   └── LoadingSpinner.vue
├── composables/         # Logique réutilisable
│   └── useKubernetesData.js
├── services/           # Services API
│   └── kubernetesApi.js
├── App.vue            # Composant principal
└── main.js           # Point d'entrée
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` :
```bash
VITE_API_URL=http://votre-api-kubernetes.com
```

### Proxy de développement

Le proxy est configuré dans `vite.config.js` pour rediriger `/api/*` vers votre API Kubernetes.

## 🎨 Personnalisation

### Thèmes et couleurs

Modifiez `tailwind.config.js` pour personnaliser les couleurs et animations.

### Données de démonstration

Si l'API n'est pas disponible, l'application utilise automatiquement des données de démonstration définies dans `services/kubernetesApi.js`.

## 📡 Format des données API

L'application s'attend à recevoir des données JSON dans ce format :

### Deployments
```json
[
  {
    "name": "nginx-deployment",
    "namespace": "default",
    "replicas": 3,
    "ready": "3/3",
    "status": "Running"
  }
]
```

### CronJobs
```json
[
  {
    "name": "backup-job",
    "namespace": "default",
    "schedule": "0 2 * * *",
    "status": "Active",
    "lastRun": "2024-01-15T02:00:00Z"
  }
]
```

### StatefulSets
```json
[
  {
    "name": "postgres-cluster",
    "namespace": "production",
    "replicas": 3,
    "ready": "3/3",
    "status": "Running",
    "serviceName": "postgres-svc"
  }
]
```

### Namespaces
```json
[
  {
    "name": "default"
  },
  {
    "name": "production"
  }
]
```

## 🚀 Build et déploiement

```bash
# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT.
