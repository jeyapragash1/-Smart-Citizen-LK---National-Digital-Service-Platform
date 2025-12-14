from fastapi import APIRouter, Depends, HTTPException
from database import user_collection, application_collection
from auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Schema for updating profile
class UserUpdate(BaseModel):
    phone: str
    email: str
    address: str

# 1. Get Current User Profile
@router.get("/me")
async def get_user_profile(current_user: str = Depends(get_current_user)):
    user = await user_collection.find_one({"nic": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return user info (exclude password!)
    return {
        "nic": user["nic"],
        "fullname": user["fullname"],
        "phone": user.get("phone", ""),
        "email": user.get("email", ""),
        "address": user.get("address", ""),
        "role": user["role"]
    }

# 2. Update User Profile
@router.put("/me")
async def update_user_profile(data: UserUpdate, current_user: str = Depends(get_current_user)):
    update_result = await user_collection.update_one(
        {"nic": current_user},
        {"$set": {"phone": data.phone, "email": data.email, "address": data.address}}
    )
    if update_result.modified_count == 0:
        return {"message": "No changes made"}
    
    return {"message": "Profile updated successfully"}

# 3. Get Digital Wallet (Approved Applications)
@router.get("/wallet")
async def get_wallet_documents(current_user: str = Depends(get_current_user)):
    documents = []
    # Find applications that are 'Completed' -> These become Wallet Docs
    cursor = application_collection.find({"applicant_nic": current_user, "status": "Completed"})
    
    async for doc in cursor:
        documents.append({
            "id": str(doc["_id"]),
            "title": doc["service_type"],
            "issued_date": doc["created_at"],
            "issuer": "Govt of Sri Lanka",
            "type": "Official"
        })
    return documents