from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 1. What we need to Register a user
class UserRegister(BaseModel):
    fullname: str
    nic: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    role: str = "citizen"  # Can be: citizen, gs, ds, admin

# 2. What we need to Login
class UserLogin(BaseModel):
    nic: str
    password: str

# 3. What the database actually looks like (Login response)
class UserInDB(UserRegister):
    hashed_password: str

class ApplicationSchema(BaseModel):
    service_type: str    # e.g., "Birth Certificate"
    applicant_nic: str   # Who applied?
    details: dict        # Extra data (reason, address, etc.)
    status: str = "Pending"
    created_at: datetime = datetime.now()

class ProductSchema(BaseModel):
    name: str
    category: str        # e.g., "Baby", "Housing"
    price: float
    image: str           # We will store a simple string/url for now
    event_trigger: str   # e.g., "Birth" -> shows this product
    stock: int