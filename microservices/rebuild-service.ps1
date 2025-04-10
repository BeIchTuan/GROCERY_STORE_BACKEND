# rebuild-selected-service.ps1
# Script to rebuild and restart selected microservices in Minikube
# Run from the microservices directory

# Switch to Minikube Docker context
Write-Host "Switching to Minikube Docker context..." -ForegroundColor Cyan
& minikube -p minikube docker-env | Invoke-Expression

cd C:\React\GROCERY_STORE_BACKEND\microservices

# Define all available services
$allServices = @(
    "api-gateway",
    "customer-service",
    "discount-service",
    "employee-service",
    "order-service",
    "payment-service",
    "product-service",
    "provider-service",
    "purchase-order-service",
    "report-service",
    "user-service"
)

# Function to display menu and get selection
function Show-Menu {
    Clear-Host
    Write-Host "================ REBUILD AND DEPLOY SERVICES ================" -ForegroundColor Green
    Write-Host ""
    
    for ($i = 0; $i -lt $allServices.Count; $i++) {
        Write-Host "[$($i + 1)] $($allServices[$i])" -ForegroundColor Yellow
    }
    
    Write-Host "[A] Build ALL services" -ForegroundColor Magenta
    Write-Host "[S] Scale down ALL services to 1 replica" -ForegroundColor Cyan
    Write-Host "[Q] Quit" -ForegroundColor Red
    Write-Host ""
}

# Function to rebuild and restart a service
function Rebuild-Service {
    param (
        [string]$serviceName
    )
    
    Write-Host "Building $serviceName image..." -ForegroundColor Green
    docker build -t $serviceName`:latest -f $serviceName/Dockerfile .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error building $serviceName. Build failed." -ForegroundColor Red
        return $false
    }
    
    Write-Host "Rolling restart of $serviceName..." -ForegroundColor Cyan
    kubectl rollout restart deployment $serviceName
    
    Write-Host "Waiting for $serviceName rollout..." -ForegroundColor Cyan
    kubectl rollout status deployment $serviceName
    
    return $true
}

# Main loop
$continue = $true
while ($continue) {
    Show-Menu
    $selection = Read-Host "Enter your selection"
    
    switch -Regex ($selection) {
        "^[1-9][0-9]*$" {
            $index = [int]$selection - 1
            if ($index -ge 0 -and $index -lt $allServices.Count) {
                $serviceName = $allServices[$index]
                $success = Rebuild-Service -serviceName $serviceName
                if ($success) {
                    Write-Host "$serviceName has been rebuilt and restarted successfully!" -ForegroundColor Green
                }
                Read-Host "Press Enter to continue"
            } else {
                Write-Host "Invalid selection. Please try again." -ForegroundColor Red
                Start-Sleep -Seconds 2
            }
        }
        "^[aA]$" {
            Write-Host "Building and restarting ALL services..." -ForegroundColor Magenta
            foreach ($service in $allServices) {
                $success = Rebuild-Service -serviceName $service
                if (-not $success) {
                    Write-Host "Stopping due to build error." -ForegroundColor Red
                    break
                }
            }
            Write-Host "All services have been processed." -ForegroundColor Green
            Read-Host "Press Enter to continue"
        }
        "^[sS]$" {
            Write-Host "Scaling down ALL services to 1 replica..." -ForegroundColor Cyan
            foreach ($service in $allServices) {
                kubectl scale deployment $service --replicas=1
            }
            Write-Host "All services have been scaled down to 1 replica." -ForegroundColor Green
            Read-Host "Press Enter to continue"
        }
        "^[qQ]$" {
            $continue = $false
        }
        default {
            Write-Host "Invalid selection. Please try again." -ForegroundColor Red
            Start-Sleep -Seconds 2
        }
    }
}

Write-Host "Script completed. Goodbye!" -ForegroundColor Green