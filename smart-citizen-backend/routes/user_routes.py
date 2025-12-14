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

# 4. Get User Documents (for dashboard documents section)
@router.get("/documents")
async def get_user_documents(current_user: str = Depends(get_current_user)):
    """Get user's important documents"""
    documents = []
    
    # Get completed applications and format them as documents
    cursor = application_collection.find({
        "applicant_nic": current_user, 
        "status": "Completed"
    }).limit(10)
    
    async for app in cursor:
        documents.append({
            "id": str(app["_id"]),
            "name": app["service_type"],
            "date": app.get("created_at", "N/A"),
            "status": "✅ Verified",
            "icon": "📄",
            "type": "document"
        })
    
    return documents

# 5. Get User Certifications (for dashboard certifications section)
@router.get("/certifications")
async def get_user_certifications(current_user: str = Depends(get_current_user)):
    """Get user's certifications and achievements"""
    certifications = []
    
    # Get completed applications that are certification-type services
    certification_keywords = [
        "certificate", "certification", "award", "achievement", 
        "license", "permit", "registration"
    ]
    
    cursor = application_collection.find({
        "applicant_nic": current_user,
        "status": "Completed"
    }).limit(10)
    
    async for app in cursor:
        service_type = app["service_type"].lower()
        # Check if it's a certification-type service
        if any(keyword in service_type for keyword in certification_keywords):
            certifications.append({
                "id": str(app["_id"]),
                "name": app["service_type"],
                "date": app.get("created_at", "N/A")[:10] if app.get("created_at") else "N/A",
                "icon": "🏆",
                "issuer": "Government of Sri Lanka",
                "category": "Official Certification"
            })
    
    return certifications

# 6. Get User Notifications (for dashboard notifications section)
@router.get("/notifications")
async def get_user_notifications(current_user: str = Depends(get_current_user)):
    """Get user's recent notifications and updates"""
    notifications = []
    
    # Get recent applications (both pending and completed)
    cursor = application_collection.find({
        "applicant_nic": current_user
    }).sort("created_at", -1).limit(5)
    
    async for app in cursor:
        if app["status"] == "Completed":
            notifications.append({
                "id": str(app["_id"]),
                "title": f"Your {app['service_type']} is Ready",
                "desc": f"Your application has been approved. Download now.",
                "time": app.get("created_at", "Recently")[:10] if app.get("created_at") else "Recently",
                "type": "success"
            })
        elif app["status"] == "Pending":
            notifications.append({
                "id": str(app["_id"]),
                "title": f"{app['service_type']} - Under Review",
                "desc": f"Your application is being processed by our team.",
                "time": app.get("created_at", "Recently")[:10] if app.get("created_at") else "Recently",
                "type": "info"
            })
        elif app["status"] == "Rejected":
            notifications.append({
                "id": str(app["_id"]),
                "title": f"{app['service_type']} - Action Required",
                "desc": f"Your application needs additional information.",
                "time": app.get("created_at", "Recently")[:10] if app.get("created_at") else "Recently",
                "type": "warning"
            })
    
    return notifications

# 7. Get User Permits (for dashboard permits section)
@router.get("/permits")
async def get_user_permits(current_user: str = Depends(get_current_user)):
    """Get user's permits and licenses"""
    permits = []
    
    # Get completed applications that are permit/license-type services
    permit_keywords = ["permit", "license", "registration", "clearance"]
    
    cursor = application_collection.find({
        "applicant_nic": current_user,
        "status": "Completed"
    }).limit(10)
    
    async for app in cursor:
        service_type = app["service_type"].lower()
        if any(keyword in service_type for keyword in permit_keywords):
            permits.append({
                "id": str(app["_id"]),
                "name": app["service_type"],
                "number": f"LIC-{str(app['_id'])[-6:].upper()}",
                "issuer": "Government Authority",
                "date": app.get("created_at", "N/A")[:10] if app.get("created_at") else "N/A",
                "expiry": "Valid until renewed",
                "status": "✅ Active",
                "icon": "📜",
                "daysLeft": 365
            })
    
    return permits