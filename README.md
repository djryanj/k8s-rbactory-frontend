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

k8s-rbactory-frontend is the static React-based frontend for k8s-rbactory.

# Demo

You can view a demo of the site [here](https://k8s-rbactory.netlify.app). Note that this demo site explicitly has the cluster browser functionality **DISABLED** and only the policy builder is operational.

# Non-Goals

1. Writing to Cluster

   This tool is intended to help cluster users understand RBAC within their cluster and to craft RBAC policies that work using a visual workflow and easy to use interface. It is _not_ intended to be able to write RBAC to the cluster, as that should be done after review and using better methods (e.g., GitOps) than this.

   As such it will never be extended with that functionality; e.g., **IT WILL BE READ ONLY FOREVER**. Any requests, issues, etc. to do so will be closed.

More non-goals will be added if needed.

# AI Disclosure

This tool was initially written with the assistance of AI for rapid prototyping.

However, going forward, it is the maintainer's position that AI assistance be limited to documentation and certain boilerplate tasks once the project is public. This is to help ensure that code is of the highest quality possible.

Any PR that contains changes that have leveraged AI MUST disclose that usage.

# License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
