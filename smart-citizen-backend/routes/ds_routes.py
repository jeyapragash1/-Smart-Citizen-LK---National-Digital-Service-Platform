from fastapi import APIRouter, Depends, HTTPException
from database import application_collection, user_collection
from auth import get_current_user_with_role, get_password_hash
from pydantic import BaseModel, EmailStr
from typing import Optional

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