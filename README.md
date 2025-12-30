# Infra Monitoring

Une application de monitoring Kubernetes avec une architecture frontend/backend séparée.

## Architecture

Ce projet est composé de deux parties principales :
- **Backend** : Service Go pour récupérer les données Kubernetes
- **Frontend** : Interface Vue.js pour afficher les données

## Structure du projet

```
infra-monitoring/
├── backend/          # Backend Go
├── frontend/         # Frontend Vue.js
├── docker-compose.yml # Configuration Docker Compose
├── Makefile          # Scripts de build et déploiement
└── README.md         # Ce fichier
```

## Prérequis

- Docker
- Docker Compose
- Node.js 18+
- Go 1.24+

## Installation

### Backend

```bash
cd backend
go mod download
go build -o infra-monitoring-backend
```

### Frontend

```bash
cd frontend
npm install
npm run build
```

## Build et déploiement

### Build des images Docker

```bash
# Build du backend
make build-backend

# Build du frontend
make build-frontend

# Build des deux
make build-all
```

### Exécution avec Docker Compose

```bash
# Démarrer l'application
docker-compose up -d

# Arrêter l'application
docker-compose down
```

### Déploiement sur Kubernetes

```bash
# Générer les manifests Kubernetes
make k8s-manifests

# Appliquer les manifests
kubectl apply -f k8s/
```

## Configuration

### Variables d'environnement

#### Backend

| Variable | Description | Valeur par défaut |
|----------|-------------|------------------|
| `PORT` | Port d'écoute | `8080` |
| `KUBE_CONFIG` | Chemin vers le fichier kubeconfig | `~/.kube/config` |

#### Frontend

| Variable | Description | Valeur par défaut |
|----------|-------------|------------------|
| `VITE_API_BASE_URL` | URL de l'API backend | `http://localhost:8080` |
| `VITE_API_BASE_URL` | URL de l'API backend | `http://localhost:8080` |

## Développement

### Backend

```bash
cd backend
go run main.go
```

### Frontend

```bash
cd frontend
npm run dev
```

## Tests

### Backend

```bash
cd backend
go test ./...
```

### Frontend

```bash
cd frontend
npm run test
```

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
