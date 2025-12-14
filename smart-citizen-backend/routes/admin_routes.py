from fastapi import APIRouter, Depends, HTTPException
from database import user_collection, application_collection, service_collection
from auth import get_current_user_with_role
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter()

# --- MODELS ---
class ServiceUpdate(BaseModel):
    price: float
    days: int
    active: bool

# --- 1. OFFICER MANAGEMENT ---

@router.get("/users")
async def get_all_officers(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    officers = []
    # Find all users who are NOT 'citizen'
    cursor = user_collection.find({"role": {"$in": ["gs", "ds", "admin"]}})
    async for user in cursor:
        officers.append({
            "id": str(user["_id"]),
            "fullname": user["fullname"],
            "role": user["role"],
            "email": user.get("email", ""),
            "division": user.get("address", "General") # Using address field as Division for now
        })
    return officers

@router.delete("/users/{user_id}")
async def delete_officer(user_id: str, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Officer removed successfully"}

# --- NEW: ASSIGN DS TO DIVISION ---
class AssignDSRequest(BaseModel):
    ds_nic: str
    province: str
    district: str
    ds_division: str

@router.post("/assign-ds")
async def assign_ds_to_division(data: AssignDSRequest, current_user: dict = Depends(get_current_user_with_role)):
    """President/Admin assigns DS officer to a specific division"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only President/Admin can assign DS officers")
    
    # Find the DS user
    ds_user = await user_collection.find_one({"nic": data.ds_nic, "role": "ds"})
    if not ds_user:
        raise HTTPException(status_code=404, detail="DS officer not found")
    
    # Update DS with division assignment
    await user_collection.update_one(
        {"nic": data.ds_nic},
        {"$set": {
            "province": data.province,
            "district": data.district,
            "ds_division": data.ds_division,
            "reports_to": current_user["nic"]  # DS reports to President/Admin
        }}
    )
    
    return {
        "message": f"DS {ds_user['fullname']} assigned to {data.ds_division}",
        "details": {
            "ds_name": ds_user['fullname'],
            "province": data.province,
            "district": data.district,
            "division": data.ds_division
        }
    }

# --- GET ALL DS DIVISIONS ---
@router.get("/divisions")
async def get_all_divisions(current_user: dict = Depends(get_current_user_with_role)):
    """Get all DS divisions with assigned officers"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    divisions = []
    cursor = user_collection.find({"role": "ds"})
    async for ds in cursor:
        divisions.append({
            "ds_nic": ds["nic"],
            "ds_name": ds["fullname"],
            "province": ds.get("province", "Unassigned"),
            "district": ds.get("district", "Unassigned"),
            "division": ds.get("ds_division", "Unassigned"),
            "phone": ds.get("phone"),
            "email": ds.get("email")
        })
    
    return divisions

# --- 2. SERVICE CONFIGURATION ---

@router.get("/services")
async def get_services(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    services = []
    cursor = service_collection.find({})
    async for svc in cursor:
        svc["_id"] = str(svc["_id"])
        services.append(svc)
    
    # Seed default services if empty
    if not services:
        defaults = [
            {"name": "Passport Issue", "dept": "Immigration", "price": 20000, "days": 30, "active": True},
            {"name": "NIC Replacement", "dept": "DRP", "price": 2500, "days": 7, "active": True},
            {"name": "Birth Certificate", "dept": "Registrar General", "price": 1200, "days": 1, "active": True},
            {"name": "Police Clearance", "dept": "Police", "price": 1500, "days": 14, "active": True}
        ]
        await service_collection.insert_many(defaults)
        return await get_services(current_user) # Recursive call to fetch what we just inserted

    return services

@router.put("/services/{service_id}")
async def update_service(service_id: str, data: ServiceUpdate, current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await service_collection.update_one(
        {"_id": ObjectId(service_id)},
        {"$set": {"price": data.price, "days": data.days, "active": data.active}}
    )
    return {"message": "Service updated"}

# --- 3. REVENUE ANALYTICS ---

@router.get("/revenue")
async def get_revenue_stats(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    # Calculate revenue from Completed applications
    pipeline = [
        {"$match": {"status": "Completed"}},
        {"$group": {"_id": "$service_type", "count": {"$sum": 1}}}
    ]
    
    breakdown = []
    total_revenue = 0
    
    # Fake pricing map for calculation (in real app, join with service_collection)
    prices = {"Passport": 20000, "NIC": 2500, "Birth Certificate": 1200, "Police": 1500}
    
    async for doc in application_collection.aggregate(pipeline):
        service_name = doc["_id"]
        count = doc["count"]
        # Approximate matching
        price = 1500 
        for key, val in prices.items():
            if key in service_name:
                price = val
                
        revenue = count * price
        total_revenue += revenue
        
        breakdown.append({
            "service": service_name,
            "count": count,
            "revenue": revenue
        })
        
    return {
        "total_revenue": total_revenue,
        "breakdown": breakdown
    }

# --- 4. SYSTEM STATS (NEW) ---
@router.get("/stats")
async def get_system_stats(current_user: dict = Depends(get_current_user_with_role)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    # 1. Count Citizens
    total_citizens = await user_collection.count_documents({"role": "citizen"})
    
    # 2. Count Transactions (Total Applications)
    total_apps = await application_collection.count_documents({})
    
    # 3. Calculate Revenue (Completed Apps * Avg Price 1500)
    completed_apps = await application_collection.count_documents({"status": "Completed"})
    total_revenue = completed_apps * 1500
    
    # 4. Fake Logs (In a real app, these come from a log DB)
    logs = [
        {"time": "10:42:01 AM", "level": "INFO", "module": "Auth", "msg": f"User login verified ({current_user})"},
        {"time": "10:41:55 AM", "level": "SUCCESS", "module": "Payment", "msg": "Transaction Ref: PAY-291 verified"},
        {"time": "10:40:12 AM", "level": "WARN", "module": "Security", "msg": "Rate limit warning: IP 192.168.1.5"},
        {"time": "10:39:45 AM", "level": "INFO", "module": "System", "msg": "Database backup completed"},
    ]

    return {
        "citizens": total_citizens,
        "transactions": total_apps,
        "revenue": total_revenue,
        "health": "Operational",
        "logs": logs
    }
    
# --- 5. DEPLOYMENTS ENDPOINT ---
@router.get("/deployments")
async def get_deployments(current_user: dict = Depends(get_current_user_with_role)):
    """Get CI/CD deployments"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return [
        {
            "id": "deploy-001",
            "env": "Production",
            "version": "v2.3.5",
            "status": "Success",
            "timestamp": "2025-12-14T10:12:00Z",
            "duration": "2m 15s",
            "deployed_by": "CI/CD Pipeline"
        },
        {
            "id": "deploy-002",
            "env": "Staging",
            "version": "v2.3.6-rc",
            "status": "Running",
            "timestamp": "2025-12-14T14:05:00Z",
            "duration": "In progress",
            "deployed_by": "Automated"
        },
        {
            "id": "deploy-003",
            "env": "DR Site",
            "version": "v2.3.4",
            "status": "Success",
            "timestamp": "2025-12-13T10:00:00Z",
            "duration": "1m 45s",
            "deployed_by": "CI/CD Pipeline"
        }
    ]

# --- 6. SUPPORT TICKETS ENDPOINT ---
@router.get("/support/tickets")
async def get_support_tickets(current_user: dict = Depends(get_current_user_with_role)):
    """Get support tickets"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return [
        {
            "id": "TICKET-001",
            "subject": "Login Issues with DS Dashboard",
            "priority": "High",
            "status": "Open",
            "created_at": "2025-12-14T08:00:00Z",
            "updated_at": "2025-12-14T10:30:00Z",
            "assignee": "Support Team",
            "description": "Users unable to access DS admin dashboard"
        },
        {
            "id": "TICKET-002",
            "subject": "Certificate Generation Error",
            "priority": "High",
            "status": "In Progress",
            "created_at": "2025-12-14T09:15:00Z",
            "updated_at": "2025-12-14T14:00:00Z",
            "assignee": "Technical Support",
            "description": "PDF certificates not generating for completed applications"
        },
        {
            "id": "TICKET-003",
            "subject": "Feature Request: Bulk Upload",
            "priority": "Low",
            "status": "Open",
            "created_at": "2025-12-13T15:00:00Z",
            "updated_at": "2025-12-13T15:00:00Z",
            "assignee": "Product Team",
            "description": "Request for bulk upload functionality for citizen records"
        }
    ]

# --- 7. INTEGRATIONS ENDPOINT ---
@router.get("/integrations")
async def get_integrations(current_user: dict = Depends(get_current_user_with_role)):
    """Get third-party service integrations"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return [
        {
            "id": "integ-001",
            "name": "SMS Provider (Dialog)",
            "status": "Connected",
            "health": "Healthy",
            "lastSync": "2025-12-14T12:00:00Z",
            "uptime": "99.95%",
            "connection_type": "API"
        },
        {
            "id": "integ-002",
            "name": "Email Service (SendGrid)",
            "status": "Connected",
            "health": "Degraded",
            "lastSync": "2025-12-14T11:30:00Z",
            "uptime": "98.50%",
            "connection_type": "API",
            "issues": "High latency observed"
        },
        {
            "id": "integ-003",
            "name": "Payment Gateway (Stripe)",
            "status": "Connected",
            "health": "Healthy",
            "lastSync": "2025-12-14T13:45:00Z",
            "uptime": "99.99%",
            "connection_type": "API"
        },
        {
            "id": "integ-004",
            "name": "Document Storage (S3)",
            "status": "Connected",
            "health": "Healthy",
            "lastSync": "2025-12-14T12:30:00Z",
            "uptime": "100%",
            "connection_type": "Cloud Storage"
        },
        {
            "id": "integ-005",
            "name": "Analytics (Google Analytics)",
            "status": "Connected",
            "health": "Healthy",
            "lastSync": "2025-12-14T11:00:00Z",
            "uptime": "99.90%",
            "connection_type": "API"
        }
    ]

# --- 8. FEATURE FLAGS ENDPOINT ---
@router.get("/features")
async def get_feature_flags(current_user: dict = Depends(get_current_user_with_role)):
    """Get feature flags for controlled rollout"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    return [
        {
            "key": "new_ds_dashboard",
            "name": "New DS Dashboard",
            "enabled": True,
            "description": "Roll out new DS admin dashboard UI",
            "rollout_percentage": 25,
            "created_at": "2025-12-01T00:00:00Z",
            "last_modified": "2025-12-14T10:00:00Z"
        },
        {
            "key": "payments_v2",
            "name": "Payments v2",
            "enabled": False,
            "description": "New payment processing system with better security",
            "rollout_percentage": 0,
            "created_at": "2025-11-15T00:00:00Z",
            "last_modified": "2025-12-10T12:00:00Z"
        },
        {
            "key": "sms_dr_fallback",
            "name": "SMS DR Fallback",
            "enabled": True,
            "description": "Auto failover to secondary SMS provider on primary failure",
            "rollout_percentage": 100,
            "created_at": "2025-11-20T00:00:00Z",
            "last_modified": "2025-12-05T08:00:00Z"
        },
        {
            "key": "advanced_reporting",
            "name": "Advanced Reporting",
            "enabled": True,
            "description": "Enhanced analytics and custom report generation",
            "rollout_percentage": 50,
            "created_at": "2025-12-08T00:00:00Z",
            "last_modified": "2025-12-14T09:30:00Z"
        },
        {
            "key": "ai_recommendations",
            "name": "AI Recommendations",
            "enabled": False,
            "description": "AI-powered service recommendations for citizens",
            "rollout_percentage": 0,
            "created_at": "2025-12-10T00:00:00Z",
            "last_modified": "2025-12-14T14:00:00Z"
        }
    ]

    @router.put("/features/{feature_key}")
    async def toggle_feature_flag(feature_key: str, enabled: bool, current_user: dict = Depends(get_current_user_with_role)):
        """Toggle feature flag on/off"""
        if current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
    
        # TODO: Update feature flag in database
        return {
            "message": f"Feature '{feature_key}' set to {enabled}",
            "key": feature_key,
            "enabled": enabled,
            "updated_at": "2025-12-14T15:00:00Z"
        }
