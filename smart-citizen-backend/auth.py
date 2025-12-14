import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

# Secret settings from .env
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = "HS256"

# This tells FastAPI that the token is sent in the "Authorization: Bearer" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# 1. Function to Hash a Password
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# 2. Function to Verify a Password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# 3. Function to Create a Login Token (JWT)
def create_access_token(data: dict):
    to_encode = data.copy()
    # Token expires in 24 hours
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 4. Dependency: Get Current User (NIC) from Token
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        nic: str = payload.get("sub")
        if nic is None:
            raise HTTPException(status_code=401, detail="Invalid token credentials")
        return nic
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")