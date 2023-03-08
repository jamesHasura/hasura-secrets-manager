# hasura-secrets-manager

### Description 

This project creates a hasura zero downtime deployment for scenarios when there is a rotating credential that expires after a certain duration and needs to be refreshed & reloaded into hasura from AWS Secrets Manager.

### Requirements 

  - Amazon Elastic Kubernetes Service (EKS) 1.17+ using ECS

  - [Secrets Store CSI Driver Installed](https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation.html)
    
  - Ensure to enable the reconciler feature of the Secrets Store CSI driver:
  
         helm upgrade -n kube-system csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --set enableSecretRotation=true --set    
         rotationPollInterval=3600s
         
  - [Install the Secrets Manager and Config Provider](https://github.com/aws/secrets-store-csi-driver-provider-aws)
  

### How to Run? 


1.) In the Dockerfile directory /Docker/Dockerfile, build the Dockerfile using the tag 'secret-refresh-pod'

   **`Example: Docker build -t 'secret-refresh-pod'`**

