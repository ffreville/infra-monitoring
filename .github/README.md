# Pipeline CI/CD Fusionné

Ce dossier contient le pipeline CI/CD fusionné pour le projet infra-monitoring.

## Structure

Le projet est organisé en deux parties principales :
- **backend/** : Le backend Go qui gère les requêtes Kubernetes
- **frontend/** : Le frontend Vue.js qui affiche les données

## Pipeline CI/CD

Le fichier `.github/workflows/build.yml` contient un pipeline unique qui gère les deux builds Docker séparément :

### Jobs

1. **build-backend** :
   - Construit et pousse l'image Docker du backend
   - Image taguée avec `/backend` suffix
   - Utilise le Dockerfile dans `backend/`

2. **build-frontend** :
   - Construit et pousse l'image Docker du frontend
   - Image taguée avec `/frontend` suffix
   - Utilise le Dockerfile dans `frontend/`
   - Dépend du job backend (exécuté après)

### Images Docker

Les images sont poussées vers GitHub Container Registry avec les noms suivants :
- Backend : `ghcr.io/${{ github.repository }}/backend`
- Frontend : `ghcr.io/${{ github.repository }}/frontend`

### Plateformes

Les deux images sont construites pour les plateformes suivantes :
- `linux/amd64`
- `linux/arm64`

### Cache

Le pipeline utilise le cache GitHub Actions pour accélérer les builds :
- Cache Docker layers via `type=gha`
- Cache npm modules pour le frontend

## Utilisation

Pour utiliser ces images :

```bash
# Backend
docker pull ghcr.io/${ORG}/${REPO}/backend:latest

# Frontend
docker pull ghcr.io/${ORG}/${REPO}/frontend:latest
```

## Configuration

Le pipeline est configuré pour :
- S'exécuter sur les pushes vers la branche `main`
- S'exécuter sur les pull requests vers la branche `main`
- Ne pousser les images que sur les pushes vers `main` (condition `if`)
