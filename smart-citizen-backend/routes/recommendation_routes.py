from fastapi import APIRouter, Depends
from database import application_collection, product_collection
from auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_smart_recommendations(current_user: str = Depends(get_current_user)):
    """
    1. Look at User's Approved Applications.
    2. Identify Life Events (e.g., Birth Cert -> 'Birth').
    3. Fetch Products matching those events.
    """
    
    # 1. Find Completed Applications for this user
    completed_apps = []
    cursor = application_collection.find({"applicant_nic": current_user, "status": "Completed"})
    async for app in cursor:
        completed_apps.append(app["service_type"])

    # 2. Determine Triggers
    triggers = []
    # Logic: Map Service Name to Event Trigger
    for service in completed_apps:
        if "Birth" in service:
            triggers.append("Birth")
        elif "Marriage" in service:
            triggers.append("Marriage")
        elif "Vehicle" in service:
            triggers.append("Vehicle")
            
    # Default: If no apps, show general items
    if not triggers:
        triggers = ["General"] 

    # 3. Fetch Matching Products
    recommendations = []
    product_cursor = product_collection.find({"event_trigger": {"$in": triggers}})
    async for product in product_cursor:
        product["_id"] = str(product["_id"])
        recommendations.append(product)

    return {
        "triggers": triggers,
        "products": recommendations
    }