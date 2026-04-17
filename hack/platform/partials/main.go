package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/invopop/jsonschema"
	"github.com/loft-sh/vcluster-docs/hack/platform/util"

	clusterv1 "github.com/loft-sh/agentapi/v4/pkg/apis/loft/cluster/v1"
	managementv1 "github.com/loft-sh/api/v4/pkg/apis/management/v1"
	storagev1 "github.com/loft-sh/api/v4/pkg/apis/storage/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var paths []string

func main() {
	if len(os.Args) != 2 {
		panic("expected to be called with vcluster jsonschema path as first argument, e.g.\n" +
			"go run hack/vcluster/partials/main.go configsrc/v0.21/vcluster.schema.json")
	}
	jsonSchemaPath := os.Args[1]

	removeAllExceptPreserved(util.BasePath)

	util.GenerateSection(&managementv1.ConfigStatus{}, true, path.Join(util.BasePath, "config/status_reference.mdx"))
	util.GenerateSection(&managementv1.AuditPolicy{}, true, path.Join(util.BasePath, "config/status/audit/policy.mdx"))
	util.GenerateSection(&managementv1.Audit{}, true, path.Join(util.BasePath, "config/status/audit.mdx"))
	util.GenerateSection(&storagev1.RancherIntegrationSpec{}, true, path.Join(util.BasePath, "projects/spec/rancher.mdx"))
	util.GenerateSection(&storagev1.VaultIntegrationSpec{}, true, path.Join(util.BasePath, "projects/spec/vault.mdx"))

	util.GenerateMetadata(&util.ObjectInformation{
		Object: &storagev1.VirtualClusterInstance{},
	})

	// VirtualClusterInstance
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Virtual Cluster Instance",
		Name:        "Virtual Cluster",
		Resource:    "virtualclusterinstances",
		Description: "A virtual cluster is a fully functional Kubernetes cluster that runs inside the namespace of another Kubernetes cluster (host cluster). Virtual clusters are very useful if you are hitting the limits of namespaces and do not want to make special exceptions to the multi-tenancy configuration of the underlying cluster, e.g. a user needs their own CRD or user needs pods from 2 namespaces to communicate with each other but your standard NetworkPolicy does not allow this, then a virtual cluster may be perfect for this user.",
		File:        path.Join(util.BaseResourcesPath, "virtualclusterinstance/virtualclusterinstance.mdx"),
		Object: &storagev1.VirtualClusterInstance{
			TypeMeta: metav1.TypeMeta{
				Kind:       "VirtualClusterInstance",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name:      "my-virtual-cluster",
				Namespace: "loft-p-my-project",
			},
			Spec: storagev1.VirtualClusterInstanceSpec{
				DisplayName: "my-display-name",
				Owner: &storagev1.UserOrTeam{
					User: "my-user",
				},
				TemplateRef: &storagev1.TemplateRef{
					Name: "my-virtual-cluster-template",
				},
				Parameters: `my-parameter: my-value`,
			},
		},
		Project:  true,
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// VirtualClusterInstanceKubeConfig
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Retrieve Kube Config (Ingress)",
		Description: "If ingress endpoint is configured for the virtual cluster, you can retrieve the kube config for the virtual cluster through this endpoint",
		File:        path.Join(util.BaseResourcesPath, "virtualclusterinstance/kubeconfig.mdx"),
		Name:        "Virtual Cluster Kube Config",
		Resource:    "virtualclusterinstances",
		SubResource: "kubeconfig",
		Object: &managementv1.VirtualClusterInstanceKubeConfig{
			TypeMeta: metav1.TypeMeta{
				Kind:       "VirtualClusterInstanceKubeConfig",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{Namespace: "your-namespace"},
			Spec:       managementv1.VirtualClusterInstanceKubeConfigSpec{},
			Status: managementv1.VirtualClusterInstanceKubeConfigStatus{
				KubeConfig: `apiVersion: v1
kind: Config
clusters:
- cluster:
...`,
			},
		},
		SubResourceCreate:         true,
		SubResourceGetDescription: "If ingress endpoint is configured for the virtual cluster, you can retrieve the kube config for a virtual cluster like shown below.",
	})

	// VirtualClusterTemplate
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Virtual Cluster Template",
		Name:        "Virtual Cluster Template",
		Resource:    "virtualclustertemplates",
		Description: "Virtual Cluster templates can be used to create virtual clusters that have already certain applications deployed inside them or other predefined configuration applied. They are a powerful tool to create new predefined environments on demand.",
		File:        path.Join(util.BaseResourcesPath, "virtualclustertemplate.mdx"),
		Object: &storagev1.VirtualClusterTemplate{
			TypeMeta: metav1.TypeMeta{
				Kind:       "VirtualClusterTemplate",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-virtual-cluster-template",
			},
			Spec: storagev1.VirtualClusterTemplateSpec{
				DisplayName: "Isolated Virtual Cluster Template",
				Description: "This virtual cluster template deploys an isolated virtual cluster",
				Template: storagev1.VirtualClusterTemplateDefinition{
					VirtualClusterCommonSpec: storagev1.VirtualClusterCommonSpec{
						Access: nil,
						HelmRelease: storagev1.VirtualClusterHelmRelease{
							Values: `# Below you can configure the virtual cluster
isolation:
  enabled: true

# Checkout https://vcluster.com/docs for more config options`,
						},
					},
				},
				Access: []storagev1.Access{
					{
						Verbs: []string{"get"},
						Users: []string{"*"},
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// Runner - NOTE: Runner types don't exist in API v4.3.4 but runner documentation was preserved from main branch
	// util.GenerateObjectOverview(&util.ObjectInformation{
	// 	Title:       "Runner",
	// 	Name:        "Runner",
	// 	Resource:    "runners",
	// 	Description: "A runner to execute DevPod workspaces.",
	// 	File:        path.Join(util.BaseResourcesPath, "runner/runner.mdx"),
	// 	Object: &managementv1.Runner{
	// 		TypeMeta: metav1.TypeMeta{
	// 			Kind:       "Runner",
	// 			APIVersion: managementv1.SchemeGroupVersion.String(),
	// 		},
	// 		ObjectMeta: metav1.ObjectMeta{
	// 			Name: "my-runner",
	// 		},
	// 		Spec: managementv1.RunnerSpec{
	// 			RunnerSpec: storagev1.RunnerSpec{
	// 				DisplayName: "my-display-name",
	// 			},
	// 		},
	// 	},
	// 	Create:   true,
	// 	Retrieve: true,
	// 	Update:   true,
	// 	Delete:   true,
	// })

	// RunnerAccessKey - NOTE: Runner types don't exist in API v4.3.4 but runner documentation was preserved from main branch
	// util.GenerateObjectOverview(&util.ObjectInformation{
	// 	Title:       "Retrieve Runner Access Key",
	// 	Description: "You can retrieve the runner access key via this api",
	// 	File:        path.Join(util.BaseResourcesPath, "runner/accesskey.mdx"),
	// 	Name:        "Runner Access Key",
	// 	Resource:    "runners",
	// 	SubResource: "accesskey",
	// 	Object: &managementv1.RunnerAccessKey{
	// 		TypeMeta: metav1.TypeMeta{
	// 			Kind:       "RunnerAccessKey",
	// 			APIVersion: managementv1.SchemeGroupVersion.String(),
	// 		},
	// 		ObjectMeta: metav1.ObjectMeta{},
	// 		AccessKey:  "the-returned-access-key",
	// 	},
	// 	SubResourceGet:            true,
	// 	SubResourceGetDescription: "You can retrieve the runner access key via this api.",
	// })

	// SpaceInstance
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Space Instance",
		Name:        "Space",
		Resource:    "spaceinstances",
		Description: "Spaces are regular Kubernetes namespaces managed by the platform that are owned by a user or team. In Kubernetes, namespaces provide a mechanism for isolating groups of resources within a single cluster.",
		File:        path.Join(util.BaseResourcesPath, "spaceinstance/spaceinstance.mdx"),
		Object: &storagev1.SpaceInstance{
			TypeMeta: metav1.TypeMeta{
				Kind:       "SpaceInstance",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name:      "my-space",
				Namespace: "loft-p-my-project",
			},
			Spec: storagev1.SpaceInstanceSpec{
				DisplayName: "my-display-name",
				Owner: &storagev1.UserOrTeam{
					User: "my-user",
				},
				TemplateRef: &storagev1.TemplateRef{
					Name: "my-space-template",
				},
				Parameters: `my-parameter: my-value`,
			},
		},
		Project:  true,
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// SpaceTemplate
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Space Template",
		Resource:    "spacetemplates",
		Description: "Space templates can be used to create predefined space configurations that have certain applications already deployed inside them or other predefined configuration applied. They are a powerful tool to create new predefined environments on demand.",
		File:        path.Join(util.BaseResourcesPath, "spacetemplate.mdx"),
		Object: &storagev1.SpaceTemplate{
			TypeMeta: metav1.TypeMeta{
				Kind:       "SpaceTemplate",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-space-template",
			},
			Spec: storagev1.SpaceTemplateSpec{
				DisplayName: "Isolated Space Template",
				Description: "This space templates deploys an isolated space",
				Template: storagev1.SpaceTemplateDefinition{
					Objects: `apiVersion: v1
kind: ResourceQuota
metadata:
  name: loft-resource-quota
spec:
  hard:
    count/configmaps: '100'
    count/endpoints: '40'
    count/persistentvolumeclaims: '20'
    count/pods: '20'
    count/secrets: '100'
    count/services: '20'
    limits.cpu: '20'
    limits.ephemeral-storage: 160Gi
    limits.memory: 40Gi
    requests.cpu: '10'
    requests.ephemeral-storage: 60Gi
    requests.memory: 20Gi
    requests.storage: 100Gi
    services.loadbalancers: '1'
    services.nodeports: '0'`,
				},
				Access: []storagev1.Access{
					{
						Verbs: []string{"get"},
						Users: []string{"*"},
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// Project
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Project",
		Name:        "Project",
		Resource:    "projects",
		Description: "Projects are used to group virtual clusters and spaces together.",
		File:        path.Join(util.BaseResourcesPath, "project/project.mdx"),
		Object: &storagev1.Project{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Project",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-project",
			},
			Spec: storagev1.ProjectSpec{
				AllowedClusters: []storagev1.AllowedCluster{
					{
						Name: "my-allowed-cluster",
					},
				},
				AllowedTemplates: []storagev1.AllowedTemplate{
					{
						Name: "*",
						Kind: "VirtualClusterTemplate",
					},
					{
						Name: "*",
						Kind: "SpaceTemplate",
					},
				},
				Members: []storagev1.Member{
					{
						Kind:        "User",
						Group:       storagev1.SchemeGroupVersion.Group,
						Name:        "admin",
						ClusterRole: "project-admin",
					},
					{
						Kind:        "Team",
						Group:       storagev1.SchemeGroupVersion.Group,
						Name:        "my-team",
						ClusterRole: "project-user",
					},
				},
				VaultIntegration: &storagev1.VaultIntegrationSpec{},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// ProjectImportSpace
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Import Namespace",
		Description: "This API can be used to import an existing namespace from a connected cluster into the project.",
		File:        path.Join(util.BaseResourcesPath, "project/importspace.mdx"),
		Name:        "Import Namespace",
		Resource:    "projects",
		SubResource: "importspace",
		Object: &managementv1.ProjectImportSpace{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectImportSpace",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			SourceSpace: managementv1.ProjectImportSpaceSource{
				Name:       "my-namespace",
				Cluster:    "my-connected-cluster",
				ImportName: "my-name-in-project",
			},
		},
		SubResourceCreate:            true,
		SubResourceCreateDescription: "Import a namespace through this API.",
	})

	// ProjectMigrateSpaceInstnace
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Move Space To Other Project",
		Description: "This API can be used to move a space from one project to another.",
		File:        path.Join(util.BaseResourcesPath, "project/migratespaceinstance.mdx"),
		Name:        "Move Space To Other Project",
		Resource:    "projects",
		SubResource: "migratespaceinstance",
		Object: &managementv1.ProjectMigrateSpaceInstance{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectMigrateSpaceInstance",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			SourceSpaceInstance: managementv1.ProjectMigrateSpaceInstanceSource{
				Name:      "my-space",
				Namespace: "loft-p-my-other-project",
			},
		},
		SubResourceCreate:            true,
		SubResourceCreateDescription: "Move a space into another project using this API.",
	})

	// ProjectMigrateSpaceInstnace
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Move vCluster To Other Project",
		Description: "This API can be used to move a virtual cluster from one project to another.",
		File:        path.Join(util.BaseResourcesPath, "project/migratevirtualclusterinstance.mdx"),
		Name:        "Move Virtual Cluster To Other Project",
		Resource:    "projects",
		SubResource: "migratevirtualclusterinstance",
		Object: &managementv1.ProjectMigrateVirtualClusterInstance{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectMigrateVirtualClusterInstance",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			SourceVirtualClusterInstance: managementv1.ProjectMigrateVirtualClusterInstanceSource{
				Name:      "my-virtual-cluster",
				Namespace: "loft-p-my-other-project",
			},
		},
		SubResourceCreate:            true,
		SubResourceCreateDescription: "Move a virtual cluster into another project using this API.",
	})

	// ProjectMembers
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Retrieve Project Members",
		Description: "This API can be used to retrieve all users and teams that are members of this project. Does not include loft wide admins.",
		File:        path.Join(util.BaseResourcesPath, "project/members.mdx"),
		Name:        "Project Members",
		Resource:    "projects",
		SubResource: "members",
		Object: &managementv1.ProjectMembers{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectMembers",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Users: []managementv1.ProjectMember{
				{
					Info: storagev1.EntityInfo{
						Name:        "my-user",
						DisplayName: "My User",
						Email:       "my-email",
					},
				},
			},
			Teams: []managementv1.ProjectMember{
				{
					Info: storagev1.EntityInfo{
						Name:        "my-team",
						DisplayName: "My Team",
					},
				},
			},
		},
		SubResourceGet:            true,
		SubResourceGetDescription: "You can retrieve all project users and teams through this API.",
	})

	// ProjectTemplates
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Retrieve Project Templates",
		Description: "This API can be used to retrieve all allowed templates of this project.",
		File:        path.Join(util.BaseResourcesPath, "project/templates.mdx"),
		Name:        "Project Templates",
		Resource:    "projects",
		SubResource: "templates",
		Object: &managementv1.ProjectTemplates{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectTemplates",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta:                    metav1.ObjectMeta{},
			DefaultVirtualClusterTemplate: "my-default-vcluster-template",
			DefaultSpaceTemplate:          "my-default-space-template",
			SpaceTemplates: []managementv1.SpaceTemplate{
				{
					TypeMeta: metav1.TypeMeta{
						Kind:       "SpaceTemplate",
						APIVersion: managementv1.SchemeGroupVersion.String(),
					},
					ObjectMeta: metav1.ObjectMeta{
						Name: "my-default-space-template",
					},
				},
			},
			VirtualClusterTemplates: []managementv1.VirtualClusterTemplate{
				{
					TypeMeta: metav1.TypeMeta{
						Kind:       "VirtualClusterTemplate",
						APIVersion: managementv1.SchemeGroupVersion.String(),
					},
					ObjectMeta: metav1.ObjectMeta{
						Name: "my-default-vcluster-template",
					},
				},
			},
		},
		SubResourceGet:            true,
		SubResourceGetDescription: "You can retrieve all allowed templates through this API.",
	})

	// ProjectClusters
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Retrieve Project Clusters",
		Description: "This API can be used to retrieve all allowed clusters of this project.",
		File:        path.Join(util.BaseResourcesPath, "project/clusters.mdx"),
		Name:        "Project Clusters",
		Resource:    "projects",
		SubResource: "clusters",
		Object: &managementv1.ProjectClusters{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ProjectClusters",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Clusters: []managementv1.Cluster{
				{
					TypeMeta: metav1.TypeMeta{
						Kind:       "Cluster",
						APIVersion: managementv1.SchemeGroupVersion.String(),
					},
					ObjectMeta: metav1.ObjectMeta{
						Name: "my-cluster",
					},
				},
			},
		},
		SubResourceGet:            true,
		SubResourceGetDescription: "You can retrieve all allowed clusters through this API.",
	})

	// App
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "App",
		Resource:    "apps",
		Description: "Apps in the platform are a way for admins to package applications and scripts in consumable packages. These Apps can then be deployed into clusters, spaces, or virtual clusters.",
		File:        path.Join(util.BaseResourcesPath, "apps.mdx"),
		Object: &storagev1.App{
			TypeMeta: metav1.TypeMeta{
				Kind:       "App",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-app",
			},
			Spec: storagev1.AppSpec{
				DisplayName: "ArgoCD",
				Description: "Argo CD is a declarative, GitOps continuous delivery tool for Kubernetes",
				RecommendedApp: []storagev1.RecommendedApp{
					storagev1.RecommendedAppCluster,
				},
				AppConfig: storagev1.AppConfig{
					Icon: "https://argo-cd.readthedocs.io/en/stable/assets/logo.png",
					Config: clusterv1.HelmReleaseConfig{
						Chart: clusterv1.Chart{
							Name:    "argo-cd",
							RepoURL: "https://argoproj.github.io/argo-helm",
						},
					},
				},
				Access: []storagev1.Access{
					{
						Verbs: []string{"get"},
						Users: []string{"*"},
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// Cluster
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Cluster",
		Resource:    "clusters",
		Description: "Connected Kubernetes clusters that can be managed through the platform. You can allow users and teams to access those clusters and they can create new spaces and virtual clusters inside them.",
		File:        path.Join(util.BaseResourcesPath, "clusters/clusters.mdx"),
		ExtraContentBeforeExample: "## Platform-specific verbs\n" +
			"\n" +
			"In addition to standard Kubernetes RBAC verbs (`get`, `list`, `create`, `update`, `patch`, `delete`), the Cluster resource supports these platform-specific verbs for access control:\n" +
			"\n" +
			"| Verb | Description |\n" +
			"|------|-------------|\n" +
			"| `bind` | Required when adding a cluster to ClusterAccess rules. Allows granting users or teams permission to create spaces and virtual clusters on the cluster. |\n" +
			"| `connectlocal` | Required when setting `spec.local: true` on a cluster. Allows connecting the local cluster (where the platform is installed) to the platform for management. |\n" +
			"\n" +
			"### Example access rule with bind verb\n" +
			"\n" +
			"```yaml\n" +
			"apiVersion: management.loft.sh/v1\n" +
			"kind: Team\n" +
			"metadata:\n" +
			"  name: my-team\n" +
			"spec:\n" +
			"  access:\n" +
			"    - name: cluster-access\n" +
			"      verbs:\n" +
			"        - get\n" +
			"        - bind\n" +
			"      subresources:\n" +
			"        - clusters\n" +
			"      teams:\n" +
			"        - my-team\n" +
			"```",
		Object: &storagev1.Cluster{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Cluster",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-cluster",
			},
			Spec: storagev1.ClusterSpec{
				DisplayName: "My Cluster",
				Description: "My AWS Cluster",
				Config: storagev1.SecretRef{
					SecretName:      "my-kube-config-secret",
					SecretNamespace: "my-kube-config-secret-namespace",
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// Cluster Access
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Cluster Access",
		Plural:      "Cluster Accesses",
		Resource:    "clusteraccesses",
		Description: "Globally defined cluster access. You can allow users or teams to access certain clusters here and define their cluster roles in those clusters.",
		File:        path.Join(util.BaseResourcesPath, "clusteraccess.mdx"),
		Object: &storagev1.ClusterAccess{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ClusterAccess",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-cluster-access",
			},
			Spec: storagev1.ClusterAccessSpec{
				DisplayName: "Global Admins",
				Description: "Defines cluster access for the global admins",
				Clusters:    []string{"*"},
				LocalClusterAccessTemplate: storagev1.LocalClusterAccessTemplate{
					LocalClusterAccessSpec: storagev1.LocalClusterAccessSpec{
						Users: []storagev1.UserOrTeam{
							{
								Team: "loft-admins",
							},
						},
						ClusterRoles: []storagev1.ClusterRoleRef{
							{
								Name: "loft-cluster-admin",
							},
						},
						Priority: 1000000,
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// User
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "User",
		Resource:    "users",
		Description: "Users that can access the platform.",
		File:        path.Join(util.BaseResourcesPath, "user.mdx"),
		ExtraContentBeforeExample: "## Platform-specific verbs\n" +
			"\n" +
			"In addition to standard Kubernetes RBAC verbs (`get`, `list`, `create`, `update`, `patch`, `delete`), the User resource supports these platform-specific verbs for access control:\n" +
			"\n" +
			"| Verb | Description |\n" +
			"|------|-------------|\n" +
			"| `bind` | Required when adding a user to ClusterAccess rules or other access rules. Allows granting the user permissions on platform resources. |\n" +
			"| `makeowner` | Required when changing the owner of a resource to a user. Allows transferring ownership of projects, virtual clusters, spaces, or other platform resources. |\n" +
			"\n" +
			"### Example access rule with makeowner verb\n" +
			"\n" +
			"```yaml\n" +
			"apiVersion: management.loft.sh/v1\n" +
			"kind: User\n" +
			"metadata:\n" +
			"  name: admin-user\n" +
			"spec:\n" +
			"  access:\n" +
			"    - name: user-management\n" +
			"      verbs:\n" +
			"        - get\n" +
			"        - update\n" +
			"        - makeowner\n" +
			"      users:\n" +
			"        - admin-user\n" +
			"```",
		Object: &storagev1.User{
			TypeMeta: metav1.TypeMeta{
				Kind:       "User",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-user",
			},
			Spec: storagev1.UserSpec{
				Username:    "myuser",
				Email:       "myuser@test.com",
				DisplayName: "My User",
				Subject:     "my-user",
				ClusterRoles: []storagev1.ClusterRoleRef{
					{
						Name: "loft-management-admin",
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// Team
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Team",
		Resource:    "teams",
		Description: "Teams are composed of multiple users and define a way to manage cluster access or other objects for multiple users at once. You can assign users automatically to teams by their groups, which can be synced from an authentication provider. Teams can also access the platform through their own access keys and own spaces or other objects.",
		File:        path.Join(util.BaseResourcesPath, "team.mdx"),
		ExtraContentBeforeExample: "## Platform-specific verbs\n" +
			"\n" +
			"In addition to standard Kubernetes RBAC verbs (`get`, `list`, `create`, `update`, `patch`, `delete`), the Team resource supports these platform-specific verbs for access control:\n" +
			"\n" +
			"| Verb | Description |\n" +
			"|------|-------------|\n" +
			"| `bind` | Allows binding permissions to a team, enabling assignment of access rules and roles to that team. Required when adding a team to ClusterAccess rules. |\n" +
			"| `makeowner` | Allows transferring ownership of platform resources to a team. Used when changing the owner of projects, clusters, or other resources to a team. |\n" +
			"\n" +
			"### Example access rule with bind verb\n" +
			"\n" +
			"```yaml\n" +
			"apiVersion: management.loft.sh/v1\n" +
			"kind: Team\n" +
			"metadata:\n" +
			"  name: platform-admins\n" +
			"spec:\n" +
			"  access:\n" +
			"    - name: team-management\n" +
			"      verbs:\n" +
			"        - get\n" +
			"        - update\n" +
			"        - bind\n" +
			"      users:\n" +
			"        - admin\n" +
			"```",
		Object: &storagev1.Team{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Team",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-team",
			},
			Spec: storagev1.TeamSpec{
				Username:    "loftadmins",
				DisplayName: "Global Admins",
				Description: "All users in this team have full admin access to all clusters",
				Groups:      []string{"loft:admins"},
				ClusterRoles: []storagev1.ClusterRoleRef{
					{
						Name: "loft-management-admin",
					},
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// SharedSecret
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Global Secret",
		Resource:    "sharedsecrets",
		Description: "Global Secrets can be used to share sensitive information across users, teams and connected clusters. You can either access shared secrets through the Loft CLI or sync them directly to a project secret.",
		File:        path.Join(util.BaseResourcesPath, "sharedsecret.mdx"),
		Object: &storagev1.SharedSecret{
			TypeMeta: metav1.TypeMeta{
				Kind:       "SharedSecret",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name:      "my-global-secret",
				Namespace: "loft",
			},
			Spec: storagev1.SharedSecretSpec{
				DisplayName: "My Global Secret",
				Description: "Secret Data is base64 encoded.",
				Data: map[string][]byte{
					"password": []byte("password"),
				},
			},
		},
		Create:   true,
		Retrieve: true,
		Update:   true,
		Delete:   true,
	})

	// OwnedAccessKey
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Owned Access Key",
		Resource:    "ownedaccesskeys",
		Description: "Access keys let you authenticate with Loft API endpoints and Loft CLI in non-interactive environments such as from within CI/CD pipelines.",
		File:        path.Join(util.BaseResourcesPath, "ownedaccesskey.mdx"),
		Object: &managementv1.OwnedAccessKey{
			TypeMeta: metav1.TypeMeta{
				Kind:       "OwnedAccessKey",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{
				Name: "my-access-key",
			},
			Spec: managementv1.OwnedAccessKeySpec{
				AccessKeySpec: storagev1.AccessKeySpec{
					User:        "my-user",
					DisplayName: "My Access Key",
					TTL:         1728000,
					Type:        "User",
				},
			},
			Status: managementv1.OwnedAccessKeyStatus{},
		},
		Create: true,
		Update: true,
		Delete: true,
	})

	// DirectClusterEndpointTokens
	util.GenerateObjectOverview(&util.ObjectInformation{
		Name:        "Direct Cluster Endpoint Token",
		Resource:    "directclusterendpointtokens",
		Description: "Direct Cluster Endpoints are a feature to avoid the central Loft instance and directly connect to a connected Loft cluster.",
		File:        path.Join(util.BaseResourcesPath, "directclusterendpointtoken.mdx"),
		Object: &managementv1.DirectClusterEndpointToken{
			TypeMeta: metav1.TypeMeta{
				Kind:       "DirectClusterEndpointToken",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Spec:       managementv1.DirectClusterEndpointTokenSpec{},
			Status: managementv1.DirectClusterEndpointTokenStatus{
				Token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjV3RlZOcmU1Ty1ZazBMRmNoN3F1NzVlYlctdk5rdGJ5eTRlelJNQ3dKLVEifQ.eyJhdWQiOlsiaHR0cHM6V0ZXMuZGVmYXVsdCJdLCJleHAiOjE5ODMwNzXIubG...",
			},
		},
		Create: true,
	})

	// Config
	var sixty int64 = 60
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Loft Config",
		Name:        "Config",
		Resource:    "config",
		Description: "You can retrieve the platform config through this API.",
		File:        path.Join(util.BaseResourcesPath, "config.mdx"),
		Object: &managementv1.Config{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Config",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Status: managementv1.ConfigStatus{
				Authentication: managementv1.Authentication{
					AccessKeyMaxTTLSeconds:   10 * 60 * 60,
					LoginAccessKeyTTLSeconds: &sixty,
					Connector: managementv1.Connector{
						Github: &managementv1.AuthenticationGithub{
							ClientID:     "my-client-id",
							ClientSecret: "my-client-secret",
							RedirectURI:  "https://my-redirect-uri",
						},
					},
					CustomHttpHeaders: map[string]string{
						"X-My-Header": "my-value",
					},
				},
			},
		},
		Retrieve: true,
	})

	// Self
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Self",
		Name:        "Self",
		Resource:    "selves",
		Description: "Shows information about the current user. Alternatively you can also provide an alternative access key to retrieve information from.",
		File:        path.Join(util.BaseResourcesPath, "self.mdx"),
		Object: &managementv1.Self{
			TypeMeta: metav1.TypeMeta{
				Kind:       "Self",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Status: managementv1.SelfStatus{
				AccessKey:     "my-access-key",
				AccessKeyType: "Login",
				Subject:       "admin",
				Groups: []string{
					"loft:admins",
					"system:authenticated",
					"loft:authenticated",
					"loft:user:*",
					"loft:user:admin",
				},
			},
		},
		Create: true,
	})

	// ClusterRoleTemplate
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Cluster Role Template",
		Name:        "ClusterRoleTemplate",
		Resource:    "clusterroletemplates",
		Description: "ClusterRoleTemplate holds the clusterRoleTemplate information",
		File:        path.Join(util.BaseResourcesPath, "clusterroletemplate.mdx"),
		ExtraContentAfterExample: "## Policy rules\n" +
			"\n" +
			"The `rules` field under `clusterRoleTemplate` defines RBAC permissions using standard Kubernetes PolicyRule objects. Each rule specifies which actions (verbs) are allowed on which resources.\n" +
			"\n" +
			"### Verbs\n" +
			"\n" +
			"Verbs define the actions allowed on resources. Standard Kubernetes RBAC verbs include:\n" +
			"\n" +
			"| Verb | Description |\n" +
			"|------|-------------|\n" +
			"| `get` | Retrieve a single resource |\n" +
			"| `list` | Retrieve a collection of resources |\n" +
			"| `watch` | Watch for changes to resources |\n" +
			"| `create` | Create a new resource |\n" +
			"| `update` | Update an existing resource (replaces the entire object) |\n" +
			"| `patch` | Partially modify an existing resource |\n" +
			"| `delete` | Delete a single resource |\n" +
			"| `deletecollection` | Delete a collection of resources |\n" +
			"| `*` | Wildcard representing all verbs |\n" +
			"\n" +
			"### API groups\n" +
			"\n" +
			"API groups define which API the resources belong to. Common API groups include:\n" +
			"\n" +
			"| API Group | Description |\n" +
			"|-----------|-------------|\n" +
			"| `\"\"` | Core API group (pods, services, configmaps, secrets, namespaces) |\n" +
			"| `apps` | Deployments, DaemonSets, ReplicaSets, StatefulSets |\n" +
			"| `batch` | Jobs, CronJobs |\n" +
			"| `networking.k8s.io` | NetworkPolicies, Ingresses |\n" +
			"| `rbac.authorization.k8s.io` | Roles, RoleBindings, ClusterRoles, ClusterRoleBindings |\n" +
			"| `management.loft.sh` | vCluster Platform resources |\n" +
			"| `storage.loft.sh` | vCluster Platform storage resources |\n" +
			"| `*` | Wildcard matching all API groups |\n" +
			"\n" +
			"### Platform resources\n" +
			"\n" +
			"vCluster Platform resources in the `management.loft.sh` API group:\n" +
			"\n" +
			"| Resource | Description |\n" +
			"|----------|-------------|\n" +
			"| `announcements` | Platform announcements |\n" +
			"| `apps` | Application configurations |\n" +
			"| `backups` | Platform backups |\n" +
			"| `clusteraccesses` | Cluster access permissions |\n" +
			"| `clusterroletemplates` | Cluster role templates |\n" +
			"| `clusters` | Connected clusters |\n" +
			"| `configs` | Platform configuration |\n" +
			"| `events` | Platform events |\n" +
			"| `features` | Platform features |\n" +
			"| `licenses` | Platform licenses |\n" +
			"| `nodeclaims` | Node claims for auto-provisioning |\n" +
			"| `nodeenvironments` | Node environment configurations |\n" +
			"| `nodeproviders` | Node provider configurations |\n" +
			"| `nodetypes` | Node type definitions |\n" +
			"| `ownedaccesskeys` | User-owned access keys |\n" +
			"| `projects` | Projects |\n" +
			"| `selves` | Current user information |\n" +
			"| `sharedsecrets` | Shared secrets |\n" +
			"| `spaceinstances` | Space instances |\n" +
			"| `spacetemplates` | Space templates |\n" +
			"| `tasks` | Platform tasks |\n" +
			"| `teams` | Teams |\n" +
			"| `users` | Users |\n" +
			"| `virtualclusterinstances` | Virtual cluster instances |\n" +
			"| `virtualclustertemplates` | Virtual cluster templates |\n" +
			"\n" +
			"Common subresources include `projects/members`, `projects/templates`, `clusters/members`, `virtualclusterinstances/kubeconfig`, and `virtualclusterinstances/log`.\n" +
			"\n" +
			"### Resource names\n" +
			"\n" +
			"The `resourceNames` field optionally restricts a rule to specific named resources. When empty, the rule applies to all resources of the specified type.\n" +
			"\n" +
			"### Non-resource URLs\n" +
			"\n" +
			"The `nonResourceURLs` field specifies access to non-resource endpoints like `/healthz`, `/api`, `/apis`, and `/version`. Use `*` as a suffix to match paths (for example, `/healthz/*`).",
		Object: &managementv1.ClusterRoleTemplate{
			TypeMeta: metav1.TypeMeta{
				Kind:       "ClusterRoleTemplate",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Spec: managementv1.ClusterRoleTemplateSpec{
				ClusterRoleTemplateSpec: storagev1.ClusterRoleTemplateSpec{
					DisplayName: "Project User -No Create",
					Description: "Allows the user or team to manage the project. Gives only access to existing\n    space and virtual cluster objects but no creation or deletion privileges.",
					Management:  true,
					Access: []storagev1.Access{
						{
							Verbs: []string{"get"},
							Users: []string{"*"},
						},
					},
					ClusterRoleTemplate: storagev1.ClusterRoleTemplateTemplate{
						ObjectMeta: metav1.ObjectMeta{},
						Rules: []rbacv1.PolicyRule{
							{
								Verbs:     []string{"get", "list", "update"},
								APIGroups: []string{managementv1.SchemeGroupVersion.String()},
								Resources: []string{"spaceinstances", "virtualclusterinstances"},
							},
							{
								Verbs:     []string{"get", "list"},
								APIGroups: []string{managementv1.SchemeGroupVersion.String()},
								Resources: []string{"projectsecrets"},
							},
						},
					},
				},
			},
			Status: managementv1.ClusterRoleTemplateStatus{},
		},
		Create: true,
	})

	// NodeProvider
	util.GenerateObjectOverview(&util.ObjectInformation{
		Title:       "Node Provider",
		Name:        "NodeProvider",
		Resource:    "nodeproviders",
		ExtraImports:              "import FeatureTable from '@site/src/components/FeatureTable';",
		ExtraContentBeforeExample: "<FeatureTable names=\"auto-nodes-clusterapi\" />",
		Description: "NodeProvider holds the node provider information",
		File:        path.Join(util.BaseResourcesPath, "nodeprovider.mdx"),
		Object: &managementv1.NodeProvider{
			TypeMeta: metav1.TypeMeta{
				Kind:       "NodeProvider",
				APIVersion: managementv1.SchemeGroupVersion.String(),
			},
			ObjectMeta: metav1.ObjectMeta{},
			Spec: managementv1.NodeProviderSpec{
				NodeProviderSpec: storagev1.NodeProviderSpec{
					DisplayName: "Terraform Example",
					Terraform: &storagev1.NodeProviderTerraform{
						NodeTemplate: &storagev1.TerraformTemplate{
							Git: &storagev1.TerraformTemplateSourceGit{
								Repository: "https://github.com/my-org/my-repo.git",
							},
						},
						NodeTypes: []storagev1.TerraformNodeTypeSpec{
							{
								NamedNodeTypeSpec: storagev1.NamedNodeTypeSpec{
									Name: "medium",
									NodeTypeSpec: storagev1.NodeTypeSpec{
										Resources: corev1.ResourceList{
											corev1.ResourceCPU:    resource.MustParse("2"),
											corev1.ResourceMemory: resource.MustParse("4Gi"),
										},
										Properties: map[string]string{
											"instance-type": "t3.medium",
										},
									},
								},
							},
							{
								NamedNodeTypeSpec: storagev1.NamedNodeTypeSpec{
									Name: "large",
									NodeTypeSpec: storagev1.NodeTypeSpec{
										Resources: corev1.ResourceList{
											corev1.ResourceCPU:    resource.MustParse("2"),
											corev1.ResourceMemory: resource.MustParse("8Gi"),
										},
										Properties: map[string]string{
											"instance-type": "t3.large",
										},
									},
								},
							},
							{
								NamedNodeTypeSpec: storagev1.NamedNodeTypeSpec{
									Name: "xlarge",
									NodeTypeSpec: storagev1.NodeTypeSpec{
										Resources: corev1.ResourceList{
											corev1.ResourceCPU:    resource.MustParse("4"),
											corev1.ResourceMemory: resource.MustParse("8Gi"),
										},
										Properties: map[string]string{
											"instance-type": "c5.xlarge",
										},
									},
								},
							},
						},
					},
				},
			},
			Status: managementv1.NodeProviderStatus{},
		},
		Create: true,
	})

	util.DefaultRequire = false
	schema := &jsonschema.Schema{}
	schemaBytes, err := os.ReadFile(jsonSchemaPath)
	if err != nil {
		panic(fmt.Errorf("failed to read schema file %q: %w", jsonSchemaPath, err))
	}
	err = json.Unmarshal(schemaBytes, schema)
	if err != nil {
		panic(fmt.Errorf("failed to parse JSON schema from %q: %w", jsonSchemaPath, err))
	}

	// fmt.Println("properties:")
	// for childNode := schema.Properties.Oldest(); childNode != nil; childNode = childNode.Next() {
	// 	fmt.Printf("%v : %v\n", childNode.Key, childNode.Value)
	// }
	// fmt.Println(paths)
	for _, p := range paths {
		p := strings.TrimPrefix(p, "/")
		err := util.GenerateFromPathWithError(schema, util.BasePath+"/config", p, nil)
		if err != nil {
			fmt.Printf("Warning: Skipping path %q: %v\n", p, err)
			continue
		}
	}
}

// removeAllExceptPreserved deletes basePath and recreates it, but first backs
// up any paths listed in basePath/.generator-preserve and restores them
// afterward. This prevents the generator from destroying partials that are no
// longer produced from the current API types but are still imported by frozen
// versioned docs.
func removeAllExceptPreserved(basePath string) {
	preserveFile := filepath.Join(basePath, ".generator-preserve")

	// Read the list of paths to preserve (one per line, blank/# lines ignored).
	var preservePaths []string
	if f, err := os.Open(preserveFile); err == nil {
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			preservePaths = append(preservePaths, line)
		}
		f.Close()
	}

	// Always preserve the manifest file itself so it survives RemoveAll.
	preservePaths = append(preservePaths, ".generator-preserve")

	// Back up preserved paths into a temp directory.
	var backups []struct{ src, dst string }
	tmpDir, err := os.MkdirTemp("", "generator-preserve-*")
	if err != nil {
		fmt.Printf("Warning: could not create temp dir for preserved files: %v\n", err)
	} else {
		for _, rel := range preservePaths {
			src := filepath.Join(basePath, rel)
			dst := filepath.Join(tmpDir, rel)
			if err := copyAll(src, dst); err == nil {
				backups = append(backups, struct{ src, dst string }{src: src, dst: dst})
			}
		}
	}

	_ = os.RemoveAll(basePath)

	// Restore preserved files.
	for _, b := range backups {
		if err := copyAll(b.dst, b.src); err != nil {
			fmt.Printf("Warning: could not restore preserved path %q: %v\n", b.src, err)
		}
	}
}

// copyAll copies src to dst, preserving directory structure.
func copyAll(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}
	if info.IsDir() {
		return filepath.WalkDir(src, func(p string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			rel, _ := filepath.Rel(src, p)
			target := filepath.Join(dst, rel)
			if d.IsDir() {
				return os.MkdirAll(target, 0755)
			}
			return copyFile(p, target)
		})
	}
	return copyFile(src, dst)
}

// copyFile copies a single file from src to dst, creating parent dirs as needed.
func copyFile(src, dst string) error {
	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}
