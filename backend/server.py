from fastapi import FastAPI, APIRouter, HTTPException, Depends, Cookie, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# Pearl Models
class Pearl(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    category: str
    image: str  # base64 encoded string
    description: str
    size: str
    origin: str
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PearlCreate(BaseModel):
    name: str
    price: float
    category: str
    image: str
    description: str
    size: str
    origin: str

class PearlUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    size: Optional[str] = None
    origin: Optional[str] = None
    in_stock: Optional[bool] = None

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Cart Models
class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pearl_id: str
    quantity: int = 1
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemAdd(BaseModel):
    pearl_id: str
    quantity: int = 1

# Authentication helper
async def get_current_user(
    response: Response,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    # First check cookie
    token = session_token
    
    # Fallback to Authorization header
    if not token and authorization:
        token = authorization.credentials
    
    if not token:
        return None
    
    # Find session in database
    session = await db.user_sessions.find_one({"session_token": token})
    if not session or session["expires_at"] < datetime.now(timezone.utc):
        if session:
            await db.user_sessions.delete_one({"_id": session["_id"]})
        return None
    
    # Find user
    user_doc = await db.users.find_one({"id": session["user_id"]})
    if not user_doc:
        return None
    
    return User(**user_doc)

# Sample pearl data initialization
async def init_sample_data():
    # Check if pearls already exist
    existing_pearls = await db.pearls.count_documents({})
    if existing_pearls > 0:
        return
    
    # Create sample pearls with base64 placeholder images
    sample_pearls = [
        {
            "id": str(uuid.uuid4()),
            "name": "Classic Akoya Pearl Necklace",
            "price": 299.0,
            "category": "akoya",
            "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZFNEU2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzhCNUEzQyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFreWEgUGVhcmw8L3RleHQ+Cjwvc3ZnPgo=",
            "description": "Elegant 18-inch strand of lustrous Akoya pearls",
            "size": "7-7.5mm",
            "origin": "Japan",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tahitian Black Pearl Earrings",
            "price": 599.0,
            "category": "tahitian",
            "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkYyRjJGIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJsYWNrIFBlYXJsPC90ZXh0Pgo8L3N2Zz4K",
            "description": "Sophisticated black Tahitian pearl stud earrings",
            "size": "9-10mm",
            "origin": "French Polynesia",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "South Sea Golden Pearl Ring",
            "price": 899.0,
            "category": "south-sea",
            "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZENzAwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdvbGQgUGVhcmw8L3RleHQ+Cjwvc3ZnPgo=",
            "description": "Luxurious golden South Sea pearl cocktail ring",
            "size": "11-12mm",
            "origin": "Australia",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Freshwater Pearl Bracelet",
            "price": 149.0,
            "category": "freshwater",
            "image": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjODdDRUVCIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMDAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZyZXNoIFBlYXJsPC90ZXh0Pgo8L3N2Zz4K",
            "description": "Delicate freshwater pearl tennis bracelet",
            "size": "6-7mm",
            "origin": "China",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.pearls.insert_many(sample_pearls)
    logger.info("Sample pearl data initialized")

# Authentication endpoints
@api_router.post("/auth/process-session")
async def process_session(session_id: str, response: Response):
    try:
        # Call Emergent auth service to get session data
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        auth_data = auth_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": auth_data["email"]})
        
        if not existing_user:
            # Create new user
            user = User(
                email=auth_data["email"],
                name=auth_data["name"],
                picture=auth_data.get("picture")
            )
            await db.users.insert_one(user.dict())
            user_id = user.id
        else:
            user_id = existing_user["id"]
        
        # Create session
        session_token = auth_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = UserSession(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        await db.user_sessions.insert_one(session.dict())
        
        # Set cookie
        response.set_cookie(
            "session_token",
            session_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "email": auth_data["email"],
                "name": auth_data["name"],
                "picture": auth_data.get("picture")
            }
        }
        
    except Exception as e:
        logger.error(f"Session processing error: {e}")
        raise HTTPException(status_code=500, detail="Session processing failed")

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(get_current_user)):
    if user:
        await db.user_sessions.delete_many({"user_id": user.id})
    
    response.delete_cookie("session_token", path="/")
    return {"success": True}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# Pearl endpoints
@api_router.get("/pearls", response_model=List[Pearl])
async def get_pearls(category: Optional[str] = None, search: Optional[str] = None):
    query = {"in_stock": True}
    
    if category and category != "all":
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    pearls = await db.pearls.find(query).to_list(100)
    return [Pearl(**pearl) for pearl in pearls]

@api_router.get("/pearls/{pearl_id}", response_model=Pearl)
async def get_pearl(pearl_id: str):
    pearl = await db.pearls.find_one({"id": pearl_id})
    if not pearl:
        raise HTTPException(status_code=404, detail="Pearl not found")
    return Pearl(**pearl)

@api_router.post("/pearls", response_model=Pearl)
async def create_pearl(pearl_data: PearlCreate, user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pearl = Pearl(**pearl_data.dict())
    await db.pearls.insert_one(pearl.dict())
    return pearl

# Cart endpoints
@api_router.get("/cart")
async def get_cart(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    cart = await db.carts.find_one({"user_id": user.id})
    if not cart:
        cart = Cart(user_id=user.id)
        await db.carts.insert_one(cart.dict())
        return {"items": [], "total": 0, "count": 0}
    
    # Get pearl details for each cart item
    cart_items = []
    total = 0
    
    for item in cart.get("items", []):
        pearl = await db.pearls.find_one({"id": item["pearl_id"]})
        if pearl:
            item_total = pearl["price"] * item["quantity"]
            cart_items.append({
                "id": item["id"],
                "pearl": Pearl(**pearl),
                "quantity": item["quantity"],
                "total": item_total
            })
            total += item_total
    
    return {
        "items": cart_items,
        "total": total,
        "count": sum(item["quantity"] for item in cart.get("items", []))
    }

@api_router.post("/cart/add")
async def add_to_cart(item: CartItemAdd, user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Verify pearl exists
    pearl = await db.pearls.find_one({"id": item.pearl_id})
    if not pearl:
        raise HTTPException(status_code=404, detail="Pearl not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": user.id})
    if not cart:
        cart = Cart(user_id=user.id)
        cart_dict = cart.dict()
        await db.carts.insert_one(cart_dict)
    
    # Check if item already in cart
    cart_items = cart.get("items", []) if cart else []
    existing_item = None
    
    for cart_item in cart_items:
        if cart_item["pearl_id"] == item.pearl_id:
            existing_item = cart_item
            break
    
    if existing_item:
        # Update quantity
        existing_item["quantity"] += item.quantity
        await db.carts.update_one(
            {"user_id": user.id},
            {"$set": {"items": cart_items, "updated_at": datetime.now(timezone.utc)}}
        )
    else:
        # Add new item
        new_item = CartItem(pearl_id=item.pearl_id, quantity=item.quantity)
        await db.carts.update_one(
            {"user_id": user.id},
            {"$push": {"items": new_item.dict()}, "$set": {"updated_at": datetime.now(timezone.utc)}}
        )
    
    return {"success": True, "message": "Item added to cart"}

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    await db.carts.update_one(
        {"user_id": user.id},
        {"$pull": {"items": {"id": item_id}}, "$set": {"updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"success": True, "message": "Item removed from cart"}

@api_router.put("/cart/{item_id}")
async def update_cart_item(item_id: str, quantity: int, user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if quantity <= 0:
        return await remove_from_cart(item_id, user)
    
    cart = await db.carts.find_one({"user_id": user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Update item quantity
    cart_items = cart.get("items", [])
    for item in cart_items:
        if item["id"] == item_id:
            item["quantity"] = quantity
            break
    
    await db.carts.update_one(
        {"user_id": user.id},
        {"$set": {"items": cart_items, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"success": True, "message": "Cart updated"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    await init_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()