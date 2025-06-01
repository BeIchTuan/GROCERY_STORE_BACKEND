# Microservices Deployment Guide for Minikube

This guide provides step-by-step instructions for deploying the Grocery Store Backend microservices architecture on Minikube.

## Prerequisites

### 1. Docker Desktop

- Download from [Docker's official website](https://www.docker.com/products/docker-desktop)
- Install and enable WSL 2 if prompted
- Verify installation with Docker Desktop showing "Docker is running"

### 2. Kubernetes CLI (kubectl)

```powershell
# Create directory for kubectl
New-Item -Path 'C:\kubectl' -ItemType Directory -Force

# Download kubectl
Invoke-WebRequest -Uri "https://dl.k8s.io/release/v1.28.2/bin/windows/amd64/kubectl.exe" -OutFile "C:\kubectl\kubectl.exe"

# Add to PATH
$env:Path += ";C:\kubectl"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)

# Verify installation
kubectl version --client
```

### 3. Minikube

```powershell
# Download Minikube
Invoke-WebRequest -Uri "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe" -OutFile "C:\kubectl\minikube.exe"

# Verify installation
minikube version
```

## Deployment Process

### 1. Start Minikube Cluster

Open PowerShell as Administrator:

```powershell
# Start Minikube with Docker driver
minikube start --cpus=4 --memory=8192 --disk-size=20g --driver=docker

# Enable required add-ons
minikube addons enable metrics-server
minikube addons enable ingress
```

> Note: To use Hyper-V instead of Docker, use `--driver=hyperv` (requires Hyper-V enabled in Windows Features)

### 2. Build Docker Images

Point your Docker CLI to the Minikube Docker daemon:

```powershell
& minikube -p minikube docker-env | Invoke-Expression
```

Navigate to the project root:

```powershell
cd C:\React\GROCERY_STORE_BACKEND\microservices
```

Build shared library first:

```powershell
docker build -t shared:latest ./shared
```

Build all service images:

```powershell
foreach ($service in @("api-gateway", "user-service", "product-service", "payment-service", "order-service", "discount-service", "report-service", "provider-service", "customer-service", "employee-service", "purchase-order-service")) {
    docker build -t $service`:latest ./$service
}
```

### 3. Deploy Microservices using Kustomize

The `k8s` directory contains all necessary configuration files:

```
k8s/
├── api-gateway.yaml
├── user-service.yaml
├── product-service.yaml
├── order-service.yaml
├── payment-service.yaml
├── discount-service.yaml
├── report-service.yaml
├── provider-service.yaml
├── customer-service.yaml
├── employee-service.yaml
├── purchase-order-service.yaml
├── mongodb.yaml
├── configmap.yaml
├── secrets.yaml
└── kustomization.yaml
```

Deploy all services at once:

```powershell
kubectl apply -k .\k8s
```

### 4. Verify Deployment Status

```powershell
# Check all pods
kubectl get pods

# Check all services
kubectl get services

# Check horizontal pod autoscalers
kubectl get hpa

# Check detailed pod information if errors occur
kubectl describe pod <pod-name>
```

### 5. Access the Application

#### Method 1: Minikube Tunnel (for LoadBalancer services)

In a separate PowerShell window (as Administrator):

```powershell
minikube tunnel
```

Keep this window open to maintain connectivity. In another window:

```powershell
kubectl get services api-gateway
```

Access the application at the External-IP (typically http://EXTERNAL-IP:3000)

#### Method 2: Port Forwarding (alternative)

For direct access to a specific service:

```powershell
kubectl port-forward service/api-gateway 3000:3000
```

Then access at http://localhost:3000

### 6. Load Testing

To verify scalability and auto-scaling:

```bash
# Using Apache Benchmark
ab -n 100000 -c 1000 http://localhost:3000/api/discounts

# Monitor scaling
kubectl get hpa -w
kubectl get pods -w
```

### 7. Cleanup

When finished:

```powershell
# Remove all resources
kubectl delete -k .\k8s

# Stop Minikube
minikube stop
```

## Important Notes

1. **Resource Requirements**: Ensure your machine has sufficient resources (8GB+ RAM, 4+ CPU cores)

2. **Image Pull Policy**:

   - `IfNotPresent`: Images must be built locally in the Minikube environment
   - `Always`: Requires accessible image registry

3. **Troubleshooting**:

   - View logs: `kubectl logs -f <pod-name>`
   - Check pod details: `kubectl describe pod <pod-name>`
   - Check service endpoints: `kubectl get endpoints`

4. **Administrator Rights**: Always run PowerShell as Administrator when working with Minikube

5. **Kubernetes Dashboard**: Access with `minikube dashboard` for visual monitoring
