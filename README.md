# Hasura & AWS Secrets Manager

### Description

This project creates a hasura zero downtime deployment for scenarios when there are rotating AWS Secrets Manager credential(s) that expire after a certain duration and then must be refreshed/injected into HGE.

### Requirements

- Amazon Elastic Kubernetes Service (EKS) 1.17+ using ECS

- [Secrets Store CSI Driver Installed](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation.html)
- Ensure to enable the reconciler feature of the Secrets Store CSI driver:

       helm upgrade -n kube-system csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --set enableSecretRotation=true --set
       rotationPollInterval=3600s

- [Install the Secrets Manager and Config Provider](https://github.com/aws/secrets-store-csi-driver-provider-aws)

## How to Run?

### Step 1: Edit and build the DockerFile

- Create an .env folder with the following variables:

  - DEPLOYMENT_NAMESPACE=default
  - DEPLOYMENT_NAME=hasura-deployment
  - SECRETS_STORE_PATH=./secrets-store
  - DELAY_RESTART=10000

- Build the Dockerfile in the Docker directory /Docker/Dockerfile using the tag 'secret-refresh-pod'

  **`Example: Docker build -t 'secret-refresh-pod'`**

### Step 2: create an env folder in the /k8s directory

**`AWS_ROLE_ARN=xxxx`**

### Step 3: Run the K8s files in /k8s

**`kubectl apply -f ./k8s`**
