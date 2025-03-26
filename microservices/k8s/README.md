# **Hướng dẫn triển khai Microservices trên Minikube**

## **1. Chuẩn bị môi trường**

1. **Cài đặt Docker Desktop**  
   - Tải Docker Desktop cho Windows từ [trang chủ Docker](https://www.docker.com/products/docker-desktop).  
   - Cài đặt và kích hoạt **WSL 2** (nếu được nhắc).  
   - Khởi động Docker Desktop cho đến khi thấy **"Docker is running"**.

2. **Cài đặt kubectl**  
   - Tham khảo hướng dẫn chính thức: [Hướng dẫn cài đặt kubectl](https://kubernetes.io/docs/tasks/tools/)  
   - Hoặc sử dụng PowerShell (Administrator):
     ```powershell
     # Tạo thư mục để lưu kubectl
     New-Item -Path 'C:\kubectl' -ItemType Directory -Force

     # Tải kubectl
     Invoke-WebRequest -Uri "https://dl.k8s.io/release/v1.28.2/bin/windows/amd64/kubectl.exe" -OutFile "C:\kubectl\kubectl.exe"

     # Thêm C:\kubectl vào biến môi trường PATH
     $env:Path += ";C:\kubectl"
     [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)

     # Kiểm tra cài đặt
     kubectl version --client
     ```

3. **Cài đặt Minikube**  
   - Tải Minikube cho Windows:
     ```powershell
     Invoke-WebRequest -Uri "https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe" -OutFile "C:\kubectl\minikube.exe"

     # Kiểm tra cài đặt
     minikube version
     ```

---

## **2. Khởi động Minikube**

Mở PowerShell (Administrator):
```powershell
# Khởi động Minikube với Docker driver
minikube start --cpus=4 --memory=8192 --disk-size=20g --driver=docker

# Bật các addon cần thiết
minikube addons enable metrics-server
minikube addons enable ingress
```
> Nếu bạn muốn dùng **Hyper-V** thay vì Docker, thêm `--driver=hyperv`.

---

## **3. Build Docker images cho các microservices**

**Quan trọng**: Để build image trực tiếp trong Minikube, bạn cần **chuyển Docker daemon** sang môi trường Minikube:

```powershell
& minikube -p minikube docker-env | Invoke-Expression
```

Sau đó, di chuyển đến thư mục gốc dự án **(GROCERY_STORE_BACKEND)**:
```powershell
cd C:\React\GROCERY_STORE_BACKEND\microservices
```

Xây dựng tất cả các images:
```powershell
foreach ($service in @("api-gateway", "user-service", "product-service", "payment-service", "order-service", "discount-service", "report-service", "provider-service", "customer-service", "employee-service", "purchase-order-service")) {
    docker build -t $service`:latest ./$service
}
```
> Lệnh trên lần lượt build các **Dockerfile** trong từng thư mục microservice.  
> Nếu bạn **không muốn** build cục bộ, có thể push images lên Docker Hub hoặc registry riêng rồi pull về.

---

## **4. Triển khai toàn bộ microservices bằng Kustomize**

Bạn có thư mục `k8s` chứa:
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

Trong đó, tệp **`kustomization.yaml`** đã liệt kê tất cả file YAML ở trên.  
Để triển khai, bạn chỉ cần chạy:

```powershell
kubectl apply -k .\k8s
```
> Lệnh này sẽ **apply toàn bộ** các tệp YAML được khai báo trong `kustomization.yaml`.

---

## **5. Kiểm tra trạng thái**

- **Kiểm tra Pod**:
  ```powershell
  kubectl get pods
  ```
- **Kiểm tra Service**:
  ```powershell
  kubectl get services
  ```
- **Kiểm tra Horizontal Pod Autoscaler (HPA)**:
  ```powershell
  kubectl get hpa
  ```

---

## **6. Truy cập ứng dụng**

### **6.1. Minikube Tunnel (nếu có LoadBalancer)**
Trong PowerShell (Administrator), chạy:
```powershell
minikube tunnel
```
Giữ **mở** cửa sổ này để duy trì kết nối.  
Ở cửa sổ khác, lấy IP của API Gateway (LoadBalancer):
```powershell
kubectl get services api-gateway
```
Bạn sẽ thấy `EXTERNAL-IP` hiển thị, ví dụ: `127.0.0.1` hoặc `192.168.xx.xx`.  
Truy cập **http://EXTERNAL-IP:3000** để vào API Gateway.

### **6.2. ClusterIP Services**
Các service có kiểu **ClusterIP** chỉ truy cập **bên trong** cluster. Bạn có thể gọi chúng từ **API Gateway** hoặc từ **Pod** khác trong cluster.

---

## **7. Thử nghiệm tải cao**

Để kiểm tra tính ổn định và **auto-scaling**:

1. **Apache Benchmark (ab)** (trên WSL hoặc máy Linux/Mac):
   ```bash
   ab -n 10000 -c 100 http://EXTERNAL-IP:3000/api/path
   ```
   - `-n 10000`: Gửi 10.000 request.
   - `-c 100`: 100 request đồng thời.

2. **Kiểm tra HPA**:
   ```powershell
   # Kiểm tra HPA
    kubectl get hpa -w

    # Theo dõi việc mở rộng pods
    kubectl get pods -w
   ```
   Nếu CPU usage tăng vượt ngưỡng, Kubernetes sẽ tự động tạo thêm Pod (đã khai báo trong YAML).

---

## **8. Dọn dẹp**

Khi không cần dùng nữa, bạn có thể xóa toàn bộ resource:
```powershell
kubectl delete -k .\k8s
```
Sau đó dừng Minikube:
```powershell
minikube stop
```

---

# **Lưu ý và Chú ý**

1. **Kustomize**:  
   - Sử dụng tệp `kustomization.yaml` để quản lý nhiều file YAML dễ dàng.  
   - Triển khai với `kubectl apply -k .\k8s` thay vì `kubectl apply -f` từng tệp.

2. **Minikube Driver**:  
   - Mặc định hướng dẫn dùng `--driver=docker`. Nếu dùng Hyper-V, cần bật Hyper-V trong Windows Features.  

3. **ImagePullPolicy**:  
   - Nếu đặt `IfNotPresent`, hãy chắc chắn image đã được build và có sẵn trong Minikube Docker daemon.  
   - Nếu đặt `Always`, đảm bảo bạn có registry để pull.

4. **Tài nguyên (CPU, RAM)**:  
   - Minikube yêu cầu tài nguyên khá lớn (8GB RAM, 4 CPU). Hãy đảm bảo máy đủ mạnh.  
   - Điều chỉnh `--cpus`, `--memory`, `--disk-size` tùy nhu cầu.

5. **LoadBalancer trên Minikube**:  
   - Minikube mô phỏng LoadBalancer thông qua `minikube tunnel`.  
   - Nếu bạn dùng Cloud (EKS, GKE, AKS), sẽ có IP hoặc DNS thật cho LoadBalancer.

6. **Kiểm tra log**:  
   - Dùng `kubectl logs -f <pod-name>` để xem log trực tiếp.  
   - Nếu Pod bị lỗi khởi động, xem `kubectl describe pod <pod-name>` để biết nguyên nhân.

7. **Quyền Administrator**:  
   - Trên Windows, nên chạy PowerShell/Command Prompt dưới quyền Admin khi dùng Minikube, Docker, Hyper-V.

---

> **Chúc bạn triển khai thành công!** Nếu gặp vấn đề, hãy kiểm tra lại log, cấu hình YAML, hoặc đặt câu hỏi trên cộng đồng Kubernetes.  