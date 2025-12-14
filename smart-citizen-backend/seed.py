import asyncio
import os
from database import user_collection
from auth import get_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def seed_users():
    print("🌱 Seeding Admin Users...")

    # 1. Define the Special Users with Geographic Hierarchy
    users = [
        {
            "fullname": "President - Super Admin",
            "nic": "999999999V",
            "phone": "0000000000",
            "email": "admin@gov.lk",
            "password": "admin",  # Simple password for testing
            "role": "admin",
            "address": "Presidential Secretariat, Colombo",
            "province": "Western",
            "district": "Colombo",
            "ds_division": None,  # President oversees all divisions
            "gs_section": None,
            "reports_to": None  # Top of hierarchy
        },
        {
            "fullname": "Mrs. Perera (DS)",
            "nic": "777777777V",
            "phone": "0114445555",
            "email": "ds@gov.lk",
            "password": "ds",
            "role": "ds",
            "address": "Colombo District Secretariat",
            "province": "Western",
            "district": "Colombo",
            "ds_division": "Colombo DS Division",  # DS manages this division
            "gs_section": None,  # DS doesn't have specific GS section
            "reports_to": "999999999V"  # Reports to President/Admin
        },
        {
            "fullname": "Officer K. Silva (GS)",
            "nic": "888888888V",
            "phone": "0112223333",
            "email": "gs@gov.lk",
            "password": "gs",
            "role": "gs",
            "address": "Wellawatta GS Office",
            "province": "Western",
            "district": "Colombo",
            "ds_division": "Colombo DS Division",  # Under Colombo DS
            "gs_section": "Wellawatta GS Section",  # GS specific section
            "reports_to": "777777777V"  # Reports to DS Perera
        }
    ]

    # 2. Insert into Database
    for user in users:
        existing = await user_collection.find_one({"nic": user["nic"]})
        if existing:
            continue
        user["password"] = get_password_hash(user["password"])
        await user_collection.insert_one(user)
        print(f"✅ Created: {user['fullname']} ({user['role']})")


if __name__ == "__main__":
    asyncio.run(seed_users())