# 🇱🇰 Smart Citizen LK - Administrative Hierarchy Implementation

## Overview
Complete implementation of Sri Lankan government administrative hierarchy with multi-level approval workflows.

---

## 🏛️ Administrative Structure

### **Level 1: PRESIDENT/SUPER ADMIN (රාජ්‍ය මට්ටම)**
- **Role:** `admin`
- **Powers:**
  - ✅ Assign DS officers to divisions
  - ✅ View all divisions and officers
  - ✅ Manage system services
  - ✅ View revenue and system stats
  - ✅ Delete any officer

### **Level 2: DS (Divisional Secretary - ප්‍රාදේශීය ලේකම්)**
- **Role:** `ds`
- **Powers:**
  - ✅ Add new GS officers to their division
  - ✅ View all GS officers under them
  - ✅ Approve applications (after GS approval)
  - ✅ View approval queue
  - ✅ View issued certificates
- **Reports To:** President/Admin

### **Level 3: GS (Grama Niladhari - ග්‍රාම නිලධාරී)**
- **Role:** `gs`
- **Powers:**
  - ✅ Add new citizens to their section
  - ✅ Approve applications (first level)
  - ✅ View villagers in their section
  - ✅ Manage land disputes
  - ✅ View section statistics
- **Reports To:** DS officer

### **Level 4: CITIZEN (පුරවැසියා)**
- **Role:** `citizen`
- **Powers:**
  - ✅ Apply for government services
  - ✅ View their applications
  - ✅ Download certificates
  - ✅ Withdraw pending applications

---

## 📋 Service Approval Levels

### **Level 1: GS_ONLY** (Direct Issue)
**Examples:** Residence Certificate, Character Certificate, Income Certificate

**Workflow:**
```
Citizen → GS → ✅ Completed (Certificate Issued)
```

### **Level 2: GS_DS** (Two-Level Approval)
**Examples:** Birth Certificate, Land Ownership, Business Registration

**Workflow:**
```
Citizen → GS (Approve) → DS (Approve) → ✅ Completed
```

### **Level 3: GS_DS_DISTRICT** (District Level)
**Examples:** Marriage Certificate, Police Reports, Construction Permits

**Workflow:**
```
Citizen → GS → DS → District Secretary → ✅ Completed
```

### **Level 4: GS_DS_DISTRICT_MINISTRY** (National Level)
**Examples:** Passport, National ID, Visa, Driving License

**Workflow:**
```
Citizen → GS → DS → District → Ministry → ✅ Completed
```

### **Level 5: PRESIDENTIAL** (Highest Level)
**Examples:** Presidential Pardons, Special Citizenship, State Awards

**Workflow:**
```
Citizen → GS → DS → District → Ministry → President → ✅ Completed
```

---

## 🔄 New API Endpoints

### **Admin Routes** (`/api/admin`)

#### 1. Assign DS to Division
```http
POST /api/admin/assign-ds
Authorization: Bearer <admin_token>

{
  "ds_nic": "777777777V",
  "province": "Western",
  "district": "Colombo",
  "ds_division": "Colombo DS Division"
}
```

#### 2. Get All Divisions
```http
GET /api/admin/divisions
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "ds_nic": "777777777V",
    "ds_name": "Mrs. Perera (DS)",
    "province": "Western",
    "district": "Colombo",
    "division": "Colombo DS Division",
    "phone": "0114445555",
    "email": "ds@gov.lk"
  }
]
```

---

### **DS Routes** (`/api/ds`)

#### 1. Add GS Officer
```http
POST /api/ds/add-gs
Authorization: Bearer <ds_token>

{
  "fullname": "Officer Jayasinghe",
  "nic": "987654321V",
  "phone": "0771234567",
  "email": "gs_jayasinghe@gov.lk",
  "password": "securepassword",
  "gs_section": "Bambalapitiya GS Section",
  "address": "Bambalapitiya GS Office, Colombo 04"
}
```

**Response:**
```json
{
  "message": "GS officer Officer Jayasinghe added successfully",
  "details": {
    "gs_id": "674a8f...",
    "gs_name": "Officer Jayasinghe",
    "gs_nic": "987654321V",
    "gs_section": "Bambalapitiya GS Section",
    "division": "Colombo DS Division",
    "reports_to": "Mrs. Perera (DS)"
  }
}
```

#### 2. Get All GS Officers
```http
GET /api/ds/gs-officers
Authorization: Bearer <ds_token>
```

**Response:**
```json
[
  {
    "id": "674a8f...",
    "fullname": "Officer K. Silva (GS)",
    "nic": "888888888V",
    "phone": "0112223333",
    "email": "gs@gov.lk",
    "gs_section": "Wellawatta GS Section",
    "division": "Colombo DS Division"
  }
]
```

---

### **GS Routes** (`/api/gs`)

#### 1. Add Citizen
```http
POST /api/gs/add-citizen
Authorization: Bearer <gs_token>

{
  "fullname": "Kamal Perera",
  "nic": "199812345678",
  "phone": "0771112222",
  "email": "kamal@example.com",
  "password": "citizen123",
  "address": "123, Galle Road, Wellawatta"
}
```

**Response:**
```json
{
  "message": "Citizen Kamal Perera added successfully",
  "details": {
    "citizen_id": "674a9a...",
    "citizen_name": "Kamal Perera",
    "citizen_nic": "199812345678",
    "gs_section": "Wellawatta GS Section",
    "division": "Colombo DS Division",
    "registered_by": "Officer K. Silva (GS)"
  }
}
```

---

### **Application Routes** (`/api/applications`)

#### 1. Create Application (Enhanced with Auto-Assignment)
```http
POST /api/applications
Authorization: Bearer <citizen_token>

{
  "service_type": "Birth Certificate",
  "applicant_nic": "199812345678",
  "details": {
    "name": "Baby Perera",
    "mother_name": "Sita Perera",
    "father_name": "Kamal Perera",
    "date_of_birth": "2025-12-01"
  },
  "approval_level": "gs_ds"
}
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "id": "674ab1...",
  "approval_level": "gs_ds",
  "current_stage": "gs",
  "assigned_to": "888888888V"
}
```

#### 2. Approve/Reject Application (Multi-Level)
```http
PUT /api/applications/{app_id}/status
Authorization: Bearer <gs_or_ds_token>

{
  "status": "Approved",
  "comments": "Documents verified. Birth registered in records."
}
```

**Response:**
```json
{
  "message": "Application approved at gs level",
  "next_stage": "ds",
  "final_status": "Pending",
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T12:30:00.000Z",
      "comments": "Documents verified. Birth registered in records."
    }
  ]
}
```

---

## 📊 Database Schema Updates

### **User Collection**
```javascript
{
  "_id": ObjectId("..."),
  "fullname": "Officer K. Silva (GS)",
  "nic": "888888888V",
  "phone": "0112223333",
  "email": "gs@gov.lk",
  "password": "hashed_password",
  "role": "gs",  // "citizen" | "gs" | "ds" | "admin"
  "address": "Wellawatta GS Office",
  
  // NEW: Geographic Hierarchy
  "province": "Western",
  "district": "Colombo",
  "ds_division": "Colombo DS Division",
  "gs_section": "Wellawatta GS Section",
  "reports_to": "777777777V"  // DS NIC
}
```

### **Application Collection**
```javascript
{
  "_id": ObjectId("..."),
  "service_type": "Birth Certificate",
  "applicant_nic": "199812345678",
  "details": {...},
  "status": "Pending",
  "created_at": ISODate("2025-12-14T10:00:00.000Z"),
  
  // NEW: Multi-Level Approval
  "approval_level": "gs_ds",  // "gs_only" | "gs_ds" | "gs_ds_district" | "gs_ds_district_ministry"
  "current_approval_stage": "ds",  // Current stage
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T12:30:00.000Z",
      "comments": "Documents verified"
    }
  ],
  "assigned_gs": "888888888V",
  "assigned_ds": "777777777V",
  "assigned_district": null,
  "certificate_path": "generated_certs/674ab1....pdf"
}
```

### **Service Collection (NEW)**
```javascript
{
  "_id": ObjectId("..."),
  "service_name": "Birth Certificate",
  "category": "Certificates",
  "description": "Official birth certificate issued by Registrar General",
  "fee": 1200.0,
  "processing_days": 1,
  
  // Approval Configuration
  "approval_level": "gs_ds",
  "required_approvers": ["gs", "ds"],
  "required_documents": ["Parent NICs", "Birth Notification"],
  "is_active": true
}
```

---

## 🚀 Testing the Hierarchy

### **Step 1: Run Seed Script**
```powershell
cd smart-citizen-backend
python seed.py
```

**Creates:**
- ✅ President/Admin: `999999999V` / `admin`
- ✅ DS Officer: `777777777V` / `ds`
- ✅ GS Officer: `888888888V` / `gs`

---

### **Step 2: Login as President**
```http
POST /api/auth/login

{
  "nic": "999999999V",
  "password": "admin"
}
```

---

### **Step 3: Assign DS to Division**
```http
POST /api/admin/assign-ds
Authorization: Bearer <admin_token>

{
  "ds_nic": "777777777V",
  "province": "Western",
  "district": "Colombo",
  "ds_division": "Dehiwala DS Division"
}
```

---

### **Step 4: Login as DS**
```http
POST /api/auth/login

{
  "nic": "777777777V",
  "password": "ds"
}
```

---

### **Step 5: DS Adds GS Officer**
```http
POST /api/ds/add-gs
Authorization: Bearer <ds_token>

{
  "fullname": "Officer Wijesinghe",
  "nic": "876543210V",
  "phone": "0779876543",
  "email": "wijesinghe@gov.lk",
  "password": "gs123",
  "gs_section": "Ratmalana GS Section",
  "address": "Ratmalana GS Office"
}
```

---

### **Step 6: Login as GS**
```http
POST /api/auth/login

{
  "nic": "888888888V",
  "password": "gs"
}
```

---

### **Step 7: GS Adds Citizen**
```http
POST /api/gs/add-citizen
Authorization: Bearer <gs_token>

{
  "fullname": "Nimal Fernando",
  "nic": "200012345678",
  "phone": "0771234567",
  "email": "nimal@example.com",
  "password": "nimal123",
  "address": "456, Duplication Road, Wellawatta"
}
```

---

### **Step 8: Citizen Applies for Service**
```http
POST /api/auth/login

{
  "nic": "200012345678",
  "password": "nimal123"
}

POST /api/applications
Authorization: Bearer <citizen_token>

{
  "service_type": "Character Certificate",
  "details": {
    "name": "Nimal Fernando",
    "reason": "Job application"
  },
  "approval_level": "gs_only"
}
```

---

### **Step 9: GS Approves Application**
```http
PUT /api/applications/{app_id}/status
Authorization: Bearer <gs_token>

{
  "status": "Approved",
  "comments": "Resident verified. Good character."
}
```

**Result:** Status becomes "Completed" (since it's `gs_only` level)

---

## 🎯 Key Features Implemented

✅ **Geographic Hierarchy:** Province → District → DS Division → GS Section  
✅ **Role-Based User Creation:** President assigns DS, DS adds GS, GS adds Citizens  
✅ **Multi-Level Approval Workflows:** 5 approval levels (gs_only to presidential)  
✅ **Automatic Assignment:** Applications auto-assigned to correct GS/DS based on citizen's section  
✅ **Approval Chain Tracking:** Full audit trail of who approved at each level  
✅ **Supervisor Tracking:** `reports_to` field tracks organizational hierarchy  
✅ **Service Configuration:** Services configured with required approval levels  

---

## 📝 Next Steps (Optional Enhancements)

1. **Frontend Updates:**
   - Admin UI to assign DS to divisions
   - DS dashboard to add GS officers
   - GS dashboard to add citizens
   - Application approval interface with approval chain display

2. **Filtering by Geography:**
   - GS sees only citizens from their section
   - DS sees all GS sections in their division
   - Admin sees entire hierarchy

3. **Notifications:**
   - Email/SMS when application moves to next approval stage
   - Alerts when pending too long at a stage

4. **Analytics:**
   - Average approval time per stage
   - Bottleneck identification
   - Geographic service demand heatmaps

---

## 🔐 Security Notes

- ✅ Role-based access control enforced on all endpoints
- ✅ Hierarchy validation (GS can only add citizens, not other officers)
- ✅ Geographic constraints (DS can only add GS to their division)
- ✅ Approval stage validation (only authorized role can approve at each stage)
- ✅ Audit trail preserved in approval_chain

---

**Implementation Date:** December 14, 2025  
**Status:** ✅ Complete and Ready for Testing
