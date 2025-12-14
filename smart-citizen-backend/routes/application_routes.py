from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from database import application_collection
from models import ApplicationSchema
from auth import get_current_user, get_current_user_with_role
from bson import ObjectId
from utils.pdf_generator import generate_certificate # Import our new tool
import os

router = APIRouter()

# 1. Create Application (with approval workflow initialization)
@router.post("/")
async def create_application(app_data: ApplicationSchema, current_user: str = Depends(get_current_user)):
    from database import user_collection
    
    app_data.applicant_nic = current_user
    
    # Get citizen's GS section to assign application
    citizen = await user_collection.find_one({"nic": current_user})
    if citizen:
        # Find the GS officer for this citizen's section
        gs_officer = await user_collection.find_one({
            "role": "gs",
            "gs_section": citizen.get("gs_section")
        })
        if gs_officer:
            app_data.assigned_gs = gs_officer["nic"]
            
            # Find the DS officer for this GS's division
            ds_officer = await user_collection.find_one({
                "role": "ds",
                "ds_division": gs_officer.get("ds_division")
            })
            if ds_officer:
                app_data.assigned_ds = ds_officer["nic"]
    
    # Initialize approval workflow
    app_data.current_approval_stage = "gs"  # Starts at GS level
    app_data.approval_chain = []
    
    new_app = await application_collection.insert_one(app_data.dict())
    return {
        "message": "Application submitted successfully",
        "id": str(new_app.inserted_id),
        "approval_level": app_data.approval_level,
        "current_stage": app_data.current_approval_stage,
        "assigned_to": app_data.assigned_gs
    }

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
async def get_pending_applications(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = []
    cursor = application_collection.find({"status": "Pending"})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        apps.append(document)
    return apps

# 4. Approve/Reject at Current Stage (Multi-level workflow)
@router.put("/{app_id}/status")
async def update_application_status(app_id: str, status_update: dict, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] not in {"gs", "ds", "admin"}:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from datetime import datetime
    
    app_data = await application_collection.find_one({"_id": ObjectId(app_id)})
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")
    
    action = status_update.get("status")  # "Approved", "Rejected", "Completed"
    comments = status_update.get("comments", "")
    
    current_stage = app_data.get("current_approval_stage", "gs")
    approval_level = app_data.get("approval_level", "gs_ds")
    approval_chain = app_data.get("approval_chain", [])
    
    # Validate user can act at this stage
    if current_stage == "gs" and current_user["role"] != "gs" and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only GS can approve at this stage")
    elif current_stage == "ds" and current_user["role"] not in {"ds", "admin"}:
        raise HTTPException(status_code=403, detail="Only DS can approve at this stage")
    
    # Handle rejection
    if action == "Rejected":
        approval_chain.append({
            "level": current_stage,
            "nic": current_user["nic"],
            "action": "Rejected",
            "timestamp": datetime.utcnow().isoformat(),
            "comments": comments
        })
        
        await application_collection.update_one(
            {"_id": ObjectId(app_id)},
            {"$set": {
                "status": "Rejected",
                "approval_chain": approval_chain
            }}
        )
        return {"message": "Application rejected"}
    
    # Handle approval
    approval_chain.append({
        "level": current_stage,
        "nic": current_user["nic"],
        "action": "Approved",
        "timestamp": datetime.utcnow().isoformat(),
        "comments": comments
    })
    
    # Determine next stage
    next_stage = None
    final_status = "Pending"
    
    if approval_level == "gs_only":
        # GS approval is final
        next_stage = "completed"
        final_status = "Completed"
    elif approval_level == "gs_ds":
        if current_stage == "gs":
            next_stage = "ds"
        elif current_stage == "ds":
            next_stage = "completed"
            final_status = "Completed"
    elif approval_level == "gs_ds_district":
        if current_stage == "gs":
            next_stage = "ds"
        elif current_stage == "ds":
            next_stage = "district"
        elif current_stage == "district":
            next_stage = "completed"
            final_status = "Completed"
    elif approval_level == "gs_ds_district_ministry":
        if current_stage == "gs":
            next_stage = "ds"
        elif current_stage == "ds":
            next_stage = "district"
        elif current_stage == "district":
            next_stage = "ministry"
        elif current_stage == "ministry":
            next_stage = "completed"
            final_status = "Completed"
    
    # Update application
    update_data = {
        "current_approval_stage": next_stage,
        "approval_chain": approval_chain,
        "status": final_status
    }
    
    await application_collection.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update_data}
    )
    
    # Generate certificate if completed
    if final_status == "Completed":
        cert_path = generate_certificate(
            app_id=app_id,
            applicant_name=app_data["details"].get("name", ""),
            nic=app_data["applicant_nic"],
            service_type=app_data["service_type"]
        )
        await application_collection.update_one(
            {"_id": ObjectId(app_id)},
            {"$set": {"certificate_path": cert_path}}
        )
    
    return {
        "message": f"Application approved at {current_stage} level",
        "next_stage": next_stage,
        "final_status": final_status,
        "approval_chain": approval_chain
    }

# 5. DOWNLOAD PDF (New Endpoint)
@router.get("/{app_id}/download")
async def download_certificate(app_id: str, current_user: dict = Depends(get_current_user_with_role)):
    app_data = await application_collection.find_one({"_id": ObjectId(app_id)})
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")

    # Only owner or admin/gs/ds can download
    if current_user["nic"] != app_data["applicant_nic"] and current_user["role"] not in {"admin", "gs", "ds"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    file_path = f"generated_certs/{app_id}.pdf"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=f"Certificate_{app_id}.pdf")
    raise HTTPException(status_code=404, detail="Certificate not ready yet")


@router.delete("/{app_id}")
async def delete_application(app_id: str, current_user: dict = Depends(get_current_user_with_role)):
    app_data = await application_collection.find_one({"_id": ObjectId(app_id)})
    if not app_data:
        raise HTTPException(status_code=404, detail="Application not found")

    # Allow owner or admin/gs/ds roles to delete/withdraw
    if current_user["nic"] != app_data["applicant_nic"] and current_user["role"] not in {"admin", "gs", "ds"}:
        raise HTTPException(status_code=403, detail="Not authorized")

    await application_collection.delete_one({"_id": ObjectId(app_id)})
    return {"message": "Application withdrawn"}