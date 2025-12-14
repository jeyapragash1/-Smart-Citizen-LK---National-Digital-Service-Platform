# Smart Citizen Frontend UI Implementation Guide

## Overview

This document describes the new frontend UI components created for the Smart Citizen LK administrative system. These components implement the hierarchical approval workflow and user management for the 4-level administrative structure (President/Admin → DS → GS → Citizen).

## New Hierarchy Management Pages

### 1. Admin Super User - Manage DS Divisions
**Location**: `app/admin/super/divisions/page.tsx`

**Purpose**: Allow super admin to assign Divisional Secretaries (DS) to geographic divisions.

**Features**:
- Form to assign DS officers by:
  - DS NIC (National Identity Card)
  - Province selection (dropdown)
  - District (text input)
  - DS Division name
- Table displaying all assigned divisions with:
  - DS Name
  - DS NIC
  - Province
  - District
  - Division Name
  - Email

**State Management**:
```typescript
- divisions: Division[] - List of all DS divisions
- loading: boolean - Loading state
- error: string - Error messages
- success: boolean - Success feedback
- showForm: boolean - Toggle form visibility
- formData: { ds_nic, province, district, ds_division }
```

**API Integration**:
- `getAllDivisions()` - Fetch all divisions
- `assignDSToDiv(data)` - POST new DS assignment

**UI Theme**: Blue gradient background with blue-themed cards

---

### 2. Divisional Secretary - Manage GS Officers
**Location**: `app/admin/ds/gs/page.tsx`

**Purpose**: Allow DS to create and manage Grama Niladhari (GS) officers under their division.

**Features**:
- Form to add GS officers with:
  - Full Name
  - NIC
  - Phone
  - Email
  - Password
  - GS Section (text input)
  - Address
- Table showing all GS officers under this DS:
  - Full Name
  - NIC
  - Phone
  - Email
  - GS Section
  - Division

**State Management**:
```typescript
- officers: GSOffice[] - List of GS officers
- loading: boolean - Loading state
- error: string - Error messages
- success: boolean - Success feedback
- showForm: boolean - Toggle form visibility
- formData: { fullname, nic, phone, email, password, gs_section, address }
```

**API Integration**:
- `getGSOfficers()` - Fetch all GS officers under this DS
- `addGSOfficer(data)` - POST new GS officer

**UI Theme**: Blue theme consistent with divisions page

---

### 3. Grama Niladhari - Register Citizens
**Location**: `app/admin/gs/citizens/page.tsx`

**Purpose**: Allow GS officers to register citizens in their geographic section.

**Features**:
- Form to register citizens with:
  - Full Name
  - NIC
  - Phone
  - Email
  - Password
  - Address
- Instruction card explaining 5-step process:
  1. Fill in citizen details
  2. Validate information
  3. Create login account
  4. Send welcome email
  5. Citizen ready to apply for services
- Info message: "Note: Citizen automatically registered in your section"

**State Management**:
```typescript
- loading: boolean - Loading state
- error: string - Error messages
- success: boolean - Success feedback
- showForm: boolean - Toggle form visibility
- formData: { fullname, nic, phone, email, password, address }
```

**API Integration**:
- `addCitizen(data)` - POST new citizen registration

**UI Theme**: Green accent color (different from admin pages)

---

## Approval Workflow Components

### 4. ApprovalInterface Component
**Location**: `components/ApprovalInterface.tsx`

**Purpose**: Reusable component to display and manage application approval workflows across all pages.

**Features**:
- **Approval Timeline**: Visual timeline showing all approval chain items
  - Each item shows: level, officer NIC, action (Approved/Rejected), timestamp, comments
  - Color-coded: Green for Approved, Red for Rejected
- **Current Stage Display**: Shows current approval stage with human-readable name
  - Stages: 'gs' → Grama Niladhari, 'ds' → Divisional Secretary, etc.
  - Color-coded backgrounds based on stage
- **Approval Actions**:
  - Approve button - Opens comment form
  - Reject button - Opens reason form
  - Both validate that comment/reason exists before submission
- **Status Display**: Shows completed status with green success message

**Props Interface**:
```typescript
interface ApprovalInterfaceProps {
  applicationId: string;              // Application being reviewed
  currentStage: string;               // Current approval stage ('gs', 'ds', etc)
  approvalChain: ApprovalChainItem[]; // History of approvals
  onApprove: (comments: string) => Promise<void>;
  onReject: (comments: string) => Promise<void>;
}

interface ApprovalChainItem {
  level: string;      // 'gs', 'ds', 'district', 'ministry', 'presidential'
  nic: string;        // Officer's NIC
  action: string;     // 'Approved' or 'Rejected'
  timestamp: string;  // ISO date string
  comments: string;   // Officer's comments
}
```

**State Management**:
```typescript
- approveMode: boolean - Show approve comment form
- rejectMode: boolean - Show reject comment form
- comments: string - Comment/reason text
- loading: boolean - API call in progress
- error: string - Error messages
- success: boolean - Success feedback
```

**Functions**:
- `handleApprove()` - Validate comments, call onApprove callback
- `handleReject()` - Validate reason, call onReject callback
- `getStageColor(stage)` - Return Tailwind color classes for stage
- `getStageName(stage)` - Return human-readable stage name

**UI Theme**: Color-coded by approval stage with timeline visualization

---

## Updated Pages with Approval Integration

### 5. Dashboard Applications Page (Enhanced)
**Location**: `app/dashboard/applications/page.tsx`

**Updates**:
- Enhanced Application interface to include approval workflow fields:
  ```typescript
  interface Application {
    _id: string;
    service_type: string;
    status: string;
    created_at: string;
    approval_level?: string;
    current_approval_stage?: string;
    approval_chain?: ApprovalChainItem[];
    details: { ... }
  }
  ```
- Updated modal to include ApprovalInterface component when approval_chain exists
- Scrollable modal content to accommodate approval timeline
- Conditional rendering: Only shows ApprovalInterface if approval_chain has items

**Integration**:
```tsx
{selectedApp.approval_chain && selectedApp.approval_chain.length > 0 && (
  <div className="border-t border-gray-200 pt-6">
    <h4 className="font-semibold text-gray-900 mb-4">Approval Workflow</h4>
    <ApprovalInterface 
      applicationId={selectedApp._id}
      currentStage={selectedApp.current_approval_stage || 'pending'}
      approvalChain={selectedApp.approval_chain}
      onApprove={() => { /* citizen can't approve */ }}
      onReject={() => { /* citizen can't reject */ }}
    />
  </div>
)}
```

---

### 6. GS Approvals Page
**Location**: `app/admin/gs/approvals/page.tsx`

**Purpose**: Allow GS officers to view and approve applications at their level.

**Features**:
- Table of pending applications with:
  - Applicant name
  - Service type
  - Submission date
  - Current approval stage (highlighted if 'gs')
  - View button
- Detail modal with:
  - Application details (applicant, contact, dates, reason)
  - ApprovalInterface component with approve/reject callbacks
  - Auto-refresh after approval/rejection

**API Integration**:
- `GET /api/gs/applications/pending` - Fetch pending applications
- `PUT /api/applications/{id}/approve` - Approve application
- `PUT /api/applications/{id}/reject` - Reject application

**Approval Workflow**:
- Officer clicks "Approve" or "Reject" in ApprovalInterface
- Modal captures comments/reason
- API call updates approval_chain with officer info
- Application moves to next stage (ds) or marked rejected
- Certificate generated if final approval

---

### 7. DS Approvals Page (Updated)
**Location**: `app/admin/ds/approvals/page.tsx`

**Purpose**: Allow DS officers to review and approve applications at their level.

**Features**:
- Same structure as GS approvals page
- Filters by current_approval_stage === 'ds'
- ApprovalInterface shows progression from GS → DS approval
- Shows pending approvals count in header

**API Integration**:
- `GET /api/ds/applications/pending` - Fetch pending applications
- `PUT /api/applications/{id}/approve` - Approve application
- `PUT /api/applications/{id}/reject` - Reject application

---

## Navigation Updates

**Admin Layout Menu** (`app/admin/layout.tsx`):

**GS Menu**:
- GS Overview
- Application Approvals ← NEW
- Manage Citizens ← NEW
- Villager Database
- Land Disputes

**DS Menu**:
- DS Overview
- Application Approvals ← UPDATED
- Manage GS Officers ← NEW
- Signed Certificates
- Regional Reports

**Super Admin Menu**:
- System Monitor
- Manage DS Divisions ← NEW
- Officer Management
- Marketplace Manager
- Service Configuration
- Revenue Analytics
- Security & Logs
- Database Config

---

## API Methods (lib/api.ts)

All new hierarchy-related API methods:

```typescript
// Admin Division Management
assignDSToDiv(data: {
  ds_nic: string;
  province: string;
  district: string;
  ds_division: string;
}): Promise<void>

getAllDivisions(): Promise<Array<{
  _id: string;
  ds_name: string;
  ds_nic: string;
  province: string;
  district: string;
  division: string;
  email: string;
}>>

// DS GS Management
addGSOfficer(data: {
  fullname: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  gs_section: string;
  address: string;
}): Promise<void>

getGSOfficers(): Promise<Array<{
  _id: string;
  fullname: string;
  nic: string;
  phone: string;
  email: string;
  gs_section: string;
}>>

// GS Citizen Management
addCitizen(data: {
  fullname: string;
  nic: string;
  phone: string;
  email: string;
  password: string;
  address: string;
}): Promise<void>
```

---

## Error Handling

All pages implement comprehensive error handling:

1. **API Errors**: Caught and displayed with user-friendly messages
2. **Loading States**: Spinner shown while fetching data
3. **Empty States**: Helpful messages when no data exists
4. **Form Validation**: All required fields validated before submission
5. **Token Expiration**: Auto-redirect to login on 401 errors

---

## Styling Patterns

### Color Schemes
- **Admin (Super)**: Slate/Black theme
- **DS**: Purple theme
- **GS**: Blue theme
- **Citizen**: Default blue

### Components
- Cards: `bg-white rounded-xl border border-gray-200 shadow-sm`
- Buttons: Blue primary `bg-blue-700 hover:bg-blue-800`
- Tables: Striped rows with hover effect
- Modals: Centered with backdrop blur

### Responsive
- Mobile-first approach
- Tables become scrollable on mobile
- Forms stack vertically
- Sidebar collapses on mobile

---

## Testing the Implementation

### 1. Test GS Approvals Flow
```bash
# Login as GS officer (888888888V)
# Navigate to Admin > Application Approvals
# View a pending application
# Click "Approve" in ApprovalInterface
# Enter comments and submit
# Application should move to DS stage
```

### 2. Test DS Approvals Flow
```bash
# Login as DS officer (777777777V)
# Navigate to Admin > Application Approvals
# View application at DS stage
# Click "Approve" or "Reject"
# Enter comments and submit
# Application should be completed or rejected
```

### 3. Test Citizen Application Viewing
```bash
# Login as citizen
# Go to Dashboard > Applications
# Click "View" on an application
# See ApprovalInterface in modal showing approval chain
# Watch as application progresses through stages
```

---

## Future Enhancements

1. **Email Notifications**: Send email when application moves to new stage
2. **Filtering**: Filter applications by status, date range, geography
3. **Search**: Search by applicant name or NIC
4. **Export**: Export approval history as PDF or CSV
5. **Analytics**: Dashboard showing approval metrics and bottlenecks
6. **Bulk Actions**: Approve/reject multiple applications at once
7. **Assignment**: Distribute applications among multiple GS officers
8. **Escalation**: Auto-escalate if approval delayed beyond timeframe

---

## File Structure Summary

```
smart-citizen-frontend/
├── app/
│   ├── admin/
│   │   ├── layout.tsx (UPDATED - menu items)
│   │   ├── super/
│   │   │   └── divisions/
│   │   │       └── page.tsx (NEW)
│   │   ├── ds/
│   │   │   ├── approvals/
│   │   │   │   └── page.tsx (UPDATED)
│   │   │   └── gs/
│   │   │       └── page.tsx (NEW)
│   │   └── gs/
│   │       ├── approvals/
│   │       │   └── page.tsx (NEW)
│   │       └── citizens/
│   │           └── page.tsx (NEW)
│   └── dashboard/
│       └── applications/
│           └── page.tsx (UPDATED)
├── components/
│   └── ApprovalInterface.tsx (NEW)
└── lib/
    └── api.ts (UPDATED - 6 new methods)
```

---

## Dependencies

All components use standard Next.js/React imports:
- `next/navigation` - useRouter for navigation
- `next/link` - Link for routing
- `react` - React hooks
- `lucide-react` - Icons
- No external UI library beyond Tailwind CSS

---

## Backend API Endpoints Required

The frontend expects these backend endpoints to be implemented:

```
GET    /api/admin/divisions                    - List all DS divisions
POST   /api/admin/assign-ds                    - Assign DS to division

GET    /api/ds/gs-officers                     - List GS officers under DS
POST   /api/ds/add-gs                          - Create new GS officer
GET    /api/ds/applications/pending            - List pending apps for DS

GET    /api/gs/applications/pending            - List pending apps for GS
POST   /api/gs/add-citizen                     - Register citizen

PUT    /api/applications/{id}/approve          - Approve application
PUT    /api/applications/{id}/reject           - Reject application
```

All endpoints require Bearer token authentication in headers.

---

## Conclusion

This frontend implementation provides a complete user interface for:
- ✅ Hierarchical user management (Admin → DS → GS → Citizen)
- ✅ Geographic organization and reporting structure
- ✅ Multi-level application approval workflows
- ✅ Real-time approval chain tracking
- ✅ Role-based access and navigation

The system is now ready for comprehensive testing and deployment.
