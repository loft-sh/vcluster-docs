// Services listed in "What do you want to build?" card grids, in root sidebar order.
// Add an entry only after its root service page has shipped. Paths are root docs
// routes, so the same list works from the root, vCluster, and Platform docs.
// `shortTitle` is the label for inline link lists.
const services = [
  {
    to: '/bare-metal-as-a-service',
    icon: 'dns',
    title: 'Bare metal as a service',
    shortTitle: 'Bare metal',
    description: 'Give tenants dedicated physical servers on demand, provisioned from your hardware and reached over SSH.',
  },
  {
    to: '/vms-as-a-service',
    icon: 'layers',
    title: 'VMs as a service',
    shortTitle: 'VMs',
    description: 'Give tenants virtual machines on demand, sized from your catalog and reached over SSH.',
  },
  {
    to: '/kubernetes-as-a-service',
    icon: 'hub',
    title: 'Kubernetes as a service',
    shortTitle: 'Kubernetes',
    description: 'Offer managed Kubernetes clusters with isolated control planes, dedicated worker nodes, and self-service provisioning.',
  },
  {
    to: '/ai-platforms-as-a-service',
    icon: 'psychology',
    title: 'AI platforms as a service',
    shortTitle: 'AI platforms',
    description: 'Deliver NVIDIA Run:ai and NVIDIA Dynamo to tenants from tested, certified Stacks.',
  },
  {
    to: '/internal-platforms-and-dev-clusters',
    icon: 'groups',
    title: 'Team and CI clusters as a service',
    shortTitle: 'Team and CI clusters',
    description: 'Give engineering teams and CI pipelines their own isolated clusters, from long-running to ephemeral.',
  },
];

export default services;
