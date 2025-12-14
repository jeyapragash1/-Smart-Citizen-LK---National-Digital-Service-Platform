from fastapi import APIRouter, Depends, HTTPException
from database import application_collection, user_collection, land_collection
from auth import get_current_user
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# --- MODELS ---
class LandDisputeSchema(BaseModel):
    title: str
    description: str
    parties_involved: str
    status: str = "Active"
    date: datetime = datetime.now()

# --- ROUTES ---

# 1. Get GS Dashboard Stats
@router.get("/stats")
async def get_gs_stats(current_user: str = Depends(get_current_user)):
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
async def get_villagers(current_user: str = Depends(get_current_user)):
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
async def add_land_dispute(dispute: LandDisputeSchema, current_user: str = Depends(get_current_user)):
    new_dispute = await land_collection.insert_one(dispute.dict())
    return {"message": "Dispute registered", "id": str(new_dispute.inserted_id)}

# 4. Land Disputes - Get All
@router.get("/land")
async def get_land_disputes(current_user: str = Depends(get_current_user)):
    disputes = []
    cursor = land_collection.find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        disputes.append(doc)
    return disputes