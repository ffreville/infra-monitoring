package client

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ffreville/infra-monitoring-backend/models"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

// KubernetesClient encapsule le client Kubernetes
type KubernetesClient struct {
	clientset *kubernetes.Clientset
}

// NewKubernetesClient crée un nouveau client Kubernetes
func NewKubernetesClient() (*KubernetesClient, error) {
	var config *rest.Config
	var err error

	// Essayer d'utiliser la configuration in-cluster
	config, err = rest.InClusterConfig()
	if err != nil {
		// Si on n'est pas dans un cluster, utiliser kubeconfig
		var kubeconfig string
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = filepath.Join(home, ".kube", "config")
		}

		// Vérifier si KUBECONFIG est défini
		if kubeconfigEnv := os.Getenv("KUBECONFIG"); kubeconfigEnv != "" {
			kubeconfig = kubeconfigEnv
		}

		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la création de la config Kubernetes: %v", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création du client Kubernetes: %v", err)
	}

	return &KubernetesClient{
		clientset: clientset,
	}, nil
}

// GetNamespaces récupère tous les namespaces du cluster
func (k *KubernetesClient) GetNamespaces(ctx context.Context) ([]models.Namespace, error) {
	namespaceList, err := k.clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des namespaces: %v", err)
	}

	var namespaces []models.Namespace
	for _, ns := range namespaceList.Items {
		namespace := models.Namespace{
			Name:   ns.Name,
			Status: string(ns.Status.Phase),
			Labels: ns.Labels,
			Age:    ns.CreationTimestamp.Format("2006-01-02 15:04:05"),
		}
		namespaces = append(namespaces, namespace)
	}

	return namespaces, nil
}

// GetContainersImage extrait les noms des images des conteneurs
func GetContainersImage(containers []v1.Container) []string {
	var images []string
	for _, container := range containers {
		var nameSplitted []string = strings.Split(strings.Split(container.Image, "@")[0], "/")

		images = append(images, nameSplitted[len(nameSplitted)-1])
	}
	return images
}

// GetContainerVersion extrait la version d'un conteneur
func GetContainerVersion(image string) string {
	// Extraire le nom de l'image (sans le registry et le namespace)
	imageName := strings.Split(image, "@")[0]
	parts := strings.Split(imageName, "/")
	imageName = parts[len(parts)-1]
	
	// Extraire la version (après le dernier ':')
	versionParts := strings.Split(imageName, ":")
	if len(versionParts) > 1 {
		return versionParts[len(versionParts)-1]
	}
	
	return "latest"
}

// GetDeployments récupère tous les déploiements du cluster ou d'un namespace spécifique
func (k *KubernetesClient) GetDeployments(ctx context.Context, namespace string) ([]models.Deployment, error) {
	deploymentList, err := k.clientset.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des déploiements: %v", err)
	}

	var deployments []models.Deployment
	for _, deploy := range deploymentList.Items {
		// Extraire la version du premier conteneur
		var version string
		if len(deploy.Spec.Template.Spec.Containers) > 0 {
			version = GetContainerVersion(deploy.Spec.Template.Spec.Containers[0].Image)
		}

		deployment := models.Deployment{
			Name:      deploy.Name,
			Namespace: deploy.Namespace,
			Replicas:  *deploy.Spec.Replicas,
			Ready:     deploy.Status.ReadyReplicas,
			Available: deploy.Status.AvailableReplicas,
			Labels:    deploy.Labels,
			Age:       deploy.CreationTimestamp.Format("2006-01-02 15:04:05"),
			Images:    GetContainersImage(deploy.Spec.Template.Spec.Containers),
			Version:   version,
		}
		deployments = append(deployments, deployment)
	}

	return deployments, nil
}

// GetCronJobs récupère tous les cronjobs du cluster ou d'un namespace spécifique
func (k *KubernetesClient) GetCronJobs(ctx context.Context, namespace string) ([]models.CronJob, error) {
	cronJobList, err := k.clientset.BatchV1().CronJobs(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des cronjobs: %v", err)
	}

	var cronJobs []models.CronJob
	for _, cj := range cronJobList.Items {
		var lastRun string
		if cj.Status.LastScheduleTime != nil {
			lastRun = cj.Status.LastScheduleTime.Format("2006-01-02 15:04:05")
		}

		// Extraire la version du premier conteneur
		var version string
		if len(cj.Spec.JobTemplate.Spec.Template.Spec.Containers) > 0 {
			version = GetContainerVersion(cj.Spec.JobTemplate.Spec.Template.Spec.Containers[0].Image)
		}

		cronJob := models.CronJob{
			Name:      cj.Name,
			Namespace: cj.Namespace,
			Schedule:  cj.Spec.Schedule,
			Suspend:   cj.Spec.Suspend != nil && *cj.Spec.Suspend,
			Active:    len(cj.Status.Active),
			LastRun:   lastRun,
			Labels:    cj.Labels,
			Age:       cj.CreationTimestamp.Format("2006-01-02 15:04:05"),
			Images:    GetContainersImage(cj.Spec.JobTemplate.Spec.Template.Spec.Containers),
			Version:   version,
		}
		cronJobs = append(cronJobs, cronJob)
	}

	return cronJobs, nil
}

// GetStatefulSets récupère tous les statefulsets du cluster ou d'un namespace spécifique
func (k *KubernetesClient) GetStatefulSets(ctx context.Context, namespace string) ([]models.StatefulSet, error) {
	statefulSetList, err := k.clientset.AppsV1().StatefulSets(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des statefulsets: %v", err)
	}

	var statefulSets []models.StatefulSet
	for _, sts := range statefulSetList.Items {
		// Extraire la version du premier conteneur
		var version string
		if len(sts.Spec.Template.Spec.Containers) > 0 {
			version = GetContainerVersion(sts.Spec.Template.Spec.Containers[0].Image)
		}

		statefulSet := models.StatefulSet{
			Name:      sts.Name,
			Namespace: sts.Namespace,
			Replicas:  *sts.Spec.Replicas,
			Ready:     sts.Status.ReadyReplicas,
			Labels:    sts.Labels,
			Age:       sts.CreationTimestamp.Format("2006-01-02 15:04:05"),
			Images:    GetContainersImage(sts.Spec.Template.Spec.Containers),
			Version:   version,
		}
		statefulSets = append(statefulSets, statefulSet)
	}

	return statefulSets, nil
}
