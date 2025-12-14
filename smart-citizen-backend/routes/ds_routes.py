from fastapi import APIRouter, Depends, HTTPException
from database import application_collection, user_collection, complaints_collection, audit_log_collection, notifications_collection
from auth import get_current_user_with_role, get_password_hash
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

router = APIRouter()

# --- NEW: DS CAN ADD GS OFFICERS ---
class AddGSOfficerRequest(BaseModel):
    fullname: str
    nic: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    gs_section: str  # e.g., "Wellawatta GS Section"
    address: str

@router.post("/add-gs")
async def add_gs_officer(data: AddGSOfficerRequest, current_user: dict = Depends(get_current_user_with_role)):
    """DS officer adds new GS officer to their division"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Only DS officers can add GS officers")
    
    # Get DS user info
    ds_user = await user_collection.find_one({"nic": current_user["nic"]})
    if not ds_user:
        raise HTTPException(status_code=404, detail="DS user not found")
    
    # Check if NIC already exists
    existing = await user_collection.find_one({"nic": data.nic})
    if existing:
        raise HTTPException(status_code=400, detail="NIC already registered")
    
    # Create GS officer with hierarchy
    new_gs = {
        "fullname": data.fullname,
        "nic": data.nic,
        "phone": data.phone,
        "email": data.email,
        "password": get_password_hash(data.password),
        "role": "gs",
        "address": data.address,
        "province": ds_user.get("province"),  # Inherit from DS
        "district": ds_user.get("district"),  # Inherit from DS
        "ds_division": ds_user.get("ds_division"),  # Under DS's division
        "gs_section": data.gs_section,  # GS specific section
        "reports_to": current_user["nic"]  # GS reports to this DS
    }
    
    result = await user_collection.insert_one(new_gs)
    
    return {
        "message": f"GS officer {data.fullname} added successfully",
        "details": {
            "gs_id": str(result.inserted_id),
            "gs_name": data.fullname,
            "gs_nic": data.nic,
            "gs_section": data.gs_section,
            "division": ds_user.get("ds_division"),
            "reports_to": ds_user.get("fullname")
        }
    }

# --- GET ALL GS OFFICERS UNDER THIS DS ---
@router.get("/gs-officers")
async def get_gs_officers(current_user: dict = Depends(get_current_user_with_role)):
    """Get all GS officers under this DS's division"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find all GS officers who report to this DS
    gs_officers = []
    query = {"role": "gs", "reports_to": current_user["nic"]} if current_user["role"] == "ds" else {"role": "gs"}
    
    cursor = user_collection.find(query)
    async for gs in cursor:
        gs_officers.append({
            "id": str(gs["_id"]),
            "fullname": gs["fullname"],
            "nic": gs["nic"],
            "phone": gs.get("phone"),
            "email": gs.get("email"),
            "gs_section": gs.get("gs_section", "Unassigned"),
            "division": gs.get("ds_division", "Unassigned")
        })
    
    return gs_officers

# 1. DS Stats (Overview)
@router.get("/stats")
async def get_ds_stats(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Count applications by status
    pending = await application_collection.count_documents({"status": "Pending"})
    approved = await application_collection.count_documents({"status": "Completed"})
    rejected = await application_collection.count_documents({"status": "Rejected"})
    
    # Calculate fake revenue (e.g., 1500 LKR per approved app)
    revenue = approved * 1500 

    return {
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "revenue": revenue
    }

# 2. DS Approval Queue (Get all Pending apps)
# In a real system, this might filter only NICs or Passports
@router.get("/queue")
async def get_approval_queue(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = []
    cursor = application_collection.find({"status": "Pending"})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        apps.append(doc)
    return apps

# 3. Issued Certificates (Get all Completed apps)
@router.get("/certificates")
async def get_issued_certificates(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = []
    cursor = application_collection.find({"status": "Completed"})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        apps.append(doc)
    return apps

# ==========================================
# BATCH APPROVALS
# ==========================================

class BatchApproveRequest(BaseModel):
    application_ids: list

@router.post("/batch-approve")
async def batch_approve_applications(data: BatchApproveRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Batch approve multiple applications"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from bson.objectid import ObjectId
    approved_count = 0
    
    for app_id in data.application_ids:
        try:
            result = await application_collection.update_one(
                {"_id": ObjectId(app_id)},
                {
                    "$set": {
                        "status": "Completed",
                        "approved_by": current_user["nic"],
                        "approved_date": datetime.now().isoformat()
                    }
                }
            )
            if result.modified_count > 0:
                approved_count += 1
                # Log action
                await audit_log_collection.insert_one({
                    "action": "Batch Approve",
                    "user_nic": current_user["nic"],
                    "user_name": current_user.get("fullname"),
                    "application_id": app_id,
                    "timestamp": datetime.now().isoformat(),
                    "details": f"Application {app_id} approved in batch"
                })
        except Exception as e:
            continue
    
    return {
        "message": f"Successfully approved {approved_count} applications",
        "approved_count": approved_count,
        "total_requested": len(data.application_ids)
    }

# ==========================================
# GS OFFICER PERFORMANCE METRICS
# ==========================================

@router.get("/performance-metrics")
async def get_performance_metrics(current_user: dict = Depends(get_current_user_with_role)):
    """Get performance metrics for all GS officers under this DS"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get GS officers
    query = {"role": "gs", "reports_to": current_user["nic"]} if current_user["role"] == "ds" else {"role": "gs"}
    
    metrics = []
    cursor = user_collection.find(query)
    async for gs in cursor:
        gs_nic = gs.get("nic")
        
        # Count applications processed by this GS
        total = await application_collection.count_documents({"gs_officer": gs_nic})
        approved = await application_collection.count_documents({"gs_officer": gs_nic, "status": "Completed"})
        rejected = await application_collection.count_documents({"gs_officer": gs_nic, "status": "Rejected"})
        
        metrics.append({
            "id": str(gs["_id"]),
            "name": gs.get("fullname"),
            "gs_section": gs.get("gs_section", "Unassigned"),
            "approved_count": approved,
            "rejected_count": rejected,
            "total_processed": total,
            "approval_rate": f"{(approved/total*100) if total > 0 else 0:.1f}%",
            "avg_processing_time": "2.5 days",
            "satisfaction_rate": f"{85 + (approved % 15)}%"
        })
    
    return metrics

# ==========================================
# COMPLAINTS MANAGEMENT
# ==========================================

class ComplaintRequest(BaseModel):
    citizen_id: str
    complaint_text: str
    service_type: str

@router.get("/complaints")
async def get_complaints(current_user: dict = Depends(get_current_user_with_role)):
    """Get all complaints in DS division"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    complaints = []
    cursor = complaints_collection.find({})
    async for complaint in cursor:
        complaints.append({
            "id": str(complaint["_id"]),
            "citizen_id": complaint.get("citizen_id"),
            "citizen_name": complaint.get("citizen_name"),
            "complaint_text": complaint.get("complaint_text"),
            "service_type": complaint.get("service_type"),
            "status": complaint.get("status", "Open"),
            "created_date": complaint.get("created_date"),
            "priority": complaint.get("priority", "Medium")
        })
    
    return complaints

@router.post("/complaints")
async def create_complaint(data: ComplaintRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Create new complaint"""
    if current_user["role"] not in {"citizen", "ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_complaint = {
        "citizen_id": data.citizen_id,
        "citizen_name": current_user.get("fullname"),
        "complaint_text": data.complaint_text,
        "service_type": data.service_type,
        "status": "Open",
        "priority": "Medium",
        "created_date": datetime.now().isoformat(),
        "resolution_notes": ""
    }
    
    result = await complaints_collection.insert_one(new_complaint)
    return {"message": "Complaint created", "complaint_id": str(result.inserted_id)}

@router.put("/complaints/{complaint_id}")
async def update_complaint_status(complaint_id: str, status: str, current_user: dict = Depends(get_current_user_with_role)):
    """Update complaint status"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from bson.objectid import ObjectId
    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "status": status,
                "resolved_date": datetime.now().isoformat() if status == "Resolved" else None
            }
        }
    )
    
    return {"message": f"Complaint status updated to {status}"}

# ==========================================
# AUDIT LOGS
# ==========================================

@router.get("/audit-logs")
async def get_audit_logs(current_user: dict = Depends(get_current_user_with_role)):
    """Get audit logs for all actions"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    logs = []
    cursor = audit_log_collection.find({}).sort("timestamp", -1).limit(100)
    async for log in cursor:
        logs.append({
            "id": str(log["_id"]),
            "action": log.get("action"),
            "user_name": log.get("user_name"),
            "user_nic": log.get("user_nic"),
            "timestamp": log.get("timestamp"),
            "details": log.get("details")
        })
    
    return logs

# ==========================================
# DIGITAL SIGNATURES
# ==========================================

class SignatureTemplateRequest(BaseModel):
    template_name: str
    signature_type: str
    file_path: Optional[str] = None

@router.get("/signature-templates")
async def get_signature_templates(current_user: dict = Depends(get_current_user_with_role)):
    """Get all digital signature templates"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return [
        {
            "id": "1",
            "name": "DS Official Signature",
            "type": "Digital",
            "status": "Active",
            "created_date": "2025-11-15",
            "file_path": "/signatures/ds_official.pdf"
        },
        {
            "id": "2",
            "name": "Approval Certificate Stamp",
            "type": "Stamp",
            "status": "Active",
            "created_date": "2025-11-10",
            "file_path": "/signatures/approval_stamp.png"
        },
        {
            "id": "3",
            "name": "NIC Certificate Signature",
            "type": "Digital",
            "status": "Inactive",
            "created_date": "2025-10-20",
            "file_path": "/signatures/nic_sig.pdf"
        }
    ]

@router.post("/signature-templates")
async def create_signature_template(data: SignatureTemplateRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Create new signature template"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "message": "Signature template created",
        "template_id": "new_template_id",
        "name": data.template_name
    }

# ==========================================
# WORKFLOW ANALYTICS
# ==========================================

@router.get("/analytics")
async def get_workflow_analytics(current_user: dict = Depends(get_current_user_with_role)):
    """Get workflow analytics and KPIs"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_apps = await application_collection.count_documents({})
    completed_apps = await application_collection.count_documents({"status": "Completed"})
    pending_apps = await application_collection.count_documents({"status": "Pending"})
    
    return {
        "avg_processing_time": "2.8 days",
        "approval_rate": f"{(completed_apps/total_apps*100) if total_apps > 0 else 0:.1f}%",
        "pending_queue": pending_apps,
        "citizen_satisfaction": "92%",
        "monthly_processed": completed_apps,
        "sla_compliance": "96%",
        "trends": {
            "processing_time": "↓ 15% improvement",
            "approval_rate": "↑ 8% increase",
            "satisfaction": "↑ 5% increase"
        }
    }

# ==========================================
# NOTIFICATIONS
# ==========================================

class NotificationRequest(BaseModel):
    title: str
    notification_type: str
    message: str

@router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user_with_role)):
    """Get system notifications"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notifications = []
    cursor = notifications_collection.find({"user_nic": current_user["nic"]}).sort("created_date", -1).limit(20)
    async for notif in cursor:
        notifications.append({
            "id": str(notif["_id"]),
            "type": notif.get("notification_type"),
            "title": notif.get("title"),
            "message": notif.get("message"),
            "date": notif.get("created_date"),
            "read": notif.get("read", False)
        })
    
    return notifications

@router.post("/notifications")
async def create_notification(data: NotificationRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Create system notification"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_notif = {
        "user_nic": current_user["nic"],
        "title": data.title,
        "message": data.message,
        "notification_type": data.notification_type,
        "read": False,
        "created_date": datetime.now().isoformat()
    }
    
    result = await notifications_collection.insert_one(new_notif)
    return {"message": "Notification created", "notification_id": str(result.inserted_id)}

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user_with_role)):
    """Mark notification as read"""
    from bson.objectid import ObjectId
    
    await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    return {"message": "Notification marked as read"}

# ==========================================
# REPORT GENERATION
# ==========================================

class ReportRequest(BaseModel):
    report_type: str  # Monthly, Quarterly, Annual
    month: Optional[int] = None
    year: int
    include_metrics: bool = True

@router.post("/generate-report")
async def generate_report(data: ReportRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Generate administrative report"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get data for report
    total_apps = await application_collection.count_documents({})
    completed = await application_collection.count_documents({"status": "Completed"})
    pending = await application_collection.count_documents({"status": "Pending"})
    
    report_data = {
        "report_id": "RPT_" + str(int(datetime.now().timestamp())),
        "report_type": data.report_type,
        "period": f"{data.month or 'Full'}/{data.year}",
        "generated_by": current_user.get("fullname"),
        "generated_date": datetime.now().isoformat(),
        "statistics": {
            "total_applications": total_apps,
            "completed": completed,
            "pending": pending,
            "completion_rate": f"{(completed/total_apps*100) if total_apps > 0 else 0:.1f}%"
        }
    }
    
    return report_data

# ==========================================
# ESCALATIONS
# ==========================================

class EscalationRequest(BaseModel):
    application_id: str
    reason: str
    escalation_level: str  # Level 1, Level 2, Admin

@router.get("/escalations")
async def get_escalations(current_user: dict = Depends(get_current_user_with_role)):
    """Get escalated cases"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Mock escalations data
    return [
        {
            "id": "ESC001",
            "application_id": "APP123",
            "citizen": "Anura Perera",
            "reason": "Missing documents - awaiting citizen response",
            "escalation_level": "Level 1",
            "created_date": "2025-12-05",
            "status": "Pending"
        },
        {
            "id": "ESC002",
            "application_id": "APP124",
            "citizen": "Rohan Silva",
            "reason": "Duplicate application - conflict resolution needed",
            "escalation_level": "Level 2",
            "created_date": "2025-12-02",
            "status": "In Review"
        }
    ]

@router.post("/escalations")
async def create_escalation(data: EscalationRequest, current_user: dict = Depends(get_current_user_with_role)):
    """Escalate a case"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from bson.objectid import ObjectId
    
    escalation = {
        "application_id": data.application_id,
        "reason": data.reason,
        "escalation_level": data.escalation_level,
        "escalated_by": current_user["nic"],
        "escalated_by_name": current_user.get("fullname"),
        "created_date": datetime.now().isoformat(),
        "status": "Pending",
        "notes": ""
    }
    
    # Update application status
    await application_collection.update_one(
        {"_id": ObjectId(data.application_id)},
        {"$set": {"status": "Escalated", "escalation_level": data.escalation_level}}
    )
    
    return {"message": "Case escalated successfully", "escalation_id": "ESC_" + str(int(datetime.now().timestamp()))}

# ==========================================
# REGIONAL REPORTS
# ==========================================

@router.get("/regional-reports")
async def get_regional_reports(current_user: dict = Depends(get_current_user_with_role)):
    """Get regional statistics and reports"""
    if current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "division": current_user.get("ds_division", "Colombo"),
        "total_gs_sections": 12,
        "total_applications": 450,
        "completion_rate": "87%",
        "average_processing_time": "3.2 days",
        "sections": [
            {"name": "Wellawatta", "applications": 50, "completed": 44},
            {"name": "Dehiwala", "applications": 65, "completed": 58},
            {"name": "Mount Lavinia", "applications": 45, "completed": 42}
        ]
    }