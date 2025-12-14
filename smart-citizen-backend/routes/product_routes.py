from fastapi import APIRouter, Depends, HTTPException
from database import product_collection
from models import ProductSchema
from auth import get_current_user # To protect admin routes

router = APIRouter()

# 1. Get All Products (Public - for Marketplace)
@router.get("/")
async def get_all_products():
    products = []
    cursor = product_collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        products.append(document)
    return products

# 2. Add New Product (Protected - Admin Only)
@router.post("/")
async def create_product(product: ProductSchema, current_user: str = Depends(get_current_user)):
    # In a real app, verify if current_user is 'admin' here
    
    new_product = await product_collection.insert_one(product.dict())
    return {"message": "Product added successfully", "id": str(new_product.inserted_id)}