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
*   **Grama Niladhari (GS) Dashboard:** Manage village-level verifications and land disputes.
*   **Divisional Secretary (DS) Dashboard:** Final approval queue and Digital Signature issuance.
*   **Super Admin Dashboard:** System monitoring, Revenue analytics, and User management.

### 🤖 Tech Features
*   **AI Chatbot:** NLP-based assistant for service queries.
*   **PDF Generation:** Automated official certificate generation (Python ReportLab).
*   **Real-time Analytics:** Live charts for revenue and application status.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (React)** | App Router, Tailwind CSS, TypeScript, Lucide Icons |
| **Backend** | **Python FastAPI** | High-performance Async API, Pydantic Models |
| **Database** | **MongoDB Atlas** | Cloud NoSQL Database (Motor Async Driver) |
| **Security** | **JWT & Bcrypt** | Secure Token Authentication & Password Hashing |
| **Utils** | **ReportLab** | PDF Generation Engine |

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
| **Super Admin** | `999999999V` | `admin` | System Stats, Product Manager, Officer Creation |
| **GS Officer** | `888888888V` | `gs` | Village Verifications, Land Disputes |
| **DS Officer** | `777777777V` | `ds` | Final Approvals, Certificate Issuing |
| **Citizen** | *(Register New)* | *(Your Choice)* | Apply Services, Wallet, Marketplace |

---

## 🧪 How to Test the Full Flow

1.  **Register** a new Citizen account (`http://localhost:3000/register`).
2.  **Login** and apply for a **"Birth Certificate"**.
3.  **Login as GS Officer** (`888888888V`) -> Go to "Pending Verifications" -> **Approve**.
4.  **Login as DS Officer** (`777777777V`) -> Go to "Approval Queue" -> **Sign & Issue**.
5.  **Login as Citizen** again -> Check **Digital Wallet**.
    *   🎉 You will see the **Download Button**.
    *   Click it to generate the **Official PDF Certificate**.
6.  Check **Dashboard**:
    *   See "Smart AI Recommendations" (e.g., Baby Products) appearing because the Birth Certificate was approved!

---

## 📂 Project Structure
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