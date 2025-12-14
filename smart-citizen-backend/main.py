from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import database
from routes import auth_routes, application_routes, product_routes, recommendation_routes, user_routes, gs_routes, ds_routes, admin_routes
from routes import auth_routes, application_routes, product_routes, recommendation_routes, user_routes, gs_routes # <--- Added gs_routes
from routes import auth_routes, application_routes, product_routes, recommendation_routes, user_routes, gs_routes, ds_routes
from routes import auth_routes, application_routes, product_routes, recommendation_routes, user_routes, gs_routes, ds_routes, admin_routes, chat_routes


app = FastAPI(title="Smart Citizen LK Backend")
app.include_router(ds_routes.router, prefix="/api/ds", tags=["Divisional Secretary"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["Super Admin"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await database.command("ping")
    print("✅ MongoDB Connected")

@app.on_event("shutdown")
async def shutdown_db_client():
    print("🔌 MongoDB Closed")

# Register Routes
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(application_routes.router, prefix="/api/applications", tags=["Applications"])
app.include_router(product_routes.router, prefix="/api/products", tags=["Marketplace"])
app.include_router(recommendation_routes.router, prefix="/api/recommendations", tags=["AI Engine"])
app.include_router(user_routes.router, prefix="/api/users", tags=["User Profile"])
# NEW: GS Routes
app.include_router(gs_routes.router, prefix="/api/gs", tags=["Grama Niladhari"]) 
app.include_router(chat_routes.router, prefix="/api/chat", tags=["Chatbot"])

@app.get("/")
def read_root():
    return {"message": "Backend is Running 🚀"}