from fastapi import APIRouter, Depends, HTTPException
from database import application_collection, user_collection, land_collection
from auth import get_current_user_with_role, get_password_hash
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime
from typing import Optional, List, Dict, Any

router = APIRouter()

# --- MODELS ---
class LandDisputeSchema(BaseModel):
    title: str
    description: str
    parties_involved: str
    status: str = "Active"
    date: datetime = datetime.now()

class AddCitizenRequest(BaseModel):
    fullname: str
    nic: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    address: str


class MessagePayload(BaseModel):
    sender: str
    recipient: str
    text: str


class SettingsPayload(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None
    dateFormat: Optional[str] = None
    timeFormat: Optional[str] = None
    theme: Optional[str] = None

# --- ROUTES ---

# --- NEW: GS CAN ADD CITIZENS ---
@router.post("/add-citizen")
async def add_citizen(data: AddCitizenRequest, current_user: dict = Depends(get_current_user_with_role)):
    """GS officer adds new citizen to the system"""
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Only GS officers can add citizens")
    
    # Get GS user info
    gs_user = await user_collection.find_one({"nic": current_user["nic"]})
    if not gs_user:
        raise HTTPException(status_code=404, detail="GS user not found")
    
    # Check if NIC already exists
    existing = await user_collection.find_one({"nic": data.nic})
    if existing:
        raise HTTPException(status_code=400, detail="NIC already registered")
    
    # Create citizen with hierarchy
    new_citizen = {
        "fullname": data.fullname,
        "nic": data.nic,
        "phone": data.phone,
        "email": data.email,
        "password": get_password_hash(data.password),
        "role": "citizen",
        "address": data.address,
        "province": gs_user.get("province"),  # Inherit from GS
        "district": gs_user.get("district"),  # Inherit from GS
        "ds_division": gs_user.get("ds_division"),  # Under GS's DS division
        "gs_section": gs_user.get("gs_section"),  # Citizen belongs to this GS section
        "reports_to": None  # Citizens don't report to anyone
    }
    
    result = await user_collection.insert_one(new_citizen)
    
    return {
        "message": f"Citizen {data.fullname} added successfully",
        "details": {
            "citizen_id": str(result.inserted_id),
            "citizen_name": data.fullname,
            "citizen_nic": data.nic,
            "gs_section": gs_user.get("gs_section"),
            "division": gs_user.get("ds_division"),
            "registered_by": gs_user.get("fullname")
        }
    }

# 1. Get GS Dashboard Stats
@router.get("/stats")
async def get_gs_stats(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    total_apps = await application_collection.count_documents({})
    pending_count = await application_collection.count_documents({"status": "Pending"})
    approved_count = await application_collection.count_documents({"status": "Completed"})
    rejected_count = await application_collection.count_documents({"status": "Rejected"})
    total_villagers = await user_collection.count_documents({"role": "citizen"})
    disputes_total = await land_collection.count_documents({})
    disputes_open = await land_collection.count_documents({"status": "Active"})
    disputes_resolved = await land_collection.count_documents({"status": "Resolved"})

    approval_rate = f"{(approved_count / total_apps * 100):.1f}%" if total_apps else "0%"

    return {
        "pending": pending_count,
        "villagers": total_villagers,
        "approved": approved_count,
        "disputes": disputes_open,
        "applications": {
            "total": total_apps,
            "approved": approved_count,
            "pending": pending_count,
            "rejected": rejected_count,
            "rate": approval_rate
        },
        "villagers_block": {
            "total": total_villagers,
            "active": total_villagers,
            "inactive": 0,
            "newThisMonth": 0
        },
        "disputes_block": {
            "total": disputes_total,
            "open": disputes_open,
            "resolved": disputes_resolved,
            "avgResolutionDays": 0
        },
        "certificates": {
            "issued": approved_count,
            "pending": pending_count,
            "thisMonth": 0
        },
        "performance": {
            "avgProcessingTime": "N/A",
            "satisfactionRate": "N/A",
            "completionRate": approval_rate
        }
    }

# 2. Get All Villagers (Citizens)
@router.get("/villagers")
async def get_villagers(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = []
    # Fetch only citizens
    cursor = user_collection.find({"role": "citizen"})
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "fullname": user["fullname"],
            "nic": user["nic"],
            "address": user.get("address", "N/A"),
            "phone": user.get("phone", "N/A")
        })
    return users

# 3. Land Disputes - Add New
@router.post("/land")
async def add_land_dispute(dispute: LandDisputeSchema, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_dispute = await land_collection.insert_one(dispute.dict())
    return {"message": "Dispute registered", "id": str(new_dispute.inserted_id)}

# 4. Land Disputes - Get All
@router.get("/land")
async def get_land_disputes(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    disputes = []
    cursor = land_collection.find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        disputes.append(doc)
    return disputes

# 5. Get GS Applications (Pending for GS review)
@router.get("/applications")
async def get_gs_applications(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    applications = []
    # Get pending applications
    cursor = application_collection.find({"status": "Pending"}).limit(20)
    async for app in cursor:
        applications.append({
            "id": str(app["_id"]),
            "name": app.get("applicant_name", "N/A"),
            "applicant_name": app.get("applicant_name", "N/A"),
            "service": app.get("service_type", "N/A"),
            "service_type": app.get("service_type", "N/A"),
            "date": app.get("created_at", "N/A"),
            "created_at": app.get("created_at", "N/A"),
            "status": app.get("status", "Pending"),
            "priority": "High" if app.get("status") == "Pending" else "Normal"
        })
    return applications

# 6. Get GS Activities (Recent actions/updates)
@router.get("/activities")
async def get_gs_activities(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activities = []
    
    # Get recent applications (all statuses) for activity log
    cursor = application_collection.find({}).sort("created_at", -1).limit(10)
    async for app in cursor:
        if app.get("status") == "Completed":
            action = "Application Approved"
            details = f"{app.get('service_type', 'Application')} approved for {app.get('applicant_name', 'User')}"
        elif app.get("status") == "Pending":
            action = "Application Pending"
            details = f"{app.get('service_type', 'Application')} pending review - {app.get('applicant_name', 'User')}"
        else:
            action = "Application Rejected"
            details = f"{app.get('service_type', 'Application')} rejected for {app.get('applicant_name', 'User')}"
        
        activities.append({
            "id": str(app["_id"]),
            "action": action,
            "title": action,
            "details": details,
            "description": details,
            "time": app.get("created_at", "Recently"),
            "created_at": app.get("created_at", "Recently"),
            "type": "success" if app.get("status") == "Completed" else "info" if app.get("status") == "Pending" else "warning"
        })
    
    return activities


@router.get("/certificates")
async def get_gs_certificates(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    certs: List[Dict[str, Any]] = []
    cursor = application_collection.find({"status": "Completed"}).limit(50)
    async for app in cursor:
        certs.append({
            "id": str(app["_id"]),
            "name": app.get("service_type", "Certificate"),
            "recipient": app.get("applicant_name", "Unknown"),
            "type": app.get("service_type", "General"),
            "date": app.get("created_at", "N/A"),
            "status": "Issued"
        })
    return certs


@router.get("/records")
async def get_gs_records(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    records: List[Dict[str, Any]] = []

    app_cursor = application_collection.find({}).limit(100)
    async for app in app_cursor:
        records.append({
            "id": str(app["_id"]),
            "title": f"Application #{str(app.get('_id'))[:6]}",
            "type": "Application",
            "date": app.get("created_at", "N/A"),
            "villager": app.get("applicant_name", "Unknown"),
            "status": app.get("status", "Archived")
        })

    land_cursor = land_collection.find({}).limit(100)
    async for land in land_cursor:
        records.append({
            "id": str(land["_id"]),
            "title": land.get("title", "Land Dispute"),
            "type": "Dispute",
            "date": land.get("date", "N/A"),
            "villager": land.get("parties_involved", "Multiple"),
            "status": land.get("status", "Archived")
        })

    return records


@router.get("/messages")
async def get_gs_messages(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    return []


@router.post("/messages")
async def post_gs_message(payload: MessagePayload, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"message": "Message received", "payload": payload.dict()}


@router.get("/settings")
async def get_gs_settings(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = await user_collection.find_one({"nic": current_user.get("nic")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "profile": {
            "name": user.get("fullname", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "division": user.get("district", ""),
            "address": user.get("address", "")
        },
        "notifications": {
            "emailNotifications": True,
            "smsNotifications": True,
            "appNotifications": True,
            "dailyReport": True,
            "weeklyReport": False
        },
        "security": {
            "twoFactor": False,
            "sessionTimeout": "30",
            "ipWhitelist": False
        },
        "preferences": {
            "language": "English",
            "dateFormat": "DD-MM-YYYY",
            "timeFormat": "24hr",
            "theme": "light"
        }
    }


@router.put("/settings")
async def update_gs_settings(payload: SettingsPayload, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    updates: Dict[str, Any] = {}
    if payload.phone is not None:
        updates["phone"] = payload.phone
    if payload.address is not None:
        updates["address"] = payload.address

    if updates:
        await user_collection.update_one({"nic": current_user.get("nic")}, {"$set": updates})

    return {"message": "Settings updated", "updated": updates}