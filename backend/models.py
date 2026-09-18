import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    LOGISTICS = "LOGISTICS"
    GOVT_OFFICIAL = "GOVT_OFFICIAL"

class QualityGrade(str, enum.Enum):
    GRADE_A = "Grade A"  # Export / Premium
    GRADE_B = "Grade B"  # Commercial / Standard
    GRADE_C = "Grade C"  # Processing / Fair

class ListingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SOLD = "SOLD"
    IN_NEGOTIATION = "IN_NEGOTIATION"
    EXPIRED = "EXPIRED"

class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    BATCH_ASSIGNED = "BATCH_ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    ESCROW_HELD = "ESCROW_HELD"
    RELEASED_TO_FARMER = "RELEASED_TO_FARMER"
    REFUNDED = "REFUNDED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    role = Column(String(30), default=UserRole.FARMER)
    fpo_name = Column(String(150), nullable=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    trust_score = Column(Float, default=4.8)
    verified = Column(Boolean, default=True)
    kyc_status = Column(String(50), default="KYC_VERIFIED")
    total_trades = Column(Integer, default=12)
    rating_count = Column(Integer, default=10)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("CropListing", back_populates="farmer")

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String(100), nullable=False, index=True)
    variety = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    quality_grade = Column(String(20), default=QualityGrade.GRADE_A)
    harvest_date = Column(String(50), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    is_organic = Column(Boolean, default=False)
    expected_price_per_quintal = Column(Float, nullable=False)
    mandi_benchmark_price = Column(Float, nullable=False)
    ai_recommended_min = Column(Float, nullable=False)
    ai_recommended_max = Column(Float, nullable=False)
    ai_recommended_target = Column(Float, nullable=False)
    status = Column(String(20), default=ListingStatus.ACTIVE)
    notes = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    images = Column(Text, nullable=True)  # JSON-encoded array of image URLs
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="listings")
    orders = relationship("Order", back_populates="listing")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity_ordered = Column(Float, nullable=False)
    price_per_quintal = Column(Float, nullable=False)
    total_produce_amount = Column(Float, nullable=False)
    logistics_fee = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), default=OrderStatus.PLACED)
    payment_status = Column(String(30), default=PaymentStatus.PENDING)
    payment_ref = Column(String(100), nullable=True)
    delivery_address = Column(Text, nullable=False)
    delivery_pincode = Column(String(20), nullable=False)
    delivery_lat = Column(Float, nullable=True)
    delivery_lng = Column(Float, nullable=True)
    delivery_otp = Column(String(10), default="4829")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listing = relationship("CropListing", back_populates="orders")

class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    market_name = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    arrival_date = Column(String(50), nullable=False)

class LogisticsBatch(Base):
    __tablename__ = "logistics_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, index=True, nullable=False)
    driver_name = Column(String(100), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    total_distance_km = Column(Float, nullable=False)
    naive_distance_km = Column(Float, nullable=False)
    distance_saved_pct = Column(Float, nullable=False)
    transit_time_saved_hrs = Column(Float, nullable=False)
    status = Column(String(30), default="SCHEDULED")
    route_data_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CropRfq(Base):
    __tablename__ = "crop_rfqs"

    id = Column(String(50), primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=False)
    farmer_name = Column(String(100), nullable=True)
    fpo_name = Column(String(150), nullable=True)
    buyer_name = Column(String(100), nullable=True)
    buyer_company = Column(String(150), nullable=True)
    buyer_phone = Column(String(30), nullable=True)
    required_quantity_quintals = Column(Float, nullable=False)
    expected_price_per_quintal = Column(Float, nullable=False)
    delivery_location = Column(String(255), nullable=False)
    delivery_pincode = Column(String(20), nullable=False)
    delivery_timeline = Column(String(100), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(30), default="SUBMITTED")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("CropListing")
    buyer = relationship("User", foreign_keys=[buyer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
