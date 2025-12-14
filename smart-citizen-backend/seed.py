import asyncio
import os
from database import user_collection
from auth import get_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def seed_users():
    print("🌱 Seeding Admin Users...")

    # 1. Define the Special Users
    users = [
        {
            "fullname": "Super Admin",
            "nic": "999999999V",
            "phone": "0000000000",
            "email": "admin@gov.lk",
            "password": "admin",  # Simple password for testing
            "role": "admin",
            "address": "Ministry of Technology"
        },
        {
            "fullname": "Officer K. Silva (GS)",
            "nic": "888888888V",
            "phone": "0112223333",
            "email": "gs@gov.lk",
            "password": "gs",
            "role": "gs",
            "address": "Colombo 03 Division"
        },
        {
            "fullname": "Mrs. Perera (DS)",
            "nic": "777777777V",
            "phone": "0114445555",
            "email": "ds@gov.lk",
            "password": "ds",
            "role": "ds",
            "address": "Colombo District Secretariat"
        }
    ]

    # 2. Insert into Database
    for user in users:
        # Check if exists first
        existing = await user_collection.find_one({"nic": user["nic"]})
        if not existing:
            # Hash the password
            user["password"] = get_password_hash(user["password"])
            await user_collection.insert_one(user)
            print(f"✅ Created: {user['fullname']} ({user['role']})")
        e