# Grocery Store Backend

Hệ thống backend cho cửa hàng tạp hóa sử dụng kiến trúc microservices.

## Cấu trúc dự án

```
.
├── api-gateway/           # API Gateway
├── microservices/         # Các microservices
│   ├── user-service/     # Quản lý người dùng
│   ├── product-service/  # Quản lý sản phẩm
│   ├── payment-service/  # Xử lý thanh toán
│   ├── order-service/    # Quản lý đơn hàng
│   ├── discount-service/ # Quản lý giảm giá
│   ├── report-service/   # Quản lý báo cáo
│   ├── provider-service/ # Quản lý nhà cung cấp
│   ├── customer-service/ # Quản lý khách hàng
│   ├── employee-service/ # Quản lý nhân viên
│   └── purchase-order-service/ # Quản lý đơn đặt hàng
└── docker-compose.yml    # Cấu hình Docker Compose
```

## Các microservices

### User Service (Port: 3001)

- Quản lý người dùng (đăng ký, đăng nhập, quản lý profile)
- Phân quyền người dùng (admin, nhân viên, khách hàng)

### Product Service (Port: 3002)

- Quản lý sản phẩm (thêm, sửa, xóa, tìm kiếm)
- Quản lý danh mục sản phẩm
- Quản lý tồn kho

### Payment Service (Port: 3003)

- Xử lý thanh toán
- Quản lý giao dịch
- Tích hợp các cổng thanh toán

### Order Service (Port: 3004)

- Quản lý đơn hàng
- Quản lý hóa đơn
- Quản lý đơn nhập hàng

### Discount Service (Port: 3005)

- Quản lý mã giảm giá
- Quản lý chương trình khuyến mãi
- Áp dụng giảm giá cho đơn hàng

### Report Service (Port: 3006)

- Báo cáo doanh thu
- Báo cáo lợi nhuận
- Báo cáo bán hàng
- Báo cáo tồn kho theo danh mục
- Báo cáo sản phẩm sắp hết hạn
- Báo cáo nhập hàng theo nhà cung cấp
- Báo cáo sản phẩm bán chạy

## API Gateway (Port: 3000)

- Điều hướng request đến các microservices
- Xác thực và phân quyền
- Rate limiting
- Caching

## Cài đặt và chạy

1. Cài đặt Docker và Docker Compose
2. Clone repository
3. Chạy lệnh:

```bash
docker-compose up --build
```

## API Endpoints

### User Service

- POST /api/users/register - Đăng ký tài khoản
- POST /api/users/login - Đăng nhập
- GET /api/users/profile - Lấy thông tin profile
- PUT /api/users/profile - Cập nhật thông tin profile
- GET /api/users - Lấy danh sách người dùng (admin)
- PUT /api/users/:id - Cập nhật thông tin người dùng (admin)
- DELETE /api/users/:id - Xóa người dùng (admin)

### Product Service

- GET /api/products - Lấy danh sách sản phẩm
- GET /api/products/:id - Lấy chi tiết sản phẩm
- POST /api/products - Thêm sản phẩm (admin)
- PUT /api/products/:id - Cập nhật sản phẩm (admin)
- DELETE /api/products/:id - Xóa sản phẩm (admin)
- GET /api/categories - Lấy danh sách danh mục
- POST /api/categories - Thêm danh mục (admin)
- PUT /api/categories/:id - Cập nhật danh mục (admin)
- DELETE /api/categories/:id - Xóa danh mục (admin)

### Payment Service

- POST /api/payments - Tạo thanh toán
- GET /api/payments/:id - Lấy thông tin thanh toán
- PUT /api/payments/:id - Cập nhật trạng thái thanh toán

### Order Service

- POST /api/orders - Tạo đơn hàng
- GET /api/orders - Lấy danh sách đơn hàng
- GET /api/orders/:id - Lấy chi tiết đơn hàng
- PUT /api/orders/:id - Cập nhật trạng thái đơn hàng
- POST /api/purchase-orders - Tạo đơn nhập hàng
- GET /api/purchase-orders - Lấy danh sách đơn nhập hàng
- GET /api/purchase-orders/:id - Lấy chi tiết đơn nhập hàng
- PUT /api/purchase-orders/:id - Cập nhật trạng thái đơn nhập hàng

### Discount Service

- POST /api/discounts - Tạo mã giảm giá
- GET /api/discounts - Lấy danh sách mã giảm giá
- GET /api/discounts/:id - Lấy chi tiết mã giảm giá
- PUT /api/discounts/:id - Cập nhật mã giảm giá
- DELETE /api/discounts/:id - Xóa mã giảm giá

### Report Service

- GET /api/reports/revenue - Báo cáo doanh thu
- GET /api/reports/profit - Báo cáo lợi nhuận
- GET /api/reports/sales - Báo cáo bán hàng
- GET /api/reports/stock-by-category - Báo cáo tồn kho theo danh mục
- GET /api/reports/expiring-products - Báo cáo sản phẩm sắp hết hạn
- GET /api/reports/imports-by-provider - Báo cáo nhập hàng theo nhà cung cấp
- GET /api/reports/top-selling-products - Báo cáo sản phẩm bán chạy

## Công nghệ sử dụng

- Node.js
- Express.js
- MongoDB
- Docker
- Docker Compose
- JWT Authentication
- Microservices Architecture

# Grocery Store Management Website

A comprehensive web-based solution for managing grocery stores, streamlining inventory, sales, and customer management.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contact](#contact)

---

## Introduction

The Grocery Store Management Website is designed to help grocery store owners efficiently manage inventory, track sales, and handle customer data. This application aims to simplify daily operations, minimize errors, and improve customer satisfaction.

---

## Features

- **Inventory Management:** Track products, stock levels, and restock.
- **Sales Tracking:** Monitor sales, generate reports, and analyze trends.
- **Customer Management:** Maintain customer records and purchase history.
- **User Roles:** Separate access for manager, warehouse keeper, and sale agents.
- **Secure Authentication:** Role-based authentication for enhanced security.
- **Online Payment:** Pay with Momo.
- **Import product:** Import with only excel file or automation.

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript (React.js)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Cloudinary
- **Authentication:** JWT (JSON Web Token)
- **Version Control:** Git, GitHub

---

## Installation

### Requirements

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/BeIchTuan/GROCERY_STORE_BACKEND.git
   ```
2. Navigate to the project directory:
   ```bash
   cd GROCERY_STORE_BACKEND
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in the required fields in `.env`.

5. Start the development server:
   ```bash
   npm start
   ```
6. Server running at `http://localhost:3000`.

---

## Usage

1. **Login** as manager, warehouse keeper or sales agent to access the dashboard.
2. **Add new products** and set stock levels.
3. **Monitor sales** and generate sales reports.
4. **Manage customers** and view purchase history.
5. **Assign roles** and manage user permissions.
6. **Track inventory changes** in real time and receive low-stock notifications.
7. **Generate invoices** and send them directly to customers.
8. **Generate QR code** and pay fast.
9. **Export sales data** for accounting and analysis.
10. **Manage supplier information** and track incoming shipments.
11. **Review performance metrics** with visual dashboards and analytics.

---

## Contact

- **Name:** Be Ich Tuan
- **Email:** tuanbeich@gmail.com
- **GitHub:** [https://github.com/BeIchTuan](https://github.com/BeIchTuan)

Feel free to reach out if you have any questions or need further assistance.
