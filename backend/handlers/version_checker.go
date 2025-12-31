package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/ffreville/infra-monitoring-backend/models"
)

// CheckLatestVersionsHandler vérifie les dernières versions disponibles pour les composants Kubernetes
func CheckLatestVersionsHandler(w http.ResponseWriter, r *http.Request) {
	// Lire le corps de la requête
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erreur lors de la lecture du corps de la requête", http.StatusBadRequest)
		return
	}

	// Décoder les données JSON
	var requestData struct {
		Components []struct {
			Kind      string `json:"kind"`
			Name      string `json:"name"`
			Namespace string `json:"namespace"`
			Version   string `json:"version"`
		} `json:"components"`
	}

	err = json.Unmarshal(body, &requestData)
	if err != nil {
		http.Error(w, "Erreur lors du décodage du JSON", http.StatusBadRequest)
		return
	}

	// Mapper les versions actuelles par type de composant
	versionMap := make(map[string]string)
	for _, component := range requestData.Components {
		versionMap[component.Kind] = component.Version
	}

	// Vérifier les dernières versions pour chaque type de composant
	updates := make([]models.VersionUpdate, 0)

	for kind, currentVersion := range versionMap {
		latestVersion := getLatestVersion(kind)
		
		if latestVersion != "" && latestVersion != currentVersion {
			updates = append(updates, models.VersionUpdate{
				Kind:          kind,
				CurrentVersion: currentVersion,
				LatestVersion:  latestVersion,
			})
		}
	}

	// Retourner les résultats
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"updates": updates,
	})
}

// getLatestVersion retourne la dernière version disponible pour un type de composant
func getLatestVersion(kind string) string {
	// URL de l'API Kubernetes pour obtenir les versions
	// Note: En production, vous devriez utiliser l'API officielle de Kubernetes
	// ou un service comme https://api.github.com/repos/kubernetes/kubernetes/releases
	
	// Pour l'instant, nous utilisons des versions simulées
	switch kind {
	case "Deployment":
		return "1.28.0"
	case "StatefulSet":
		return "1.28.0"
	case "CronJob":
		return "1.28.0"
	default:
		return ""
	}
}

// GetLatestVersionHandler retourne la dernière version pour un composant spécifique
func GetLatestVersionHandler(w http.ResponseWriter, r *http.Request) {
	// Extraire le kind et le nom du composant
	kind := r.URL.Query().Get("kind")
	name := r.URL.Query().Get("name")

	if kind == "" || name == "" {
		http.Error(w, "Kind et name sont requis", http.StatusBadRequest)
		return
	}

	latestVersion := getLatestVersion(kind)

	if latestVersion == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"kind":           kind,
			"name":           name,
			"latestVersion":  "unknown",
			"hasUpdate":      false,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"kind":           kind,
		"name":           name,
		"latestVersion":  latestVersion,
		"hasUpdate":      true,
	})
}

// GetLatestVersionForComponent vérifie si une mise à jour est disponible pour un composant spécifique
func GetLatestVersionForComponent(component models.KubernetesResource) (string, bool) {
	latestVersion := getLatestVersion(component.Kind)
	
	if latestVersion == "" {
		return "", false
	}
	
	return latestVersion, latestVersion != component.Version
}

// GetLatestVersionForComponentByName vérifie si une mise à jour est disponible pour un composant par son nom
func GetLatestVersionForComponentByName(kind, name, currentVersion string) (string, bool) {
	latestVersion := getLatestVersion(kind)
	
	if latestVersion == "" {
		return "", false
	}
	
	return latestVersion, latestVersion != currentVersion
}
