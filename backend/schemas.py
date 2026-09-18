import json
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    role: str
    fpo_name: Optional[str] = None
    district: str
    state: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    phone: str
    password: str
    role: Optional[str] = "FARMER"
    district: str
    state: str
    fpo_name: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    trust_score: float
    verified: bool
    kyc_status: str
    total_trades: int
    rating_count: int
    created_at: datetime
    access_token: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    phone: str
    password: Optional[str] = None
    role: Optional[str] = "FARMER"

# --- Crop Listing Schemas ---
class CropListingCreate(BaseModel):
    farmer_id: Optional[int] = None
    crop_name: str
    variety: str
    quantity_quintals: float
    quality_grade: str = "Grade A"
    harvest_date: str
    district: str
    state: str
    pincode: str
    lat: float
    lng: float
    is_organic: bool = False
    expected_price_per_quintal: float
    notes: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)

class CropListingUpdate(BaseModel):
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    quantity_quintals: Optional[float] = None
    quality_grade: Optional[str] = None
    harvest_date: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_organic: Optional[bool] = None
    expected_price_per_quintal: Optional[float] = None
    notes: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class CropListingResponse(CropListingCreate):
    id: int
    mandi_benchmark_price: float
    ai_recommended_min: float
    ai_recommended_max: float
    ai_recommended_target: float
    status: str
    created_at: datetime
    images: Optional[List[str]] = Field(default_factory=list)
    farmer_name: Optional[str] = None
    farmer_trust_score: Optional[float] = None
    farmer_verified: Optional[bool] = None

    @field_validator("images", mode="before")
    @classmethod
    def parse_images_field(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
                return [v] if v else []
            except Exception:
                return [v] if v else []
        return v or []

    class Config:
        from_attributes = True

# --- AI Fair Price Engine Schemas ---
class PricePredictionRequest(BaseModel):
    crop_name: str
    variety: Optional[str] = "Standard"
    quantity_quintals: float
    quality_grade: str = "Grade A"
    district: str
    state: str
    month: Optional[int] = None
    is_organic: bool = False

class PriceFactorDetail(BaseModel):
    factor_name: str
    impact_pct: float
    explanation: str

class PricePredictionResponse(BaseModel):
    crop_name: str
    quality_grade: str
    quantity_quintals: float
    min_fair_price: float
    max_fair_price: float
    recommended_target_price: float
    mandi_benchmark_price: float
    retail_estimated_price: float
    confidence_score: float
    factors: List[PriceFactorDetail]
    methodology: str

# --- Order & Payment Schemas ---
class OrderCreate(BaseModel):
    listing_id: int
    buyer_id: int
    quantity_ordered: float
    delivery_address: str
    delivery_pincode: str
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None

class OrderStatusUpdate(BaseModel):
    status: str
    otp: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    listing_id: int
    buyer_id: int
    farmer_id: int
    crop_name: Optional[str] = None
    quantity_ordered: float
    price_per_quintal: float
    total_produce_amount: float
    logistics_fee: float
    platform_fee: float
    total_amount: float
    status: str
    payment_status: str
    payment_ref: Optional[str] = None
    delivery_address: str
    delivery_pincode: str
    delivery_otp: str
    created_at: datetime
    buyer_name: Optional[str] = None
    farmer_name: Optional[str] = None

    class Config:
        from_attributes = True

class UPIPaymentVerifyRequest(BaseModel):
    order_id: int
    upi_id: str
    amount: float
    utr_number: str

# --- Logistics & Route Optimization Schemas ---
class RouteStop(BaseModel):
    stop_id: str
    type: str  # "PICKUP" or "DELIVERY"
    name: str
    location_name: str
    lat: float
    lng: float
    quantity_quintals: float
    crop_name: str
    contact_phone: str
    status: str = "PENDING"

class RouteOptimizationResponse(BaseModel):
    batch_id: str
    driver_name: str
    vehicle_number: str
    stops: List[RouteStop]
    total_distance_km: float
    naive_distance_km: float
    distance_saved_km: float
    distance_saved_pct: float
    transit_time_hrs: float
    time_saved_hrs: float
    co2_saved_kg: float
    spoilage_reduction_pct: float
    optimization_algorithm: str

# --- Crop RFQ Schemas ---
class CropRfqCreate(BaseModel):
    listing_id: Optional[int] = Field(None, alias="listingId")
    buyer_id: Optional[int] = Field(None, alias="buyerId")
    farmer_id: Optional[int] = Field(None, alias="farmerId")
    crop_name: Optional[str] = Field(None, alias="cropName")
    variety: Optional[str] = "Standard"
    farmer_name: Optional[str] = Field(None, alias="farmerName")
    fpo_name: Optional[str] = Field(None, alias="fpoName")
    buyer_name: Optional[str] = Field(None, alias="buyerName")
    buyer_company: Optional[str] = Field(None, alias="buyerCompany")
    buyer_phone: Optional[str] = Field(None, alias="buyerPhone")
    required_quantity_quintals: Optional[float] = Field(None, alias="requiredQuantityQuintals")
    expected_price_per_quintal: Optional[float] = Field(None, alias="expectedPricePerQuintal")
    delivery_location: Optional[str] = Field(None, alias="deliveryLocation")
    delivery_pincode: Optional[str] = Field(None, alias="deliveryPincode")
    delivery_timeline: Optional[str] = Field("Immediate (Within 48h)", alias="deliveryTimeline")
    message: Optional[str] = None

    class Config:
        populate_by_name = True

class CropRfqResponse(BaseModel):
    id: str
    listing_id: int
    buyer_id: int
    farmer_id: int
    crop_name: str
    variety: str
    farmer_name: Optional[str] = None
    fpo_name: Optional[str] = None
    buyer_name: Optional[str] = None
    buyer_company: Optional[str] = None
    buyer_phone: Optional[str] = None
    required_quantity_quintals: float
    expected_price_per_quintal: float
    delivery_location: str
    delivery_pincode: str
    delivery_timeline: str
    message: Optional[str] = None
    status: str
    created_at: datetime

    # CamelCase mirrors for frontend convenience
    listingId: Optional[int] = None
    buyerId: Optional[int] = None
    farmerId: Optional[int] = None
    cropName: Optional[str] = None
    farmerName: Optional[str] = None
    buyerName: Optional[str] = None
    buyerCompany: Optional[str] = None
    buyerPhone: Optional[str] = None
    requiredQuantityQuintals: Optional[float] = None
    expectedPricePerQuintal: Optional[float] = None
    deliveryLocation: Optional[str] = None
    deliveryPincode: Optional[str] = None
    deliveryTimeline: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
