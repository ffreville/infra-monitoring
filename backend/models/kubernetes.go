package models

// KubernetesResource représente un composant Kubernetes générique
type KubernetesResource struct {
	Kind      string `json:"kind"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Version   string `json:"version"`
}

// VersionUpdate représente une mise à jour de version disponible
type VersionUpdate struct {
	Kind           string `json:"kind"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
}

// Namespace représente un namespace simplifié
type Namespace struct {
	Name   string            `json:"name"`
	Status string            `json:"status"`
	Labels map[string]string `json:"labels,omitempty"`
	Age    string            `json:"age"`
}

// Deployment représente un déploiement simplifié
type Deployment struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Replicas  int32             `json:"replicas"`
	Ready     int32             `json:"ready"`
	Available int32             `json:"available"`
	Labels    map[string]string `json:"labels,omitempty"`
	Age       string            `json:"age"`
	Images    []string          `json:"images"`
	Version   string            `json:"version,omitempty"`
}

// CronJob représente un cronjob simplifié
type CronJob struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Schedule  string            `json:"schedule"`
	Suspend   bool              `json:"suspend"`
	Active    int               `json:"active"`
	LastRun   string            `json:"lastRun,omitempty"`
	Labels    map[string]string `json:"labels,omitempty"`
	Age       string            `json:"age"`
	Images    []string          `json:"images"`
	Version   string            `json:"version,omitempty"`
}

// StatefulSet représente un statefulset simplifié
type StatefulSet struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Replicas  int32             `json:"replicas"`
	Ready     int32             `json:"ready"`
	Labels    map[string]string `json:"labels,omitempty"`
	Age       string            `json:"age"`
	Images    []string          `json:"images"`
	Version   string            `json:"version,omitempty"`
}
