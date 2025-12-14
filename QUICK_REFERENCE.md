# 🚀 Quick Reference: Who Can Do What

## 👑 PRESIDENT / SUPER ADMIN (Role: `admin`)

### Can:
- ✅ Assign DS officers to specific divisions
- ✅ View all DS divisions and officers
- ✅ Delete officers
- ✅ Manage system services (CRUD)
- ✅ View revenue and system statistics
- ✅ Approve applications at any level
- ✅ View all applications system-wide

### New Endpoints:
```
POST   /api/admin/assign-ds        → Assign DS to division
GET    /api/admin/divisions        → View all DS divisions
GET    /api/admin/users            → List all officers
DELETE /api/admin/users/{id}       → Delete officer
GET    /api/admin/services         → List services
PUT    /api/admin/services/{id}    → Update service
GET    /api/admin/revenue          → View revenue stats
GET    /api/admin/stats            → View system stats
```

---

## 📍 DS OFFICER (Role: `ds`)

### Can:
- ✅ Add new GS officers to their division
- ✅ View all GS officers under them
- ✅ Approve applications at DS level
- ✅ View DS dashboard statistics
- ✅ Access approval queue
- ✅ View issued certificates

### New Endpoints:
```
POST   /api/ds/add-gs              → Add new GS officer to division
GET    /api/ds/gs-officers         → View GS officers under this DS
GET    /api/ds/stats               → Dashboard statistics
GET    /api/ds/queue               → Applications pending at DS level
GET    /api/ds/certificates        → Issued certificates
```

### Cannot:
- ❌ Add citizens (only GS can)
- ❌ Assign divisions (only Admin can)
- ❌ Delete applications (only owner can)

---

## 🏘️ GS OFFICER (Role: `gs`)

### Can:
- ✅ Add new citizens to their section
- ✅ Approve applications at GS level
- ✅ View all citizens in their section
- ✅ Manage land disputes
- ✅ Access GS dashboard

### New Endpoints:
```
POST   /api/gs/add-citizen         → Add new citizen to section
GET    /api/gs/villagers           → View citizens in section
GET    /api/gs/stats               → Dashboard statistics
POST   /api/gs/land                → Register land dispute
GET    /api/gs/land                → View land disputes
```

### Cannot:
- ❌ Add other GS officers (only DS can)
- ❌ Assign DS divisions (only Admin can)
- ❌ Manage services
- ❌ View system revenue

---

## 👤 CITIZEN (Role: `citizen`)

### Can:
- ✅ Apply for government services
- ✅ View their own applications
- ✅ Download certificates
- ✅ Withdraw pending applications
- ✅ Update profile

### New Endpoints:
```
POST   /api/applications           → Submit application
GET    /api/applications/my-apps   → View own applications
GET    /api/applications/{id}/download → Download certificate
DELETE /api/applications/{id}      → Withdraw application
```

### Cannot:
- ❌ Add other citizens
- ❌ Approve applications
- ❌ View other citizens' applications
- ❌ Access officer dashboards

---

## 🔐 Role Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│                      PRESIDENT (Admin)                    │
│                    • Oversees entire system               │
│                    • Assigns DS to divisions              │
└──────────────┬───────────────────────────────────────────┘
               │
               │ (President assigns)
               ↓
┌──────────────────────────────────────────────────────────┐
│        DIVISIONAL SECRETARY (DS Officer)                 │
│        • Manages DS Division                              │
│        • Adds GS officers                                │
│        • Approves applications at DS level               │
└──────────────┬───────────────────────────────────────────┘
               │
               │ (DS adds)
               ↓
┌──────────────────────────────────────────────────────────┐
│         GRAMA NILADHARI (GS Officer)                      │
│         • Manages GS Section                              │
│         • Adds citizens                                   │
│         • Approves applications at GS level              │
└──────────────┬───────────────────────────────────────────┘
               │
               │ (GS adds)
               ↓
┌──────────────────────────────────────────────────────────┐
│               CITIZEN                                     │
│         • Applies for services                            │
│         • Views own applications                          │
│         • Downloads certificates                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Approval Workflows

### For `gs_only` Services (Character, Residence, Income Certificate)
```
Citizen → GS (Approve) → ✅ Certificate Issued
```
**Time:** Typically 1 day

---

### For `gs_ds` Services (Birth, Death, Business, Land)
```
Citizen → GS (Approve) → DS (Approve) → ✅ Certificate Issued
```
**Time:** Typically 2-3 days

---

### For `gs_ds_district` Services (Marriage, Police, Construction)
```
Citizen → GS → DS → District (Approve) → ✅ Certificate Issued
```
**Time:** Typically 3-7 days

---

### For `gs_ds_district_ministry` Services (Passport, National ID, Visa, License)
```
Citizen → GS → DS → District → Ministry (Approve) → ✅ Certificate Issued
```
**Time:** Typically 7-30 days

---

## 🎯 Common Tasks

### Task 1: President Assigns DS Officer
```bash
1. Login as Admin (999999999V / admin)
2. POST /api/admin/assign-ds
   - ds_nic: "777777777V"
   - province: "Western"
   - district: "Colombo"
   - ds_division: "Colombo DS Division"
```

### Task 2: DS Adds GS Officer
```bash
1. Login as DS (777777777V / ds)
2. POST /api/ds/add-gs
   - fullname: "Officer Jayasinghe"
   - nic: "987654321V"
   - gs_section: "Bambalapitiya GS Section"
```

### Task 3: GS Adds Citizen
```bash
1. Login as GS (888888888V / gs)
2. POST /api/gs/add-citizen
   - fullname: "Nimal Fernando"
   - nic: "200012345678"
   - address: "123, Galle Road, Wellawatta"
```

### Task 4: Citizen Applies for Service
```bash
1. Login as Citizen (200012345678 / password)
2. POST /api/applications
   - service_type: "Birth Certificate"
   - approval_level: "gs_ds"
   - details: {...}
```

### Task 5: GS Approves Application
```bash
1. Login as GS
2. GET /api/applications/pending (see pending apps)
3. PUT /api/applications/{app_id}/status
   - status: "Approved"
   - comments: "Documents verified"
```

### Task 6: DS Approves Application
```bash
1. Login as DS
2. GET /api/ds/queue (see pending DS approvals)
3. PUT /api/applications/{app_id}/status
   - status: "Approved"
   - comments: "Final authorization granted"
```

---

## 📈 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  User Registration (Hierarchical)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Admin creates DS (assigns to division)              │
│     → DS.reports_to = Admin NIC                        │
│     → DS.ds_division = "Colombo DS"                    │
│                                                          │
│  2. DS creates GS (adds to their division)             │
│     → GS.reports_to = DS NIC                           │
│     → GS.ds_division = DS's division                   │
│     → GS.gs_section = "Wellawatta GS"                  │
│                                                          │
│  3. GS creates Citizen (registers in section)          │
│     → Citizen.reports_to = NULL                        │
│     → Citizen.gs_section = GS's section               │
│     → Citizen.ds_division = GS's DS division          │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Application Submission & Approval                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Citizen applies for service                         │
│     → Application.applicant_nic = Citizen NIC          │
│     → Application.assigned_gs = Citizen's GS NIC       │
│     → Application.assigned_ds = Citizen's DS NIC       │
│     → Application.current_approval_stage = "gs"        │
│                                                          │
│  2. GS approves → Application moves to DS              │
│     → current_approval_stage = "ds"                     │
│     → approval_chain += {level: "gs", action: "Appr"}  │
│                                                          │
│  3. DS approves → Application completed                │
│     → current_approval_stage = "completed"             │
│     → status = "Completed"                              │
│     → certificate_path generated                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Important Field References

### User Fields (New)
```javascript
{
  "nic": "199812345678",
  "role": "gs",                           // citizen, gs, ds, admin
  "province": "Western",                  // Geographic hierarchy
  "district": "Colombo",
  "ds_division": "Colombo DS Division",
  "gs_section": "Wellawatta GS Section",
  "reports_to": "777777777V"              // Supervisor NIC
}
```

### Application Fields (New)
```javascript
{
  "applicant_nic": "200012345678",
  "service_type": "Birth Certificate",
  "approval_level": "gs_ds",              // Approval requirement
  "current_approval_stage": "ds",         // gs, ds, district, ministry, completed
  "approval_chain": [
    {
      "level": "gs",
      "nic": "888888888V",
      "action": "Approved",
      "timestamp": "2025-12-14T10:00:00Z",
      "comments": "Verified"
    }
  ],
  "assigned_gs": "888888888V",
  "assigned_ds": "777777777V",
  "certificate_path": "generated_certs/...pdf"
}
```

---

## ✅ Testing Checklist

- [ ] Run `python seed.py` to create default users
- [ ] Login as Admin (999999999V/admin)
- [ ] Assign DS to division via `/api/admin/assign-ds`
- [ ] Login as DS (777777777V/ds)
- [ ] Add GS officer via `/api/ds/add-gs`
- [ ] Login as GS (888888888V/gs)
- [ ] Add citizen via `/api/gs/add-citizen`
- [ ] Login as new citizen
- [ ] Submit application via `/api/applications`
- [ ] Login as GS, approve via `/api/applications/{id}/status`
- [ ] Login as DS, approve via `/api/applications/{id}/status`
- [ ] Verify certificate generated and downloadable
- [ ] Check approval_chain contains full audit trail

---

**Implementation Date:** December 14, 2025  
**Status:** ✅ Complete
