# 🇱🇰 Smart Citizen LK - National Digital Service Platform

> **One Identity. One Platform. Infinite Services.**

**Smart Citizen LK** is a next-generation E-Governance platform designed for Sri Lanka. It unifies government services (Birth Certificates, NICs, Passports), creates a digital identity for citizens, and integrates a smart e-commerce marketplace triggered by life events.

---

## 🚀 Key Features

### 👤 Citizen Portal
*   **Digital Identity:** Secure Login via NIC (National Identity Card).
*   **E-Services:** Apply for Birth Certificates, Police Reports, and Visa services online.
*   **Digital Wallet:** Store and download verified PDF certificates with QR codes.
*   **Smart Marketplace:** AI-driven product recommendations based on life events (e.g., "Birth Registration" → suggests "Baby Care Products").
*   **Payment Gateway:** Simulated PayHere/LankaQR integration.

### 🏛️ Government Admin Portals
*   **Grama Niladhari (GS) Dashboard:** 
    *   Village-level verifications and land dispute management
    *   Citizen record management
    *   Land registration and verification
    *   Local statistics and reporting
*   **Divisional Secretary (DS) Dashboard:** 
    *   **Approval Queue:** Multi-level application processing
    *   **Regional Operations:** Real-time division monitoring and incident tracking
    *   **Certificate Management:** Digital signature issuance with QR verification
    *   **Analytics Dashboard:** Live performance metrics and approval statistics
    *   **Audit Logs:** Complete system activity tracking with security monitoring
    *   **Notifications:** Real-time alerts for pending actions and escalations
*   **Super Admin Dashboard (President/System Admin):** 
    *   **System Monitor:** Real-time health metrics, citizen count, transaction tracking
    *   **Division Management:** Assign DS officers to provinces/districts/divisions
    *   **User Management:** Create/manage GS, DS, and Admin accounts
    *   **Service Configuration:** Update prices, processing times, and availability
    *   **Revenue Analytics:** Detailed breakdowns by service type and region
    *   **Audit & Security Logs:** Terminal-style security event monitoring
    *   **Deployments:** CI/CD pipeline monitoring and version tracking
    *   **Support Tickets:** Centralized helpdesk and issue management
    *   **Integrations:** Third-party service health monitoring (SMS, Email, Payments, Storage)
    *   **Feature Flags:** Controlled rollout of new features with percentage-based deployment

### 🤖 Tech Features
*   **AI Chatbot:** NLP-based assistant for service queries.
*   **PDF Generation:** Automated official certificate generation (Python ReportLab).
*   **Real-time Analytics:** Live charts for revenue and application status.
*   **Real-time Data Integration:** Zero hardcoded data - all dashboards fetch live data from MongoDB with loading states and error handling.
*   **Role-based Access Control:** JWT-secured endpoints with admin/DS/GS/citizen role verification.
*   **Audit Trail System:** Complete activity logging with timestamps, severity levels, and security monitoring.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16.0.10 (React 19)** | App Router with Turbopack, Tailwind CSS, TypeScript, Lucide Icons |
| **Backend** | **Python FastAPI** | High-performance Async API, Pydantic Models, Motor Driver |
| **Database** | **MongoDB Atlas** | Cloud NoSQL Database with async Motor driver |
| **Security** | **JWT & Bcrypt** | Secure Token Authentication & Password Hashing |
| **State Management** | **React Hooks** | useState, useEffect with real-time data fetching |
| **PDF Generation** | **ReportLab** | Automated official certificate generation |
| **API Architecture** | **RESTful Design** | Role-based routing with /admin, /ds, /gs, /auth endpoints |

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the project locally.

### 1️⃣ Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   MongoDB Atlas Connection String

### 2️⃣ Backend Setup (Python API)

1.  Navigate to the backend folder:
    ```bash
    cd smart-citizen-backend
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Mac/Linux:
    # source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install fastapi uvicorn motor pydantic python-dotenv bcrypt pyjwt reportlab email-validator
    ```
4.  Setup Environment Variables:
    *   Create a `.env` file inside `smart-citizen-backend/`.
    *   Add your MongoDB URI:
        ```env
        MONGO_URI=mongodb+srv://<your_user>:<your_password>@cluster0.mongodb.net/?appName=Cluster0
        DB_NAME=smart_citizen_lk
        SECRET_KEY=super_secret_key_2025
        ```
5.  **Seed the Database** (Create Admin Users):
    ```bash
    python seed.py
    ```
6.  Start the Server:
    ```bash
    uvicorn main:app --reload
    ```
    *Server running at: `http://127.0.0.1:8000`*

---

### 3️⃣ Frontend Setup (Next.js)

1.  Open a **new terminal** and navigate to the frontend folder:
    ```bash
    cd smart-citizen-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *App running at: `http://localhost:3000`*

---

## 🔐 Default Login Credentials

Use these accounts to test the different dashboards.

| Role | NIC (User ID) | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `900000000V` | `admin` | System Monitor, Division Management, Service Config, Revenue, Deployments, Support, Integrations, Feature Flags |
| **GS Officer** | `888888888V` | `gs` | Village Verifications, Land Disputes, Citizen Records |
| **DS Officer** | `21234567890` or `199911223344` | `ds` | Approval Queue, Regional Operations, Certificate Issuing, Analytics, Audit Logs |
| **Citizen** | *(Register New)* | *(Your Choice)* | Apply Services, Wallet, Marketplace, AI Recommendations |

---

## 🧪 How to Test the Full Flow

### 🎯 Citizen Application Flow
1.  **Register** a new Citizen account (`http://localhost:3000/register`).
2.  **Login** and apply for a **"Birth Certificate"** or **"NIC Application"**.
3.  **Login as GS Officer** (`888888888V`) -> Go to "Pending Verifications" -> **Approve**.
4.  **Login as DS Officer** (`777777777V`) -> Go to "Approval Queue" -> **Sign & Issue**.
5.  **Login as Citizen** again -> Check **Digital Wallet**.
    *   🎉 You will see the **Download Button**.
    *   Click it to generate the **Official PDF Certificate**.
6.  Check **Dashboard**:
    *   See "Smart AI Recommendations" (e.g., Baby Products) appearing because the Birth Certificate was approved!

### 👑 Super Admin Features (NEW)
1.  **Login as Super Admin** (`999999999V` / `admin`).
2.  **System Monitor:** View real-time citizen count, transactions, revenue, and security logs.
3.  **Division Management:** Navigate to `/admin/super/divisions` -> Assign DS officers to specific provinces/districts.
4.  **Service Configuration:** Go to `/admin/super/services` -> Update prices and processing times for any government service.
5.  **Revenue Analytics:** Check `/admin/super/revenue` for detailed service-wise revenue breakdowns.
6.  **Audit Logs:** Visit `/admin/super/logs` to see terminal-style security event monitoring.
7.  **Deployments:** Monitor CI/CD pipeline status at `/admin/super/deployments`.
8.  **Support Tickets:** Manage helpdesk tickets at `/admin/super/support`.
9.  **Integrations:** Check third-party service health at `/admin/super/integrations`.
10. **Feature Flags:** Control feature rollouts at `/admin/super/features`.

### 📊 DS Dashboard Features (NEW)
1.  **Login as DS Officer** (`777777777V` / `ds`).
2.  **Regional Operations:** View real-time statistics for your assigned division at `/admin/ds/regional`.
3.  **Approval Queue:** Process pending applications with multi-stage workflow.
4.  **Analytics:** Monitor approval rates, pending counts, and processing times.
5.  **Audit Logs:** Track all activities within your division.
6.  **Notifications:** Receive real-time alerts for escalations and urgent cases.

---

## � Backend API Endpoints

### Authentication
*   `POST /api/auth/register` - Register new user
*   `POST /api/auth/login` - User login (returns JWT)

### Citizen Services
*   `GET /api/applications` - Get user's applications
*   `POST /api/applications` - Submit new application
*   `GET /api/products` - Get marketplace products
*   `POST /api/recommendations` - Get AI-powered recommendations

### Admin Endpoints (Protected - Admin Role)
*   `GET /api/admin/stats` - System statistics (citizens, transactions, revenue)
*   `GET /api/admin/users` - Get all officers (GS, DS, Admin)
*   `DELETE /api/admin/users/{id}` - Remove officer
*   `GET /api/admin/divisions` - Get all DS divisions
*   `POST /api/admin/assign-ds` - Assign DS to division
*   `GET /api/admin/services` - Get all services configuration
*   `PUT /api/admin/services/{id}` - Update service details
*   `GET /api/admin/revenue` - Revenue analytics by service
*   `GET /api/admin/deployments` - CI/CD deployment status
*   `GET /api/admin/support/tickets` - Support ticket management
*   `GET /api/admin/integrations` - Third-party integrations health
*   `GET /api/admin/features` - Feature flags configuration

### DS Endpoints (Protected - DS Role)
*   `GET /api/ds/queue` - Applications pending DS approval
*   `GET /api/ds/stats` - Division-level statistics
*   `GET /api/ds/audit-logs` - Audit trail for division
*   `GET /api/ds/notifications` - Real-time notifications
*   `POST /api/ds/approve/{id}` - Approve application & generate certificate

### GS Endpoints (Protected - GS Role)
*   `GET /api/gs/queue` - Applications pending GS verification
*   `POST /api/gs/verify/{id}` - Verify and forward to DS

---

## �📂 Project Structure
```plaintext
smart-citizen/
├── smart-citizen-backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.py
│   └── main.py
└── smart-citizen-frontend/
    ├── pages/
    ├── components/
    ├── styles/
    └── utils/
```

---

## 📝 License

This project is licensed under the MIT License.
---

### 👨‍💻 Developed By
**Jeyapragash**
*Full Stack Developer | Next.js & Python Enthusiast*