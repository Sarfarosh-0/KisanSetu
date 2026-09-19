"""
Seed script to initialize sample data for KisanSetu Agri-Marketplace.
Run: python seed_data.py
"""

from database import engine, SessionLocal, Base
from models import User, CropListing, Order, MandiPrice, LogisticsBatch, UserRole, QualityGrade, ListingStatus, OrderStatus, PaymentStatus
from auth import get_password_hash
import json

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding database with realistic agricultural marketplace records...")
    default_pwd_hash = get_password_hash("kisan123")

    # 1. Users
    u1 = User(
        id=1,
        name="Ramesh Kumar Patel",
        phone="+91 98220 11223",
        email="ramesh.patel@kisanmail.in",
        hashed_password=default_pwd_hash,
        role=UserRole.FARMER,
        fpo_name="Sahyadri Krishi Vikas Producer Co.",
        district="Nashik",
        state="Maharashtra",
        lat=20.1746,
        lng=73.9875,
        trust_score=4.9,
        verified=True,
        kyc_status="AADHAAR_KYC_VERIFIED",
        total_trades=38,
        rating_count=35
    )

    u2 = User(
        id=2,
        name="Sardar Gurpreet Singh",
        phone="+91 98140 22334",
        email="gurpreet.singh@punjabkisan.in",
        hashed_password=default_pwd_hash,
        role=UserRole.FARMER,
        fpo_name="Malwa Agro Farmer Producer Org",
        district="Ludhiana",
        state="Punjab",
        lat=30.9010,
        lng=75.8573,
        trust_score=4.8,
        verified=True,
        kyc_status="AADHAAR_KYC_VERIFIED",
        total_trades=52,
        rating_count=48
    )

    u3 = User(
        id=3,
        name="Venkat Ramanayya",
        phone="+91 94401 55667",
        email="venkat.spices@andhrakisan.in",
        hashed_password=default_pwd_hash,
        role=UserRole.FARMER,
        fpo_name="Guntur Chilli Growers Federation",
        district="Guntur",
        state="Andhra Pradesh",
        lat=16.3067,
        lng=80.4365,
        trust_score=4.9,
        verified=True,
        kyc_status="AADHAAR_KYC_VERIFIED",
        total_trades=27,
        rating_count=24
    )

    u4 = User(
        id=4,
        name="Priya Sharma (GreenBite Organics)",
        phone="+91 98200 44556",
        email="procurement@greenbite.co.in",
        hashed_password=default_pwd_hash,
        role=UserRole.BUYER,
        fpo_name="GreenBite Retails Ltd",
        district="Mumbai",
        state="Maharashtra",
        lat=19.0760,
        lng=72.8777,
        trust_score=4.9,
        verified=True,
        kyc_status="GST_VERIFIED_BUSINESS",
        total_trades=84,
        rating_count=79
    )

    u5 = User(
        id=5,
        name="Santosh Rao (KisanExpress)",
        phone="+91 98231 99881",
        email="dispatch@kisanexpress.in",
        hashed_password=default_pwd_hash,
        role=UserRole.LOGISTICS,
        fpo_name="KisanExpress ColdChain Fleet",
        district="Nashik",
        state="Maharashtra",
        lat=19.9975,
        lng=73.7898,
        trust_score=4.85,
        verified=True,
        kyc_status="FLEET_PERMIT_VERIFIED",
        total_trades=140,
        rating_count=130
    )

    db.add_all([u1, u2, u3, u4, u5])
    db.commit()

    # 2. Crop Listings
    l1 = CropListing(
        id=1,
        farmer_id=1,
        crop_name="Onion",
        variety="Nashik Red (Garwa)",
        quantity_quintals=120.0,
        quality_grade=QualityGrade.GRADE_A,
        harvest_date="2026-08-25",
        district="Nashik",
        state="Maharashtra",
        pincode="422209",
        lat=20.1746,
        lng=73.9875,
        is_organic=False,
        expected_price_per_quintal=2200.0,
        mandi_benchmark_price=1850.0,
        ai_recommended_min=2050.0,
        ai_recommended_max=2350.0,
        ai_recommended_target=2200.0,
        status=ListingStatus.ACTIVE,
        notes="Export quality, tightly sorted, single-center dry outer skin. Low moisture content suitable for storage.",
        image_url="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80"
    )

    l2 = CropListing(
        id=2,
        farmer_id=2,
        crop_name="Wheat",
        variety="Sharbati Gold Premium",
        quantity_quintals=250.0,
        quality_grade=QualityGrade.GRADE_A,
        harvest_date="2026-08-20",
        district="Ludhiana",
        state="Punjab",
        pincode="141001",
        lat=30.9010,
        lng=75.8573,
        is_organic=True,
        expected_price_per_quintal=3100.0,
        mandi_benchmark_price=2275.0,
        ai_recommended_min=2900.0,
        ai_recommended_max=3300.0,
        ai_recommended_target=3100.0,
        status=ListingStatus.ACTIVE,
        notes="NPOP Certified organic Sharbati grain. Heavy test weight (81 kg/hl), rich golden luster, perfect for premium flour brands.",
        image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80"
    )

    l3 = CropListing(
        id=3,
        farmer_id=3,
        crop_name="Red Chilli",
        variety="Guntur Sannam S4",
        quantity_quintals=65.0,
        quality_grade=QualityGrade.GRADE_A,
        harvest_date="2026-08-22",
        district="Guntur",
        state="Andhra Pradesh",
        pincode="522004",
        lat=16.3067,
        lng=80.4365,
        is_organic=False,
        expected_price_per_quintal=19500.0,
        mandi_benchmark_price=16500.0,
        ai_recommended_min=18500.0,
        ai_recommended_max=20500.0,
        ai_recommended_target=19500.0,
        status=ListingStatus.ACTIVE,
        notes="High pungency (35,000-40,000 SHU), bright crimson red, moisture under 10%. Direct from farmer collective.",
        image_url="https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80"
    )

    l4 = CropListing(
        id=4,
        farmer_id=1,
        crop_name="Tomato",
        variety="Kolar Hybrid 1057",
        quantity_quintals=85.0,
        quality_grade=QualityGrade.GRADE_B,
        harvest_date="2026-08-28",
        district="Nashik",
        state="Maharashtra",
        pincode="422209",
        lat=20.1250,
        lng=73.9120,
        is_organic=False,
        expected_price_per_quintal=1750.0,
        mandi_benchmark_price=1500.0,
        ai_recommended_min=1650.0,
        ai_recommended_max=1850.0,
        ai_recommended_target=1750.0,
        status=ListingStatus.ACTIVE,
        notes="Firm, uniform medium size fruit with 7+ days transit shelf life. Plucked at breaker stage for long-haul transport.",
        image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
    )

    db.add_all([l1, l2, l3, l4])
    db.commit()

    # 3. Sample Order
    o1 = Order(
        id=1,
        order_number="ORD-2026-9041",
        listing_id=1,
        buyer_id=4,
        farmer_id=1,
        quantity_ordered=40.0,
        price_per_quintal=2200.0,
        total_produce_amount=88000.0,
        logistics_fee=3400.0,
        platform_fee=0.0,  # 0% commission direct trade
        total_amount=91400.0,
        status=OrderStatus.IN_TRANSIT,
        payment_status=PaymentStatus.ESCROW_HELD,
        payment_ref="UPI/RAZORPAY-SIM-99812480",
        delivery_address="GreenBite Central Fulfillment Center, Plot 42, Turbhe MIDC, Navi Mumbai",
        delivery_pincode="400705",
        delivery_lat=19.0760,
        delivery_lng=72.9980,
        delivery_otp="5821"
    )

    db.add(o1)
    db.commit()
    db.close()
    print("Seed completed successfully!")

def reset_db_and_seed():
    """Wipe current data and reseed initial records."""
    db = SessionLocal()
    try:
        from models import CropRfq
        db.query(CropRfq).delete()
    except Exception:
        pass
    db.query(Order).delete()
    db.query(CropListing).delete()
    db.query(MandiPrice).delete()
    db.query(LogisticsBatch).delete()
    db.query(User).delete()
    db.commit()
    db.close()
    seed()

if __name__ == "__main__":
    seed()
