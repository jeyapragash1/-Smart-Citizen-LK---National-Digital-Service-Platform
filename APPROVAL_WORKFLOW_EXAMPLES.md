# 🔄 Complete Application Approval Workflow Examples

## Scenario 1: GS-Only Service (Character Certificate)

### **Approval Level:** `gs_only`
### **Required Approvers:** GS only
### **Example:** Character Certificate, Residence Certificate, Income Certificate

---

### **Step 1: Citizen Submits Application**
```http
POST /api/applications
Authorization: Bearer <citizen_token>

{
  "service_type": "Character Certificate",
  "applicant_nic": "200012345678",
  "details": {
    "name": "Nimal Fernando",
    "reason": "Job application at Bank"
  },
  "approval_level": "gs_only"
}
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "id": "674ab123abc...",
  "approval_level": "gs_only",
  "current_stage": "gs",
  "assigned_to": "888888888V"
}
```

---

### **Step 2: GS Officer Approves**
```http
PUT /api/applications/674ab123abc.../status
Authorization: Bearer <gs_token>

{
  "status": "Approved",
  "comments": "Resident verified. Good character confirmed."
}
```

**Response:**
```json
{
  "message": "Application approved at gs level",
  "next_stage": "completed",
  "final_status": "Completed",
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T14:30:00.000Z",
      "comments": "Resident verified. Good character confirmed."
    }
  ]
}
```

**Result:** ✅ Certificate Generated Immediately!

---

## Scenario 2: GS → DS Service (Birth Certificate)

### **Approval Level:** `gs_ds`
### **Required Approvers:** GS → DS
### **Example:** Birth Certificate, Business Registration, Land Ownership

---

### **Step 1: Citizen Submits Application**
```http
POST /api/applications
Authorization: Bearer <citizen_token>

{
  "service_type": "Birth Certificate",
  "applicant_nic": "200012345678",
  "details": {
    "child_name": "Baby Fernando",
    "mother_name": "Kumari Fernando",
    "father_name": "Nimal Fernando",
    "date_of_birth": "2025-12-01",
    "place_of_birth": "Colombo General Hospital"
  },
  "approval_level": "gs_ds"
}
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "id": "674ab456def...",
  "approval_level": "gs_ds",
  "current_stage": "gs",
  "assigned_to": "888888888V"
}
```

---

### **Step 2: GS Officer Approves (First Level)**
```http
PUT /api/applications/674ab456def.../status
Authorization: Bearer <gs_token>

{
  "status": "Approved",
  "comments": "Birth notification verified. Hospital records match. Parents are residents of Wellawatta."
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
      "timestamp": "2025-12-14T10:00:00.000Z",
      "comments": "Birth notification verified. Hospital records match."
    }
  ]
}
```

**Result:** ⏳ Application moves to DS queue

---

### **Step 3: DS Officer Approves (Final Level)**
```http
PUT /api/applications/674ab456def.../status
Authorization: Bearer <ds_token>

{
  "status": "Approved",
  "comments": "Final approval granted. Birth certificate authorized for issue."
}
```

**Response:**
```json
{
  "message": "Application approved at ds level",
  "next_stage": "completed",
  "final_status": "Completed",
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T10:00:00.000Z",
      "comments": "Birth notification verified. Hospital records match."
    },
    {
      "level": "ds",
      "nic": "777777777V",
      "action": "Approved",
      "timestamp": "2025-12-14T14:30:00.000Z",
      "comments": "Final approval granted. Birth certificate authorized for issue."
    }
  ]
}
```

**Result:** ✅ Birth Certificate Generated!

---

## Scenario 3: GS → DS → District Service (Police Report)

### **Approval Level:** `gs_ds_district`
### **Required Approvers:** GS → DS → District Secretary
### **Example:** Police Reports, Marriage Certificates, Construction Permits

---

### **Step 1: Citizen Submits Application**
```http
POST /api/applications
Authorization: Bearer <citizen_token>

{
  "service_type": "Police Report",
  "applicant_nic": "200012345678",
  "details": {
    "name": "Nimal Fernando",
    "reason": "Visa application to Australia",
    "required_period": "Last 5 years"
  },
  "approval_level": "gs_ds_district"
}
```

---

### **Step 2: GS Approves**
```http
PUT /api/applications/{app_id}/status
Authorization: Bearer <gs_token>

{
  "status": "Approved",
  "comments": "Resident confirmed. No local police complaints."
}
```

**Result:** ⏳ Moves to DS

---

### **Step 3: DS Approves**
```http
PUT /api/applications/{app_id}/status
Authorization: Bearer <ds_token>

{
  "status": "Approved",
  "comments": "Division-level verification complete. No records found."
}
```

**Result:** ⏳ Moves to District

---

### **Step 4: District Officer Approves (Final)**
```http
PUT /api/applications/{app_id}/status
Authorization: Bearer <district_token>

{
  "status": "Approved",
  "comments": "District police records checked. Clean record confirmed."
}
```

**Result:** ✅ Police Report Certificate Generated!

---

## Scenario 4: Rejection at Any Stage

### **Example: DS Rejects Birth Certificate**

```http
PUT /api/applications/674ab456def.../status
Authorization: Bearer <ds_token>

{
  "status": "Rejected",
  "comments": "Hospital records do not match. Birth date discrepancy found. Please resubmit with correct documents."
}
```

**Response:**
```json
{
  "message": "Application rejected",
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T10:00:00.000Z",
      "comments": "Birth notification verified."
    },
    {
      "level": "ds",
      "nic": "777777777V",
      "action": "Rejected",
      "timestamp": "2025-12-14T14:45:00.000Z",
      "comments": "Hospital records do not match. Birth date discrepancy found."
    }
  ]
}
```

**Result:** ❌ Application status = "Rejected"

---

## Filtering Applications by Stage

### **GS Dashboard: Get Applications Pending at GS Level**
```http
GET /api/applications/pending
Authorization: Bearer <gs_token>
```

**Returns:** All applications where `current_approval_stage === "gs"`

---

### **DS Dashboard: Get Applications Pending at DS Level**
```http
GET /api/applications/pending
Authorization: Bearer <ds_token>
```

**Returns:** All applications where `current_approval_stage === "ds"`

---

## Application States

| Status | current_approval_stage | Description |
|--------|------------------------|-------------|
| `Pending` | `gs` | Waiting for GS approval |
| `Pending` | `ds` | GS approved, waiting for DS |
| `Pending` | `district` | GS+DS approved, waiting for District |
| `Pending` | `ministry` | GS+DS+District approved, waiting for Ministry |
| `Completed` | `completed` | All approvals done, certificate issued |
| `Rejected` | (any stage) | Rejected at current stage |

---

## Benefits of This System

✅ **Full Audit Trail:** Every approval tracked with officer NIC, timestamp, and comments  
✅ **Geographic Assignment:** Applications auto-routed to correct GS/DS based on citizen's section  
✅ **Flexible Workflows:** Different services have different approval levels  
✅ **Clear Responsibility:** Each officer sees only applications pending at their level  
✅ **Rejection Handling:** Can reject at any stage with reason  
✅ **Performance Metrics:** Track average approval time per stage, bottlenecks  

---

## Real-World Sri Lankan Services Mapping

| Service | Approval Level | Workflow |
|---------|---------------|----------|
| Residence Certificate | `gs_only` | GS → ✅ |
| Character Certificate | `gs_only` | GS → ✅ |
| Income Certificate | `gs_only` | GS → ✅ |
| Birth Certificate | `gs_ds` | GS → DS → ✅ |
| Death Certificate | `gs_ds` | GS → DS → ✅ |
| Business Registration | `gs_ds` | GS → DS → ✅ |
| Land Ownership | `gs_ds` | GS → DS → ✅ |
| Marriage Certificate | `gs_ds_district` | GS → DS → District → ✅ |
| Police Report | `gs_ds_district` | GS → DS → District → ✅ |
| Construction Permit | `gs_ds_district` | GS → DS → District → ✅ |
| Passport | `gs_ds_district_ministry` | GS → DS → District → Immigration → ✅ |
| National ID | `gs_ds_district_ministry` | GS → DS → District → Registrar → ✅ |
| Visa | `gs_ds_district_ministry` | GS → DS → District → Immigration → ✅ |
| Driving License | `gs_ds_district_ministry` | GS → DS → District → DMT → ✅ |
| Presidential Pardon | `presidential` | GS → DS → District → Ministry → President → ✅ |

---

**Last Updated:** December 14, 2025
