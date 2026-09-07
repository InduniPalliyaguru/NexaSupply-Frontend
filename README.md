<div align="center">

  <!-- Main Logo / Hero Image -->
  <img src="images/logo.png" alt="NexaSupply Logo" width="120" style="border-radius: 12px; margin-bottom: 10px;" />

  # 🛒 NexaSupply
  ### ⚡ Smart B2B Wholesale & Inventory Distribution System ⚡

  <p align="center">
    <b>Enterprise-grade supply chain solution connecting wholesale distributors & retailers seamlessly.</b>
  </p>

  <!-- Modern Tech Stack Badges -->
  <p align="center">
    <a href="https://spring.io/projects/spring-boot">
      <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
    </a>
    <a href="https://www.mysql.com/">
      <img src="https://img.shields.io/badge/Database-Aiven%20Cloud%20MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    </a>
    <a href="https://jwt.io/">
      <img src="https://img.shields.io/badge/Security-JWT%20%2b%20RBAC-E6155E?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
      <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS%20(ES6%2B)-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    </a>
    <a href="https://getbootstrap.com/">
      <img src="https://img.shields.io/badge/UI-Bootstrap%205.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap" />
    </a>
  </p>

  <!-- Key Metrics / Project Quick Highlights -->
  <p align="center">
    <img src="https://img.shields.io/badge/Architecture-Enterprise--Grade-2E8B57?style=flat-square&logo=architecture" alt="Architecture" />
    <img src="https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/License-Academic%20Project-blue?style=flat-square" alt="License" />
  </p>

  <hr width="80%" />
</div>

---

## 📌 Overview

**NexaSupply** is an **Enterprise-Grade Web Application** designed specifically for B2B Wholesale Distribution and Supply Chain Management. The system seamlessly handles orders, inventory stock levels, credit limit allocations, and financial ledgers between **Wholesale Distributors** and **Retail Store Owners** in a secure, efficient, and scalable environment.

---

## 🌟 Key Engineering & Architectural Highlights

| Highlight | Description |
| :--- | :--- |
| **☁️ Cloud Data Persistence** | Utilizes a remote, high-performance **Aiven Cloud MySQL Database** instance for robust data persistence instead of local storage. |
| **🛡️ Client-Side Session Guarding & Dynamic Routing** | Enforces routing guards via `config.js` and `auth.js` to redirect unauthorized users to `index.html`. Authenticates JWT tokens stored in `localStorage` for **Role-Based Access Control (RBAC)**. |
| **💳 Automated Credit Limit & Approval Engine** | New retailer registrations remain in `PENDING` state until approved and assigned a credit limit by an Admin. Credit limits are dynamically validated upon every order placement. |
| **⚡ Decoupled RESTful Data Binding** | Native **Vanilla JS (ES6+ Fetch API)** architecture built without heavy frontend frameworks to facilitate lightweight, asynchronous RESTful API communications. |
| **📊 Dual-Role Analytics Dashboards** | Interactive **Chart.js** dashboards providing visual metrics for sales trends, inventory stock levels, and financial ledgers tailored to both Admin and Retailer perspectives. |
| **📄 Automated PDF Receipts & Background Emailing** | Generates automated PDF invoices during order confirmation/payment and dispatches them asynchronously to retailers via **Spring Background Services (@Async)**. |
| **🤖 Rule-Based AI Assistant** | Embedded intelligent **Chatbot Widget** capable of providing instant responses regarding real-time stock levels, credit limit utilization, and balance queries. |

---

## 👥 User Ecosystem & Role-Based Workflows (RBAC)

### 👑 1. ROLE_ADMIN (Wholesale Owner / Warehouse Manager)
- 📥 **Pending Retailers Approval:** Review pending retailer registration requests, approve or reject applications, and allocate dynamic credit limits.
- 📦 **Inventory Management:** Complete CRUD capabilities for product categories, inventory stocks, and supplier restock requests.
- 🚚 **Shipment & Delivery Tracking:** Assign drivers to confirmed orders and track real-time shipment status updates.
- 📜 **Audit & Ledger Control:** Access AOP-driven system audit logs and global credit ledgers across all retailer accounts.

### 🏪 2. ROLE_RETAILER (Retail Store Owner / Wholesale Buyer)
- ⏳ **Onboarding Workflow:** Self-registration screen with dynamic redirection to an approval hold state until verified by an Admin.
- 🛍️ **Interactive Storefront:** Browse catalog inventory with real-time stock availability badges.
- 🛒 **Smart Order Placement:** Place bulk product orders subject to automated credit limit and stock availability checks.
- 📄 **Order Tracking & Finance:** Monitor order fulfillment pipelines, download auto-generated PDF invoices, and review account ledgers.

---

## 🏗️ End-to-End Business Process Flow

* **Step 1:** Retailer Sign-Up (Initial Status: `PENDING`)
* **Step 2:** Admin Verification (Approve & Assign Credit Limit e.g., LKR 200,000)
* **Step 3:** Account Activation & Login (JWT Token stored in LocalStorage)
* **Step 4:** Storefront Browsing & Product Selection
* **Step 5:** Smart Order Placement (Automated Stock & Credit Limit Validation)
* **Step 6:** Order Submission & Admin Approval
* **Step 7:** Inventory Auto-Deduction & Driver Assignment for Shipment
* **Step 8:** Background Engine (`@Async`) generates PDF Invoice & Emails Receipt to Retailer

---

## 💻 Tech Stack Breakdown

- **UI Structure:** HTML5
- **Styling & Themes:** Bootstrap 5.3 + Custom CSS3 (`admin/`, `retailer/`, `chat.css`)
- **Client Scripting:** Vanilla JavaScript (ES6+ Fetch API)
- **State Management:** Browser `localStorage` (`jwtToken`, `userRole`, `referenceCode`)
- **Data Visualization:** Chart.js
- **Backend Communication:** RESTful API / JSON (`http://localhost:8080/api/v1`)
- **Cloud Infrastructure:** Aiven MySQL Cloud Service

---

## 📂 Frontend Project Directory Structure
```
NexaSupply-Frontend/
├── css/
│   ├── admin/
│   │   ├── dashboard.css
│   │   ├── inventory.css
│   │   ├── orders.css
│   │   ├── payment.css
│   │   ├── profile.css
│   │   ├── shipment.css
│   │   ├── supplier.css
│   │   └── user.css
│   ├── retailer/
│   │   ├── dashboard.css
│   │   ├── finance.css
│   │   ├── order.css
│   │   ├── profile.css
│   │   └── storefront.css
│   ├── admin.css
│   ├── chat.css
│   └── style.css
├── images/
│   └── logo.png
├── js/
│   ├── admin/
│   │   ├── dashboard.js
│   │   ├── inventory.js
│   │   ├── orders.js
│   │   ├── payment.js
│   │   ├── profile.js
│   │   ├── shipment.js
│   │   ├── supplier.js
│   │   └── user.js
│   ├── retailer/
│   │   ├── dashboard.js
│   │   ├── finance.js
│   │   ├── order.js
│   │   ├── profile.js
│   │   └── storefront.js
│   ├── auth.js
│   ├── chat.js
│   └── config.js
├── pages/
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── inventory.html
│   │   ├── orders.html
│   │   ├── payments-ledger.html
│   │   ├── profile.html
│   │   ├── shipments.html
│   │   ├── suppliers-restock.html
│   │   └── users.html
│   ├── auth/
│   │   └── pending-approval.html
│   ├── common/
│   │   └── chat-widget.html
│   └── retailer/
│       ├── dashboard.html
│       ├── my-finance.html
│       ├── my-orders.html
│       ├── profile.html
│       └── storefront.html
└── index.html
```
---

## 🚀 Execution & Setup Instructions

1. **Database & Backend Initialization:**
   - Ensure the **Aiven Cloud MySQL Server** is up and running.
   - Start the **Spring Boot Backend** application on `http://localhost:8080`.
2. **Frontend Configuration (`js/config.js`):**
   - Confirm that the backend base endpoint URL is pointed to `http://localhost:8080/api/v1`.
3. **Launch Application:**
   - Open `index.html` via **VS Code Live Server** or any local web server after starting the backend.
   - Client-side dynamic routing guards will automatically intercept direct page hits to enforce authentication state.

---

## 🎓 Academic Module Credentials

- **Coursework:** Final Comprehensive Software Project
- **Module:** Advanced API Development (AAD)
- **Institution:** Institute of Software Engineering (IJSE)
- **Developer:** Induni Palliyaguru
