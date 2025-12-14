from fastapi import APIRouter, Depends, HTTPException
from database import application_collection, user_collection, land_collection
from auth import get_current_user_with_role, get_password_hash
from pydantic import BaseModel, EmailStr
from bson import ObjectId
from datetime import datetime
from typing import Optional

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
    pending_count = await application_collection.count_documents({"status": "Pending"})
    approved_today = await application_collection.count_documents({"status": "Completed"}) # Simplified
    total_villagers = await user_collection.count_documents({"role": "citizen"})
    disputes = await land_collection.count_documents({"status": "Active"})
    
    return {
        "pending": pending_count,
        "villagers": total_villagers,
        "approved": approved_today,
        "disputes": disputes
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