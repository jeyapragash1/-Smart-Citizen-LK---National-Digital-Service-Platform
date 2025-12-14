from fastapi import APIRouter, HTTPException, status
from database import user_collection
from models import UserRegister, UserLogin
from auth import get_password_hash, verify_password, create_access_token

router = APIRouter()

# ✅ REGISTER API
@router.post("/register")
async def register_user(user: UserRegister):
    # 1. Check if NIC already exists
    existing_user = await user_collection.find_one({"nic": user.nic})
    if existing_user:
        raise HTTPException(status_code=400, detail="NIC already registered!")

    # 2. Hash the password (Security)
    hashed_pwd = get_password_hash(user.password)

    # 3. Prepare data for MongoDB
    user_data = {
        "fullname": user.fullname,
        "nic": user.nic,
        "phone": user.phone,
        "email": user.email,
        "role": user.role,
        "password": hashed_pwd  # Store hash, not plain text
    }

    # 4. Save to Database
    await user_collection.insert_one(user_data)
    
    return {"message": "User registered successfully!", "nic": user.nic}

# ✅ LOGIN API
@router.post("/login")
async def login_user(user: UserLogin):
    # 1. Find user by NIC
    db_user = await user_collection.find_one({"nic": user.nic})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid NIC or Password")

    # 2. Check Password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid NIC or Password")

    # 3. Generate Token
    token = create_access_token({"sub": db_user["nic"], "role": db_user["role"]})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "role": db_user["role"],
        "name": db_user["fullname"]
    }