"""
FastAPI Backend Application - SIH26033: Direct Farmer-to-Consumer Digital Agri-Marketplace
"""

import os
import json
import uuid
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load .env file for local development (safe no-op in production where env vars are injected by platform)
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Query, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import (
    User, CropListing, Order, MandiPrice, LogisticsBatch, CropRfq,
    UserRole, QualityGrade, ListingStatus, OrderStatus, PaymentStatus
)
from schemas import (
    UserResponse, LoginRequest, UserRegister, TokenResponse, CropListingCreate, CropListingUpdate, CropListingResponse,
    PricePredictionRequest, PricePredictionResponse, OrderCreate,
    OrderStatusUpdate, OrderResponse, UPIPaymentVerifyRequest,
    RouteOptimizationResponse, CropRfqCreate, CropRfqResponse
)
from auth import (
    get_current_user, get_optional_current_user, verify_ownership,
    get_password_hash, verify_password, create_access_token
)
from ml_engine import price_engine, BASE_CROP_MANDI_RATES
from route_optimizer import optimize_logistics_batch

import logging
logger = logging.getLogger("kisansetu")

from sqlalchemy import text

# ---------------------------------------------------------------------------
# Sentry — server-side crash & performance reporting
# Set SENTRY_DSN in backend/.env (or Render env vars) to enable.
# sentry-sdk 2.x auto-detects FastAPI, SQLAlchemy, and logging integrations.
# Omitting the DSN is safe — init() is a no-op when dsn is empty.
# ---------------------------------------------------------------------------
import sentry_sdk

_sentry_dsn = os.getenv("SENTRY_DSN", "")
if _sentry_dsn:
    sentry_sdk.init(
        dsn=_sentry_dsn,
        environment=os.getenv("APP_ENV", "production"),
        # FastAPI, SQLAlchemy, and Logging integrations are auto-detected in 2.x
        # Capture 10% of transactions for performance profiling (free tier friendly)
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        send_default_pii=False,  # GDPR: do not attach user PII to events
    )
    logger.info("✅ Sentry initialised — crash reporting is active.")
else:
    logger.info("ℹ️  SENTRY_DSN not set — crash reporting disabled (local dev).")

# ---------------------------------------------------------------------------
# Rate Limiting — slowapi (in-process, per-IP)
# ---------------------------------------------------------------------------
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request as FastAPIRequest

limiter = Limiter(key_func=get_remote_address)

# Ensure database tables and upload directory exist
Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)

# Safe auto-migration for newly added columns
try:
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE crop_listings ADD COLUMN images TEXT"))
        except Exception:
            pass
        conn.commit()
except Exception:
    pass

# ----------------------------------------------------
# Cloudinary Initialization (runs once at startup)
# Set CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
# in your environment / Render dashboard to enable persistent cloud storage.
# Falls back to local disk when not configured (development mode).
# ----------------------------------------------------
_cloudinary_enabled = False
_cloudinary_url = os.getenv("CLOUDINARY_URL", "")
if _cloudinary_url:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(cloudinary_url=_cloudinary_url)   # parses URL automatically
        _cloudinary_enabled = True
        logger.info("✅ Cloudinary initialized — images will be stored in Cloudinary cloud.")
    except ImportError:
        logger.warning("⚠️  CLOUDINARY_URL is set but the 'cloudinary' package is not installed. "
                       "Run: pip install cloudinary>=1.38.0")
    except Exception as _e:
        logger.error(f"❌ Cloudinary initialization failed: {_e}")
else:
    logger.info("ℹ️  CLOUDINARY_URL not set — using local disk storage (uploads/ directory). "
                "Set CLOUDINARY_URL in environment for persistent cloud image storage.")

app = FastAPI(
    title="KisanSetu API — Direct Farmer-to-Consumer Agri-Marketplace",
    description="Backend API services for SIH26033: AI Fair-Price Prediction, Direct Farm Listings, Trust Score Verification, Escrow UPI Payments, and Agri-Logistics Route Optimization.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Attach slowapi limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.mount("/static/uploads", StaticFiles(directory="uploads"), name="uploads")

# ---------------------------------------------------------------------------
# CORS — Restrict allowed origins
# ---------------------------------------------------------------------------
# In production: set ALLOWED_ORIGINS in your Render environment variables.
# Multiple origins: comma-separated, e.g.
#   ALLOWED_ORIGINS=https://kisansetu.onrender.com,https://kisansetu.vercel.app
# In development: falls back to localhost ports automatically.
# ---------------------------------------------------------------------------
_dev_origins = [
    "http://localhost:3000",   # Vite / Express dev server
    "http://localhost:5173",   # Vite default fallback port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

_env_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
_prod_origins = [o.strip() for o in _env_origins_raw.split(",") if o.strip()]

# Merge: always include dev origins locally; prod origins added when env var is set
_allowed_origins = list(dict.fromkeys(_dev_origins + _prod_origins))  # deduplicated, order-preserved

logger.info(f"🌐 CORS allowed origins: {_allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# ---------------------------------------------------------------------------
# HTTP Security Headers Middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# ----------------------------------------------------
# 1. Health & Meta
# ----------------------------------------------------
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "KisanSetu Agri-Marketplace API",
        "version": "1.0.0",
        "image_storage": "cloudinary" if _cloudinary_enabled else "local_disk",
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------------------------------------------
# 2. Auth & Profiles (Role-based with JWT)
# ----------------------------------------------------
@app.post("/api/auth/register", response_model=UserResponse, tags=["Authentication"])
@limiter.limit("10/minute")  # Brute-force protection
def register_user(request: FastAPIRequest, payload: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account with secure password hashing and issues a JWT token."""
    existing = db.query(User).filter(User.phone == payload.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number is already registered.")

    role = payload.role.upper() if payload.role and payload.role.upper() in [r.value for r in UserRole] else UserRole.FARMER
    new_user = User(
        name=payload.name,
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        email=payload.email,
        role=role,
        fpo_name=payload.fpo_name,
        district=payload.district,
        state=payload.state,
        trust_score=4.8,
        verified=True,
        kyc_status="AADHAAR_KYC_VERIFIED" if role == UserRole.FARMER else "GST_ROC_VERIFIED"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "phone": new_user.phone, "role": new_user.role})
    resp = UserResponse.model_validate(new_user)
    resp.access_token = token
    return resp

@app.post("/api/auth/login", response_model=UserResponse, tags=["Authentication"])
@limiter.limit("10/minute")  # Brute-force protection
def login_or_register(request: FastAPIRequest, payload: LoginRequest, db: Session = Depends(get_db)):
    """Logs in an existing user or creates a demo user, verifies password if set/provided, and issues a JWT token."""
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        role = payload.role.upper() if payload.role and payload.role.upper() in [r.value for r in UserRole] else UserRole.FARMER
        user = User(
            name=f"Demo {role.capitalize()}",
            phone=payload.phone,
            hashed_password=get_password_hash(payload.password) if payload.password else None,
            role=role,
            district="Nashik",
            state="Maharashtra",
            trust_score=4.8,
            verified=True,
            kyc_status="AADHAAR_KYC_VERIFIED"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # If user has a password and password was provided, verify it
        if user.hashed_password and payload.password:
            if not verify_password(payload.password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid phone number or password.")

    token = create_access_token({"sub": str(user.id), "phone": user.phone, "role": user.role})
    resp = UserResponse.model_validate(user)
    resp.access_token = token
    return resp

@app.get("/api/auth/me", response_model=UserResponse, tags=["Authentication"])
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user from Bearer token."""
    return current_user

@app.get("/api/auth/users", response_model=List[UserResponse], tags=["Authentication"])
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    """List registered users filtered optionally by role."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.upper())
    return query.all()

# ----------------------------------------------------
# 3. Direct Farmer Listings & Image Uploads
# ----------------------------------------------------
@app.post("/api/upload", tags=["Marketplace"])
async def upload_images(files: List[UploadFile] = File(...)):
    """
    Upload listing photos (max 10 files, <=5MB each, JPEG/PNG/WEBP).
    Returns an array of publicly accessible image URLs.

    Storage strategy (automatic):
      - If CLOUDINARY_URL env var is set → uploads to Cloudinary (persistent, CDN-backed).
      - Otherwise → saves to local uploads/ directory (development only; ephemeral on cloud hosts).
    """
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 photos allowed per listing.")

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"}
    uploaded_urls = []

    for file in files:
        # --- Validate content type ---
        if file.content_type and file.content_type.lower() not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' is not a supported image type (JPEG, PNG, WEBP)."
            )

        content = await file.read()

        # --- Validate file size (5 MB hard cap) ---
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' exceeds maximum allowed size of 5 MB."
            )

        # --- Cloudinary upload (production) ---
        if _cloudinary_enabled:
            try:
                import cloudinary.uploader
                # Use original filename stem as public_id for nicer Cloudinary URLs
                stem = os.path.splitext(file.filename or uuid.uuid4().hex)[0]
                public_id = f"kisansetu_crops/{uuid.uuid4().hex}_{stem}"
                upload_res = cloudinary.uploader.upload(
                    content,
                    public_id=public_id,
                    overwrite=False,
                    resource_type="image",
                    quality="auto",       # Cloudinary auto-optimizes quality
                    fetch_format="auto"  # Serves WebP/AVIF to supporting browsers
                )
                secure_url = upload_res.get("secure_url", "")
                if secure_url:
                    uploaded_urls.append(secure_url)
                    logger.info(f"Cloudinary upload OK: {secure_url}")
                    continue
                else:
                    logger.error(f"Cloudinary returned no URL for '{file.filename}': {upload_res}")
                    raise HTTPException(status_code=502, detail="Cloudinary upload failed — no URL returned.")
            except HTTPException:
                raise
            except Exception as cloud_err:
                logger.error(f"Cloudinary upload error for '{file.filename}': {cloud_err}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Image upload to Cloudinary failed: {cloud_err}. "
                           f"Check CLOUDINARY_URL and that the 'cloudinary' package is installed."
                )

        # --- Local disk fallback (development only) ---
        ext = os.path.splitext(file.filename or "")[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as disk_file:
            disk_file.write(content)
        local_url = f"/static/uploads/{filename}"
        uploaded_urls.append(local_url)
        logger.debug(f"Local upload saved: {filepath}")

    return {
        "urls": uploaded_urls,
        "storage": "cloudinary" if _cloudinary_enabled else "local"
    }


@app.get("/api/listings", response_model=List[CropListingResponse], tags=["Marketplace"])
def get_listings(
    crop: Optional[str] = Query(None, description="Filter by crop name (e.g. Onion, Wheat)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    grade: Optional[str] = Query(None, description="Filter by Quality Grade"),
    organic_only: Optional[bool] = Query(False, description="Certified organic produce"),
    max_price: Optional[float] = Query(None, description="Maximum price per quintal"),
    db: Session = Depends(get_db)
):
    """Browse and filter active direct-from-farm crop listings."""
    query = db.query(CropListing).filter(CropListing.status == ListingStatus.ACTIVE)
    
    if crop:
        query = query.filter(CropListing.crop_name.ilike(f"%{crop}%"))
    if district:
        query = query.filter(CropListing.district.ilike(f"%{district}%"))
    if grade:
        query = query.filter(CropListing.quality_grade == grade)
    if organic_only:
        query = query.filter(CropListing.is_organic == True)
    if max_price:
        query = query.filter(CropListing.expected_price_per_quintal <= max_price)

    listings = query.order_by(CropListing.created_at.desc()).all()

    # Populate farmer details & parse images JSON in response
    results = []
    for l in listings:
        resp = CropListingResponse.model_validate(l)
        if l.images:
            try:
                resp.images = json.loads(l.images)
            except Exception:
                resp.images = [l.image_url] if l.image_url else []
        elif l.image_url:
            resp.images = [l.image_url]
        else:
            resp.images = []

        if l.farmer:
            resp.farmer_name = l.farmer.name
            resp.farmer_trust_score = l.farmer.trust_score
            resp.farmer_verified = l.farmer.verified
        results.append(resp)
    return results


@app.post("/api/listings", response_model=CropListingResponse, tags=["Marketplace"])
def create_crop_listing(
    payload: CropListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Farmers or FPOs create a new direct crop listing with automated AI price benchmarks. Requires authentication."""
    if current_user.role not in [UserRole.FARMER, UserRole.LOGISTICS]:
        raise HTTPException(status_code=403, detail="Only registered farmers and FPOs can publish produce listings.")

    farmer_id = current_user.id
    farmer = current_user

    # Call AI Price Engine to calculate fair price benchmarks
    ai_guidance = price_engine.predict_fair_price(
        crop_name=payload.crop_name,
        quantity_quintals=payload.quantity_quintals,
        quality_grade=payload.quality_grade,
        district=payload.district,
        state=payload.state,
        is_organic=payload.is_organic
    )

    images_list = payload.images or ([payload.image_url] if payload.image_url else [])
    primary_image = images_list[0] if len(images_list) > 0 else payload.image_url

    new_listing = CropListing(
        farmer_id=farmer_id,
        crop_name=payload.crop_name,
        variety=payload.variety,
        quantity_quintals=payload.quantity_quintals,
        quality_grade=payload.quality_grade,
        harvest_date=payload.harvest_date,
        district=payload.district,
        state=payload.state,
        pincode=payload.pincode,
        lat=payload.lat,
        lng=payload.lng,
        is_organic=payload.is_organic,
        expected_price_per_quintal=payload.expected_price_per_quintal,
        mandi_benchmark_price=ai_guidance["mandi_benchmark_price"],
        ai_recommended_min=ai_guidance["min_fair_price"],
        ai_recommended_max=ai_guidance["max_fair_price"],
        ai_recommended_target=ai_guidance["recommended_target_price"],
        status=ListingStatus.ACTIVE,
        notes=payload.notes,
        image_url=primary_image,
        images=json.dumps(images_list)
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    resp = CropListingResponse.model_validate(new_listing)
    resp.images = images_list
    resp.farmer_name = farmer.name
    resp.farmer_trust_score = farmer.trust_score
    resp.farmer_verified = farmer.verified
    return resp


@app.put("/api/listings/{listing_id}", response_model=CropListingResponse, tags=["Marketplace"])
def update_crop_listing(
    listing_id: int,
    payload: CropListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Farmers update an existing crop listing. Enforces owner verification."""
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found.")

    verify_ownership(listing.farmer_id, current_user, "crop listing")

    update_data = payload.model_dump(exclude_unset=True)

    if "images" in update_data and update_data["images"] is not None:
        images_list = update_data["images"]
        listing.images = json.dumps(images_list)
        if len(images_list) > 0:
            listing.image_url = images_list[0]
        elif "image_url" not in update_data:
            listing.image_url = None
        del update_data["images"]

    # Re-calculate AI fair price if core fields changed
    if any(k in update_data for k in ["crop_name", "quantity_quintals", "quality_grade", "district", "state", "is_organic"]):
        ai_guidance = price_engine.predict_fair_price(
            crop_name=update_data.get("crop_name", listing.crop_name),
            quantity_quintals=update_data.get("quantity_quintals", listing.quantity_quintals),
            quality_grade=update_data.get("quality_grade", listing.quality_grade),
            district=update_data.get("district", listing.district),
            state=update_data.get("state", listing.state),
            is_organic=update_data.get("is_organic", listing.is_organic)
        )
        listing.mandi_benchmark_price = ai_guidance["mandi_benchmark_price"]
        listing.ai_recommended_min = ai_guidance["min_fair_price"]
        listing.ai_recommended_max = ai_guidance["max_fair_price"]
        listing.ai_recommended_target = ai_guidance["recommended_target_price"]

    for field, val in update_data.items():
        setattr(listing, field, val)

    db.commit()
    db.refresh(listing)

    resp = CropListingResponse.model_validate(listing)
    if listing.images:
        try:
            resp.images = json.loads(listing.images)
        except Exception:
            resp.images = [listing.image_url] if listing.image_url else []
    elif listing.image_url:
        resp.images = [listing.image_url]
    else:
        resp.images = []

    if listing.farmer:
        resp.farmer_name = listing.farmer.name
        resp.farmer_trust_score = listing.farmer.trust_score
        resp.farmer_verified = listing.farmer.verified
    return resp


@app.delete("/api/listings/{listing_id}", tags=["Marketplace"])
def delete_crop_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a crop listing by ID. Enforces owner verification and prevents FK cascade conflicts."""
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found.")

    verify_ownership(listing.farmer_id, current_user, "crop listing")

    # Check if there are existing orders for this listing
    existing_orders = db.query(Order).filter(Order.listing_id == listing_id).count()
    if existing_orders > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete produce listing with existing customer orders. Set listing status to EXPIRED or SOLD instead."
        )

    db.delete(listing)
    db.commit()
    return {"message": "Crop listing deleted successfully.", "id": listing_id}

# ----------------------------------------------------
# 4. AI-Based Fair Price Recommendation Engine
# ----------------------------------------------------
@app.post("/api/pricing/recommend", response_model=PricePredictionResponse, tags=["AI Price Engine"])
@limiter.limit("30/minute")  # DoS protection on the public ML endpoint
def predict_fair_price(request: FastAPIRequest, payload: PricePredictionRequest):
    """
    Predicts a fair price range [Min Price - Max Price] using crop type, quantity,
    quality grade, location, and seasonality inputs.
    """
    result = price_engine.predict_fair_price(
        crop_name=payload.crop_name,
        quantity_quintals=payload.quantity_quintals,
        quality_grade=payload.quality_grade,
        district=payload.district,
        state=payload.state,
        month=payload.month or datetime.utcnow().month,
        is_organic=payload.is_organic
    )
    return result

@app.get("/api/pricing/mandi-compare/{crop_name}", tags=["AI Price Engine"])
@limiter.limit("30/minute")  # DoS protection
def compare_mandi_and_fair_price(request: FastAPIRequest, crop_name: str):
    """
    Side-by-side comparison: Mandi Price vs. AI Recommended Price vs. Buyer Offers vs. Retail.
    """
    ai_guidance = price_engine.predict_fair_price(
        crop_name=crop_name,
        quantity_quintals=50.0,
        quality_grade="Grade A",
        district="Nashik",
        state="Maharashtra"
    )

    mandi_rate = ai_guidance["mandi_benchmark_price"]
    fair_target = ai_guidance["recommended_target_price"]
    retail_rate = ai_guidance["retail_estimated_price"]

    # Typical buyer offer on platform sits between Mandi and Retail, giving win-win
    avg_buyer_offer = round((fair_target * 0.98), -1)

    farmer_uplift_pct = round(((fair_target - mandi_rate) / mandi_rate) * 100, 1)
    buyer_savings_pct = round(((retail_rate - fair_target) / retail_rate) * 100, 1)

    return {
        "crop_name": crop_name,
        "mandi_modal_price": mandi_rate,
        "ai_fair_price_min": ai_guidance["min_fair_price"],
        "ai_fair_price_target": fair_target,
        "ai_fair_price_max": ai_guidance["max_fair_price"],
        "platform_buyer_offers_avg": avg_buyer_offer,
        "retail_consumer_price": retail_rate,
        "farmer_price_uplift_pct": farmer_uplift_pct,
        "consumer_savings_pct": buyer_savings_pct,
        "intermediary_margin_saved": round(retail_rate - fair_target, 1)
    }

# ----------------------------------------------------
# 5. Orders & Verification Lifecycle
# ----------------------------------------------------
@app.get("/api/orders", response_model=List[OrderResponse], tags=["Orders"])
def get_orders(user_id: Optional[int] = None, role: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch orders for buyer, farmer, or logistics."""
    query = db.query(Order)
    if user_id and role:
        if role.upper() == UserRole.FARMER:
            query = query.filter(Order.farmer_id == user_id)
        elif role.upper() == UserRole.BUYER:
            query = query.filter(Order.buyer_id == user_id)
    orders = query.order_by(Order.created_at.desc()).all()

    results = []
    for o in orders:
        resp = OrderResponse.model_validate(o)
        if o.listing:
            resp.crop_name = f"{o.listing.crop_name} ({o.listing.variety})"
        buyer = db.query(User).filter(User.id == o.buyer_id).first()
        farmer = db.query(User).filter(User.id == o.farmer_id).first()
        resp.buyer_name = buyer.name if buyer else "Buyer"
        resp.farmer_name = farmer.name if farmer else "Farmer"
        results.append(resp)
    return results

@app.post("/api/orders", response_model=OrderResponse, tags=["Orders"])
def place_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place a direct purchase order for listed produce. Requires authenticated buyer."""
    listing = db.query(CropListing).with_for_update().filter(
        CropListing.id == payload.listing_id,
        CropListing.status == ListingStatus.ACTIVE
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or no longer active")
    if current_user.id == listing.farmer_id:
        raise HTTPException(status_code=400, detail="Farmers cannot purchase their own produce.")
    if payload.quantity_ordered > listing.quantity_quintals:
        raise HTTPException(status_code=400, detail="Ordered quantity exceeds available stock")

    # Deduct purchased quantity and mark SOLD if stock reaches zero
    listing.quantity_quintals = round(listing.quantity_quintals - payload.quantity_ordered, 2)
    if listing.quantity_quintals <= 0:
        listing.status = ListingStatus.SOLD

    produce_amount = payload.quantity_ordered * listing.expected_price_per_quintal
    logistics_fee = round(payload.quantity_ordered * 45.0 + 500.0, 0)
    total_amount = produce_amount + logistics_fee

    order_count = db.query(Order).count() + 1
    order_num = f"ORD-2026-{1000 + order_count}"

    new_order = Order(
        order_number=order_num,
        listing_id=payload.listing_id,
        buyer_id=current_user.id,
        farmer_id=listing.farmer_id,
        quantity_ordered=payload.quantity_ordered,
        price_per_quintal=listing.expected_price_per_quintal,
        total_produce_amount=produce_amount,
        logistics_fee=logistics_fee,
        platform_fee=0.0,
        total_amount=total_amount,
        status=OrderStatus.PLACED,
        payment_status=PaymentStatus.PENDING,
        delivery_address=payload.delivery_address,
        delivery_pincode=payload.delivery_pincode,
        delivery_lat=payload.delivery_lat,
        delivery_lng=payload.delivery_lng,
        delivery_otp=str(1000 + (order_count * 37) % 9000)
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    resp = OrderResponse.model_validate(new_order)
    resp.crop_name = f"{listing.crop_name} ({listing.variety})"
    resp.buyer_name = current_user.name
    farmer = db.query(User).filter(User.id == listing.farmer_id).first()
    resp.farmer_name = farmer.name if farmer else "Farmer"
    return resp

@app.patch("/api/orders/{order_id}/status", response_model=OrderResponse, tags=["Orders"])
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Progresses the order lifecycle (CONFIRMED -> IN_TRANSIT -> DELIVERED -> COMPLETED). Verifies party ownership."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only the buyer, farmer, or logistics partner can change order status
    if current_user.id not in [order.buyer_id, order.farmer_id] and current_user.role != UserRole.LOGISTICS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not a recognized party to this order."
        )

    # If marking DELIVERED, verify OTP
    if payload.status == OrderStatus.DELIVERED and payload.otp:
        if payload.otp != order.delivery_otp:
            raise HTTPException(status_code=400, detail="Invalid Delivery OTP. Please verify with buyer.")
        order.payment_status = PaymentStatus.RELEASED_TO_FARMER

    order.status = payload.status
    db.commit()
    db.refresh(order)

    resp = OrderResponse.model_validate(order)
    if order.listing:
        resp.crop_name = f"{order.listing.crop_name} ({order.listing.variety})"
    return resp

@app.post("/api/payments/upi-verify", tags=["Payments"])
def verify_upi_payment(payload: UPIPaymentVerifyRequest, db: Session = Depends(get_db)):
    """Simulated UPI / Razorpay payment gateway verification with escrow holding."""
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = PaymentStatus.ESCROW_HELD
    order.payment_ref = f"UPI/{payload.utr_number}"
    order.status = OrderStatus.CONFIRMED
    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "order_id": order.id,
        "payment_status": "ESCROW_HELD",
        "escrow_message": f"₹{payload.amount:,.2f} secured in KisanSetu Trust Escrow. Funds will be released to farmer upon buyer OTP verification.",
        "utr_number": payload.utr_number,
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------------------------------------------
# 5.1. Requests for Quotation (RFQs)
# ----------------------------------------------------
@app.post("/api/rfqs", response_model=CropRfqResponse, tags=["RFQs"])
def submit_rfq(payload: CropRfqCreate, db: Session = Depends(get_db)):
    """Buyers submit a Request for Quotation (RFQ) for bulk produce procurement."""
    listing_id = payload.listing_id or payload.model_dump().get("listingId")
    buyer_id = payload.buyer_id or payload.model_dump().get("buyerId")
    farmer_id = payload.farmer_id or payload.model_dump().get("farmerId")

    listing = db.query(CropListing).filter(CropListing.id == listing_id).first() if listing_id else None
    buyer = db.query(User).filter(User.id == buyer_id).first() if buyer_id else None
    farmer = db.query(User).filter(User.id == farmer_id).first() if farmer_id else None

    crop_name = payload.crop_name or (listing.crop_name if listing else "Produce")
    variety = payload.variety or (listing.variety if listing else "Standard")
    farmer_name = payload.farmer_name or (farmer.name if farmer else "Farmer")
    fpo_name = payload.fpo_name or (farmer.fpo_name if farmer else None)
    buyer_name = payload.buyer_name or (buyer.name if buyer else "Buyer")
    buyer_company = payload.buyer_company or (buyer.fpo_name if buyer else "Wholesale Buyer")
    buyer_phone = payload.buyer_phone or (buyer.phone if buyer else "")

    rfq_count = db.query(CropRfq).count() + 1
    rfq_id = f"RFQ-2026-{1000 + rfq_count}"

    new_rfq = CropRfq(
        id=rfq_id,
        listing_id=listing_id or (listing.id if listing else 1),
        buyer_id=buyer_id or (buyer.id if buyer else 4),
        farmer_id=farmer_id or (farmer.id if farmer else 1),
        crop_name=crop_name,
        variety=variety,
        farmer_name=farmer_name,
        fpo_name=fpo_name,
        buyer_name=buyer_name,
        buyer_company=buyer_company,
        buyer_phone=buyer_phone,
        required_quantity_quintals=payload.required_quantity_quintals or 20.0,
        expected_price_per_quintal=payload.expected_price_per_quintal or 2000.0,
        delivery_location=payload.delivery_location or "Warehouse",
        delivery_pincode=payload.delivery_pincode or "400703",
        delivery_timeline=payload.delivery_timeline or "Immediate (Within 48h)",
        message=payload.message,
        status="SUBMITTED"
    )

    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)

    resp = CropRfqResponse.model_validate(new_rfq)
    resp.listingId = new_rfq.listing_id
    resp.buyerId = new_rfq.buyer_id
    resp.farmerId = new_rfq.farmer_id
    resp.cropName = new_rfq.crop_name
    resp.farmerName = new_rfq.farmer_name
    resp.buyerName = new_rfq.buyer_name
    resp.buyerCompany = new_rfq.buyer_company
    resp.buyerPhone = new_rfq.buyer_phone
    resp.requiredQuantityQuintals = new_rfq.required_quantity_quintals
    resp.expectedPricePerQuintal = new_rfq.expected_price_per_quintal
    resp.deliveryLocation = new_rfq.delivery_location
    resp.deliveryPincode = new_rfq.delivery_pincode
    resp.deliveryTimeline = new_rfq.delivery_timeline
    resp.createdAt = new_rfq.created_at.isoformat()
    return resp

@app.get("/api/rfqs", response_model=List[CropRfqResponse], tags=["RFQs"])
def get_rfqs(
    buyer_id: Optional[int] = Query(None, alias="buyerId"),
    farmer_id: Optional[int] = Query(None, alias="farmerId"),
    listing_id: Optional[int] = Query(None, alias="listingId"),
    db: Session = Depends(get_db)
):
    """Retrieve submitted RFQs filtered optionally by buyerId, farmerId, or listingId."""
    query = db.query(CropRfq)
    if buyer_id:
        query = query.filter(CropRfq.buyer_id == buyer_id)
    if farmer_id:
        query = query.filter(CropRfq.farmer_id == farmer_id)
    if listing_id:
        query = query.filter(CropRfq.listing_id == listing_id)

    rfqs = query.order_by(CropRfq.created_at.desc()).all()
    results = []
    for r in rfqs:
        resp = CropRfqResponse.model_validate(r)
        resp.listingId = r.listing_id
        resp.buyerId = r.buyer_id
        resp.farmerId = r.farmer_id
        resp.cropName = r.crop_name
        resp.farmerName = r.farmer_name
        resp.buyerName = r.buyer_name
        resp.buyerCompany = r.buyer_company
        resp.buyerPhone = r.buyer_phone
        resp.requiredQuantityQuintals = r.required_quantity_quintals
        resp.expectedPricePerQuintal = r.expected_price_per_quintal
        resp.deliveryLocation = r.delivery_location
        resp.deliveryPincode = r.delivery_pincode
        resp.deliveryTimeline = r.delivery_timeline
        resp.createdAt = r.created_at.isoformat()
        results.append(resp)
    return results

# ----------------------------------------------------
# 6. Route Optimization Demo
# ----------------------------------------------------
@app.get("/api/logistics/routes", response_model=RouteOptimizationResponse, tags=["Logistics"])
def get_optimized_route():
    """Returns distance-based batched pickup/delivery route demonstration."""
    return optimize_logistics_batch()

# ----------------------------------------------------
# 7. Analytics & Impact Summary (Govt / Public)
# ----------------------------------------------------
@app.get("/api/analytics/summary", tags=["Analytics"])
def get_market_analytics(db: Session = Depends(get_db)):
    """Aggregated metrics showing farmer price realization and intermediary disintermediation."""
    total_listings = db.query(CropListing).count()
    total_orders = db.query(Order).count()
    total_volume_qtl = db.query(Order).count() * 40.0 + 85.0

    return {
        "farmer_realization_rate": "61.8%",
        "baseline_mandi_realization": "32.4%",
        "consumer_price_savings": "19.5%",
        "middlemen_layers_eliminated": "4 of 5 layers bypassed",
        "logistics_distance_saved_pct": "33.5%",
        "active_crop_listings": max(total_listings, 12),
        "verified_farmers_count": 48,
        "verified_buyers_count": 29,
        "total_traded_volume_quintals": round(total_volume_qtl, 1),
        "total_turnover_inr": round(total_volume_qtl * 2600.0, 0)
    }

# ----------------------------------------------------
# 8. Seed Reset (Development Only) — Gap 2
# ----------------------------------------------------
@app.post("/api/seed/reset", tags=["Admin / Seed"])
def reset_seed_data():
    """Reset database to initial baseline seed data. Strictly disabled in production."""
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).lower()
    if env in ["production", "prod"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Database reset is strictly disabled in production environments."
        )
    try:
        from seed_data import reset_db_and_seed
        reset_db_and_seed()
        return {"message": "Database successfully reset to seed data"}
    except Exception as e:
        logger.error(f"Failed to reset seed data: {e}")
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

# ----------------------------------------------------
# 9. Dynamic Notifications Feed — Gap 10
# ----------------------------------------------------
@app.get("/api/notifications", tags=["Notifications"])
def get_notifications(
    user_id: Optional[int] = Query(None, alias="userId"),
    role: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve dynamic contextual notifications based on real orders, listings, and market alerts."""
    effective_user = current_user
    if not effective_user and user_id:
        effective_user = db.query(User).filter(User.id == user_id).first()

    effective_role = role or (effective_user.role.value if effective_user and hasattr(effective_user.role, 'value') else "FARMER")

    notifications = []
    
    # 1. Real Order-based notifications
    if effective_user:
        if effective_role == "FARMER":
            farmer_orders = db.query(Order).filter(Order.farmer_id == effective_user.id).order_by(Order.id.desc()).limit(3).all()
            for o in farmer_orders:
                if o.status == OrderStatus.IN_TRANSIT:
                    notifications.append({
                        "id": f"ord-{o.id}",
                        "title": f"Order #{o.order_number} In Transit",
                        "message": f"{o.quantity_ordered} Qtl produce is in transit. Delivery OTP will verify receipt.",
                        "time": "Active",
                        "unread": True,
                        "targetTab": "inventory",
                        "type": "order"
                    })
                if o.payment_status == PaymentStatus.ESCROW_HELD:
                    notifications.append({
                        "id": f"escrow-{o.id}",
                        "title": "Escrow Payment Secured",
                        "message": f"₹{o.total_produce_amount:,.0f} held in dual-custody escrow for Order #{o.order_number}.",
                        "time": "Secured",
                        "unread": True,
                        "targetTab": "payouts",
                        "type": "escrow"
                    })
        elif effective_role == "BUYER":
            buyer_orders = db.query(Order).filter(Order.buyer_id == effective_user.id).order_by(Order.id.desc()).limit(3).all()
            for o in buyer_orders:
                notifications.append({
                    "id": f"ord-buyer-{o.id}",
                    "title": f"Order #{o.order_number} Update",
                    "message": f"Status: {o.status.value}. Delivery PIN: {o.delivery_pincode}. OTP: {o.delivery_otp}",
                    "time": "Active",
                    "unread": True,
                    "targetTab": "contracts",
                    "type": "order"
                })

    # 2. RFQ notifications
    recent_rfqs = db.query(CropRfq).order_by(CropRfq.id.desc()).limit(2).all()
    for r in recent_rfqs:
        notifications.append({
            "id": f"rfq-{r.id}",
            "title": f"Procurement Demand: {r.crop_name}",
            "message": f"{r.buyer_name} requested {r.required_quantity_quintals} Qtl at target ₹{r.expected_price_per_quintal}/Qtl.",
            "time": "15m ago",
            "unread": False,
            "targetTab": "buyer_requests" if effective_role == "FARMER" else "bulk_orders",
            "type": "rfq"
        })

    # 3. Market / Mandi trend alert
    notifications.append({
        "id": "mandi-daily-trend",
        "title": "Mandi Rate Insight",
        "message": "Nashik & Lasalgaon onion modal price up +8.4%. Direct buyers offering ₹2,450/Qtl.",
        "time": "Today",
        "unread": False,
        "targetTab": "pricing",
        "type": "mandi"
    })

    return notifications

