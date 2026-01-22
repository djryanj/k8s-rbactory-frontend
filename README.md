# K8s RBACtory Frontend

# About k8s-rbactory

k8s-rbactory is a READ ONLY Kubernetes RBAC helper tool.

## Features

- Visually craft RBAC policies using a friendly interface
- Policies can be crafted using presets or totally from scratch
- When enabled and available via the [`k8s-rbactory-backend`](https://github.com/djryanj/k8s-rbactory-backend) API server, you can browse existing RBAC policies in-cluster
- Copy existing policies to the builder to use as a starting point or to modify as needed
- Basic security analysis of created policies, highlighting potentially dangerous configurations
- YAML downloads of policies created with the tool
- Accessiblity feature (e.g., colorblind-friendly palette and screen reader tags) for all components
- Light/Dark mode (defaults to your system preferences)

k8s-rbactory-frontend is the static React-based frontend for k8s-rbactory.

# Demo

You can view a demo of the site [here](https://k8s-rbactory.netlify.app). Note that this demo site explicitly has the cluster browser functionality **DISABLED** and only the policy builder is operational.

# Local Only

k8s-rbactory-frontend is a React-based frontend that runs completely locally in your browser (after it's downloaded from whatever server you are hosting it on). No data is gathered or transmitted to anywhere.

# Deployment

## Docker (Quick)

2. Run the container:

```bash
docker run -p 8080:8080 ghcr.io/djryanj/k8s-rbactory-frontend:dev
```

### Kubernetes Deployment

Deployment manifests are available in the [hack/k8s-manfiests](./hack/k8s-manifests/) directory. A `kustomization.yaml` file is provided for use with kustomize (recommended).

#### Method 1: Direct from GitHub (Recommended for Quick Testing)

Deploy directly from the GitHub repository without cloning:

```bash
kubectl apply -k github.com/djryanj/k8s-rbactory-frontend/hack/k8s-manifests
```

#### Method 2: From Local Clone

Clone the repository and deploy:

```bash
# Clone the repository
git clone https://github.com/djryanj/k8s-rbactory-frontend.git
cd k8s-rbactory-frontend

# Deploy
kubectl apply -k hack/k8s-manifests
```

#### Method 3: Using Kustomize CLI

For more control and to preview changes:

```bash
# Preview what will be deployed
kustomize build hack/k8s-manifests

# Deploy using kustomize
kustomize build hack/k8s-manifests | kubectl apply -f -
```

#### Method 4: Customize deployment using your own overlay

Create a `kustomization.yaml` file that extends what's in GitHub:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - github.com/djryanj/k8s-rbactory-frontend/hack/k8s-manifests?ref=v1.0.0

# Override namespace
namespace: my-custom-namespace

# Add custom labels
commonLabels:
  team: my-team
  cost-center: "12345"

# Override image
images:
  - name: k8s-rbactory-frontend
    newName: my-registry.example.com/k8s-rbactory-backend
    newTag: v2.0.0

# Override replicas
replicas:
  - name: k8s-rbactory-frontend
    count: 5
```

Deploy that:

```shell
kubectl apply -k kustomization.yaml
```

#### Verify the deployment:

```bash
kubectl get pods -n k8s-rbactory -l app=k8s-rbactory-frontend
kubectl logs -n k8s-rbactory -l app=k8s-rbactory-frontend
```

### Ingress

A reference [ingress manifest](./hack/k8s-manifests/ingress.yaml) is provided in [hack/k8s-manifests](./hack/k8s-manifests/) for reference but it is **NOT** included in the provided `kustomization.yaml`.

### Burstable By Default

The [provided manifests](./hack/k8s-manifests/) deliberately put this deployment in the [burstable QoS class](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/#burstable) and some basic tolerations for spot instances. This is done under the assumption that this deployment is non-critical to most clusters.

# Non-Goals

## Writing to Cluster

This tool is intended to help cluster users understand RBAC within their cluster and to craft RBAC policies that work using a visual workflow and easy to use interface. It is _not_ intended to be able to write RBAC to the cluster, as that should be done after review and using better methods (e.g., GitOps) than this.

As such it will never be extended with that functionality; e.g., **IT WILL BE READ-ONLY FOREVER**. Any requests, issues, etc. to do so will be closed.

## Mobile Interface

Although a React frontend should largely work on mobile devices without a lot of developer effort, it is not a goal to support them beyond what is out of the box as cluster operators aren't likely to be using a mobile device to access this service.

If PR's are submitted with fixes to mobile rendering, they will be considered, so long as they don't break other functionality; however, no additional effort will be made to make this tool work on mobile.

More non-goals will be added if needed.

# AI Disclosure

This tool was initially written with the assistance of AI for rapid prototyping.

However, going forward, it is the maintainer's position that AI assistance be limited to documentation and certain boilerplate tasks once the project is public. This is to help ensure that code is of the highest quality possible.

Any PR that contains changes that have leveraged AI MUST disclose that usage.

# Contributing

Contributions are welcome!

See [CONTRIBUTING](CONTRIBUTING.md).

# License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
