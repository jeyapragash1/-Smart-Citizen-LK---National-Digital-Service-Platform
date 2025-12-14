from fastapi import APIRouter, Depends
from database import application_collection
from auth import get_current_user

router = APIRouter()

# 1. DS Stats (Overview)
@router.get("/stats")
async def get_ds_stats(current_user: str = Depends(get_current_user)):
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
async def get_approval_queue(current_user: str = Depends(get_current_user)):
    apps = []
    cursor = application_collection.find({"status": "Pending"})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        apps.append(doc)
    return apps

# 3. Issued Certificates (Get all Completed apps)
@router.get("/certificates")
async def get_issued_certificates(current_user: str = Depends(get_current_user)):
    apps = []
    cursor = application_collection.find({"status": "Completed"})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        apps.append(doc)
    return apps