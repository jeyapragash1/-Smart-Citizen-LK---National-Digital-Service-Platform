import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client[DB_NAME]

# Collections
user_collection = database.get_collection("users")
application_collection = database.get_collection("applications")
product_collection = database.get_collection("products")
land_collection = database.get_collection("land_disputes")
service_collection = database.get_collection("services")
complaints_collection = database.get_collection("complaints")
audit_log_collection = database.get_collection("audit_logs")
notifications_collection = database.get_collection("notifications")

print("✅ MongoDB Connection Settings Loaded.")