from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from database import application_collection
from models import ApplicationSchema
from auth import get_current_user
from bson import ObjectId
from utils.pdf_generator import generate_certificate # Import our new tool
import os

router = APIRouter()

# 1. Create Application
@router.post("/")
async def create_application(app_data: ApplicationSchema, current_user: str = Depends(get_current_user)):
    app_data.applicant_nic = current_user
    new_app = await application_collection.insert_one(app_data.dict())
    return {"message": "Application submitted successfully", "id": str(new_app.inserted_id)}

# 2. Get My Applications
@router.get("/my-apps")
async def get_my_applications(current_user: str = Depends(get_current_user)):
    apps = []
    cursor = application_collection.find({"applicant_nic": current_user})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        apps.append(document)
    return apps

# 3. Get Pending (Admin)
@router.get("/pending")
async def get_pending_applications(current_user: str = Depends(get_current_user)):
    apps = []
    cursor = application_collection.find({"status": "Pending"})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        apps.append(document)
    return apps

# 4. Update Status & GENERATE PDF (Admin)
@router.put("/{app_id}/status")
async def update_application_status(app_id: str, status_update: dict, current_user: str = Depends(get_current_user)):
    new_status = status_update.get("status")
    
    # Update Status
    result = await application_collection.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": new_status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    # 🔥 GENERATE PDF IF COMPLETED
    if new_status == "Completed":
        # Fetch app details
        app_data = await application_collection.find_one({"_id": ObjectId(app_id)})
        
        # Create PDF
        generate_certificate(
            app_id=app_id,
            applicant_name=app_data["details"]["name"],
            nic=app_data["applicant_nic"],
            service_type=app_data["service_type"]
        )

    return {"message": f"Application marked as {new_status}"}

# 5. DOWNLOAD PDF (New Endpoint)
@router.get("/{app_id}/download")
async def download_certificate(app_id: str):
    file_path = f"generated_certs/{app_id}.pdf"
    
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=f"Certificate_{app_id}.pdf")
    
    raise HTTPException(status_code=404, detail="Certificate not ready yet")