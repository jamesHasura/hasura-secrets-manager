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

- Edit the refresh-credential.js file for your use case
  
   **`Example: you'll likely want to change patchDeploymentSpec and patchRes within the restartDeployment function.`**

- Build the Dockerfile in the Docker directory /Docker/Dockerfile using the tag 'secret-refresh-pod'
 
 **`Example: Docker build -t 'secret-refresh-pod'`**

### Step 2: Edit the k8s Deployment File

Edit the ENV variables in the K8s deployment file located at /test.

### Step 3: Run the K8s files in /test

**`kubectl apply -f ./test`**
