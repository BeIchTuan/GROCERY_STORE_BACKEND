# Grocery Store Backend

A robust backend system for grocery store management built with a microservices architecture.

![Node.js](https://img.shields.io/badge/Node.js-16.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Compatible-blue)

## Architecture Overview

This project follows a microservices architecture with the following components:

```
.
├── api-gateway/           # API Gateway (Port: 3000)
├── shared/                # Shared libraries and utilities
├── user-service/          # User authentication & management (Port: 3001)
├── product-service/       # Product & inventory management (Port: 3002)
├── payment-service/       # Payment processing (Port: 3003)
├── order-service/         # Order management (Port: 3004)
├── discount-service/      # Discounts & promotions (Port: 3005)
├── report-service/        # Reports & analytics (Port: 3006)
├── provider-service/      # Supplier management
├── customer-service/      # Customer management
├── employee-service/      # Employee management
├── purchase-order-service/ # Purchase order management
├── k8s/                  # Kubernetes deployment files
└── docker-compose.yml    # Docker Compose configuration
```

## Core Services

### API Gateway (Port: 3000)

- Central entry point for all client requests
- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting and caching
- API documentation with Swagger

### User Service (Port: 3001)

- User registration and authentication
- Profile management
- Role-based access control (Admin, Employee, Customer)
- JWT token generation and validation

### Product Service (Port: 3002)

- Product CRUD operations
- Category management
- Inventory tracking
- Product search and filtering

### Payment Service (Port: 3003)

- Payment processing
- Integration with MoMo payment gateway
- Transaction management
- Payment status tracking

### Order Service (Port: 3004)

- Order creation and management
- Invoice generation
- Order status tracking
- Integration with inventory and payment services

### Discount Service (Port: 3005)

- Discount code management
- Promotion rules
- Discount application and validation

### Report Service (Port: 3006)

- Sales and revenue reporting
- Inventory reporting
- Top-selling products analysis
- Customizable report generation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MongoDB (v5.0 or higher)

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/BeIchTuan/GROCERY_STORE_BACKEND.git
   cd GROCERY_STORE_BACKEND
   ```

2. Install dependencies for all services:

   ```bash
   # Install dependencies for shared module first
   cd microservices/shared && npm install
   cd ..

   # Install dependencies for each service
   for dir in */; do
     cd "$dir" && npm install && cd ..
   done
   ```

3. Set up environment variables:

   ```bash
   # Copy example env files in each service
   for dir in */; do
     cp "$dir/.env.example" "$dir/.env"
   done

   # Edit .env files with your configuration
   ```

4. Start services using Docker Compose:
   ```bash
   docker-compose up
   ```

### Docker Development

Run all services with Docker Compose:

```bash
docker-compose up --build
```

For individual services:

```bash
docker-compose up <service-name>
```

## API Documentation

Once running, API documentation is available at:

- Swagger UI: http://localhost:3000/api-docs

## Core API Endpoints

### User Management

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Authentication
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Product Management

- `GET /api/products` - List all products
- `POST /api/products` - Create product (Admin)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Order Management

- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Payment Processing

- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment status

### Reporting

- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/top-products` - Top selling products

## Deployment

### Docker Deployment

See [Docker Compose file](./docker-compose.yml) for container configuration.

### Kubernetes Deployment

For Kubernetes deployment instructions, see the [K8s Deployment Guide](./k8s/README.md).

## Technologies

- **Backend Framework:** Node.js, Express
- **Database:** MongoDB
- **Communication:** REST APIs, RabbitMQ for async messaging
- **Authentication:** JWT (JSON Web Tokens)
- **Containerization:** Docker, Kubernetes
- **Payment Integration:** MoMo
- **Documentation:** Swagger/OpenAPI

## Contact

**Developer:** Be Ich Tuan  
**Email:** tuanbeich@gmail.com  
**GitHub:** [BeIchTuan](https://github.com/BeIchTuan)
