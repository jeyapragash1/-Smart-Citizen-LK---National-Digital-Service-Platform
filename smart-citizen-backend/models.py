from pydantic import BaseModel, EmailStr, Field
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
    
    # Geographic Hierarchy Fields
    province: Optional[str] = None  # e.g., "Western", "Central", "Southern"
    district: Optional[str] = None  # e.g., "Colombo", "Kandy", "Galle"
    ds_division: Optional[str] = None  # e.g., "Colombo DS", "Dehiwala DS" (for DS and GS officers)
    gs_section: Optional[str] = None  # e.g., "Wellawatta GS", "Bambalapitiya GS" (for GS officers only)
    
    # Supervisor tracking
    reports_to: Optional[str] = None  # NIC of supervisor (GS reports to DS NIC)

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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Multi-level Approval Workflow
    approval_level: str = "gs_ds"  # "gs_only" | "gs_ds" | "gs_ds_district" | "gs_ds_district_ministry" | "presidential"
    current_approval_stage: str = "gs"  # Current stage: "gs" | "ds" | "district" | "ministry" | "completed"
    approval_chain: list = Field(default_factory=list)  # [{'level': 'gs', 'nic': '888...', 'action': 'Approved', 'timestamp': '...', 'comments': '...'}]
    assigned_gs: Optional[str] = None  # GS NIC handling this application
    assigned_ds: Optional[str] = None  # DS NIC handling this application
    assigned_district: Optional[str] = None  # District officer NIC
    certificate_path: Optional[str] = None  # Path to generated certificate

class ServiceSchema(BaseModel):
    service_name: str  # e.g., "Birth Certificate", "Police Report", "Passport"
    category: str  # e.g., "Certificates", "Legal", "Identity"
    description: str
    fee: float  # Service fee in LKR
    processing_days: int  # Expected processing time
    
    # Approval Level Configuration
    approval_level: str  # "gs_only" | "gs_ds" | "gs_ds_district" | "gs_ds_district_ministry" | "presidential"
    required_approvers: list  # ["gs", "ds"] or ["gs", "ds", "district", "ministry"]
    
    # Requirements
    required_documents: list = Field(default_factory=list)  # ["NIC Copy", "Birth Certificate"]
    is_active: bool = True

class ProductSchema(BaseModel):
    name: str
    category: str        # e.g., "Baby", "Housing"
    price: float
    image: str           # We will store a simple string/url for now
    event_trigger: str   # e.g., "Birth" -> shows this product
    stock: int