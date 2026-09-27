"""
Seed script to initialize sample data for KisanSetu Agri-Marketplace.
Contains the exact 5 verified users, 12 crop listings, 2 sample orders,
and APMC mandi rates visible in local development.
Safe and idempotent: avoids duplicate records and syncs PostgreSQL sequences.
"""

import json
import logging
from sqlalchemy import text
from database import engine, SessionLocal, Base
from models import (
    User, CropListing, Order, MandiPrice, CropRfq,
    UserRole, QualityGrade, ListingStatus, OrderStatus, PaymentStatus
)
from auth import get_password_hash

logger = logging.getLogger("kisansetu.seed")

def get_seed_users():
    default_pwd_hash = get_password_hash("kisan123")
    return [
        {
            "id": 1,
            "name": "Ramesh Kumar Patel",
            "phone": "+91 98220 11223",
            "email": "ramesh.patel@sahyadrikisan.in",
            "hashed_password": default_pwd_hash,
            "role": UserRole.FARMER,
            "fpo_name": "Sahyadri Krishi Vikas Producer Co.",
            "district": "Nashik",
            "state": "Maharashtra",
            "lat": 20.1746,
            "lng": 73.9875,
            "trust_score": 4.9,
            "verified": True,
            "kyc_status": "AADHAAR_KYC_VERIFIED",
            "total_trades": 42,
            "rating_count": 39
        },
        {
            "id": 2,
            "name": "Sardar Gurpreet Singh",
            "phone": "+91 98140 22334",
            "email": "gurpreet.singh@punjabkisan.in",
            "hashed_password": default_pwd_hash,
            "role": UserRole.FARMER,
            "fpo_name": "Malwa Agro Farmer Producer Org",
            "district": "Ludhiana",
            "state": "Punjab",
            "lat": 30.9010,
            "lng": 75.8573,
            "trust_score": 4.8,
            "verified": True,
            "kyc_status": "AADHAAR_KYC_VERIFIED",
            "total_trades": 58,
            "rating_count": 54
        },
        {
            "id": 3,
            "name": "Venkat Ramanayya",
            "phone": "+91 94401 55667",
            "email": "venkat.spices@andhrakisan.in",
            "hashed_password": default_pwd_hash,
            "role": UserRole.FARMER,
            "fpo_name": "Guntur Chilli Growers Collective",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "lat": 16.3067,
            "lng": 80.4365,
            "trust_score": 4.95,
            "verified": True,
            "kyc_status": "AADHAAR_KYC_VERIFIED",
            "total_trades": 31,
            "rating_count": 29
        },
        {
            "id": 4,
            "name": "Priya Sharma (GreenBite Organics)",
            "phone": "+91 98200 44556",
            "email": "procurement@greenbite.co.in",
            "hashed_password": default_pwd_hash,
            "role": UserRole.BUYER,
            "fpo_name": "GreenBite Organics Wholesale",
            "district": "Mumbai",
            "state": "Maharashtra",
            "lat": 19.0760,
            "lng": 72.8777,
            "trust_score": 4.9,
            "verified": True,
            "kyc_status": "GST_VERIFIED_BUSINESS",
            "total_trades": 89,
            "rating_count": 84
        },
        {
            "id": 5,
            "name": "Santosh Rao (KisanExpress)",
            "phone": "+91 98231 99881",
            "email": "dispatch@kisanexpress.in",
            "hashed_password": default_pwd_hash,
            "role": UserRole.LOGISTICS,
            "fpo_name": "KisanExpress ColdChain Fleet",
            "district": "Nashik",
            "state": "Maharashtra",
            "lat": 19.9975,
            "lng": 73.7898,
            "trust_score": 4.85,
            "verified": True,
            "kyc_status": "COMMERCIAL_CARRIER_VERIFIED",
            "total_trades": 165,
            "rating_count": 152
        }
    ]

def get_seed_listings():
    wheat_img = "https://media.istockphoto.com/id/1426640386/photo/barley-of-wheat-crop-and-heap-of-grain-close-up.jpg?s=1024x1024&w=is&k=20&c=CBUCVfCozlwlYoi58Kg222nsppchkeAlCsIRmY_1QhY="
    rice_img = "https://media.istockphoto.com/id/671580286/photo/rice.jpg?s=612x612&w=0&k=20&c=Eo4qfXQVximdCyp5OBfDEi5eObBM17zphPv_V_DOuOg="
    potato_img = "https://media.istockphoto.com/id/1220924272/photo/potatoes-in-the-field.jpg?s=612x612&w=0&k=20&c=CnQo4b1Nk55CLAPOgGzspKo2JYTpNwflSiMMXFYqcC0="
    tomato_img = "https://media.istockphoto.com/id/1132371208/photo/three-ripe-tomatoes-on-green-branch.jpg?s=612x612&w=0&k=20&c=qVjDb5Tk3-UccV-E9gqvoz97PTsP1QmBftw27qA9kEo="
    onion_img = "https://media.istockphoto.com/id/1181631588/photo/onions-for-sale-in-the-weekly-market-malkapur-maharashtra.jpg?s=612x612&w=0&k=20&c=KYz1slV6Ly-T7v2vH7jns7ab9i_M6Atjq52uNPh3gRo="
    maize_img = "https://media.istockphoto.com/id/1408203125/photo/yellow-ripe-corn-on-stalks-for-harvest-in-agricultural-cultivated-field-in-the-day.jpg?s=612x612&w=0&k=20&c=zbQr0MiHfeV5poEBtQnJe3L9u40KSsV54CcK9QHLQoM="
    mustard_img = "https://media.istockphoto.com/id/1395333183/photo/different-types-of-mustard-and-mustard-seeds-on-a-rustic-wooden-board.jpg?s=612x612&w=0&k=20&c=idnWzVsKOMlwyeeHFRpouiKvUzQ9YRu39tJSUIxm51o="
    sugarcane_img = "https://media.istockphoto.com/id/93541349/photo/sugar-cane-plantation.jpg?s=612x612&w=0&k=20&c=mj-rR4mE718aFrPtXg8P7ZW7eZNROItjXlYjz5A9AvU="
    pulses_img = "https://media.istockphoto.com/id/163729647/photo/an-up-close-picture-of-organic-legumes.jpg?s=612x612&w=0&k=20&c=E9NdcSr4SxRaYtKjjjk6rFoHvw69mooX5aY78J34DMY="
    veg_img = "https://media.istockphoto.com/id/853523014/photo/autumn-concept-with-seasonal-fruits-and-vegetables.jpg?s=612x612&w=0&k=20&c=SjwT0JTtzvVehnDf32x2XW2SzUUDN0-8EYPmkEMP_qk="
    chilli_img = "https://media.istockphoto.com/id/1138440046/photo/closed-up-dried-red-chili-bangkok-fresh-market.jpg?s=612x612&w=0&k=20&c=chT7SeNJmO4gy9cRzUSaMHPcKKwFESCvLmDpAZkAu9U="
    soybean_img = "https://media.istockphoto.com/id/1273914984/photo/soya-bean-the-vegetable-protein.jpg?s=612x612&w=0&k=20&c=pw1CvYBIx-SnyhDZlP6_3fv8F97e5gXUH-lnzkYUWF0="

    return [
        {
            "id": 1,
            "farmer_id": 2,
            "crop_name": "Wheat",
            "variety": "Sharbati Gold Premium",
            "quantity_quintals": 250.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-20",
            "district": "Ludhiana",
            "state": "Punjab",
            "pincode": "141001",
            "lat": 30.9010,
            "lng": 75.8573,
            "is_organic": True,
            "expected_price_per_quintal": 3100.0,
            "mandi_benchmark_price": 2275.0,
            "ai_recommended_min": 2900.0,
            "ai_recommended_max": 3300.0,
            "ai_recommended_target": 3100.0,
            "status": ListingStatus.ACTIVE,
            "notes": "NPOP Certified organic Sharbati grain. Heavy test weight (81 kg/hl), rich golden luster, perfect for premium stone-ground flour and artisanal bakeries. Dry storage in hermetic bags.",
            "image_url": wheat_img,
            "images": json.dumps([wheat_img, wheat_img, wheat_img, wheat_img])
        },
        {
            "id": 2,
            "farmer_id": 2,
            "crop_name": "Rice",
            "variety": "1121 Pusa Super Basmati",
            "quantity_quintals": 320.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-18",
            "district": "Ludhiana",
            "state": "Punjab",
            "pincode": "141001",
            "lat": 30.8500,
            "lng": 75.8200,
            "is_organic": False,
            "expected_price_per_quintal": 4350.0,
            "mandi_benchmark_price": 3850.0,
            "ai_recommended_min": 4100.0,
            "ai_recommended_max": 4500.0,
            "ai_recommended_target": 4350.0,
            "status": ListingStatus.ACTIVE,
            "notes": "Aromatic extra long grain basmati paddy. Average grain length 8.4mm with 2.2x elongation ratio upon cooking. Clean sorted with minimal broken percentage (<1%).",
            "image_url": rice_img,
            "images": json.dumps([rice_img, rice_img, rice_img, rice_img])
        },
        {
            "id": 3,
            "farmer_id": 1,
            "crop_name": "Potato",
            "variety": "Chipsona Processing Grade",
            "quantity_quintals": 200.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-26",
            "district": "Nashik",
            "state": "Maharashtra",
            "pincode": "422209",
            "lat": 20.1500,
            "lng": 73.9500,
            "is_organic": False,
            "expected_price_per_quintal": 1580.0,
            "mandi_benchmark_price": 1350.0,
            "ai_recommended_min": 1480.0,
            "ai_recommended_max": 1680.0,
            "ai_recommended_target": 1580.0,
            "status": ListingStatus.ACTIVE,
            "notes": "High dry matter content (>21%) and minimal reducing sugars. Specially curated for chips, french fries, and industrial food processing. Zero greening, uniform 55-65mm size.",
            "image_url": potato_img,
            "images": json.dumps([potato_img, potato_img, potato_img, potato_img])
        },
        {
            "id": 4,
            "farmer_id": 1,
            "crop_name": "Tomato",
            "variety": "Kolar Hybrid 1057",
            "quantity_quintals": 95.0,
            "quality_grade": QualityGrade.GRADE_B,
            "harvest_date": "2026-08-28",
            "district": "Nashik",
            "state": "Maharashtra",
            "pincode": "422209",
            "lat": 20.1250,
            "lng": 73.9120,
            "is_organic": False,
            "expected_price_per_quintal": 1750.0,
            "mandi_benchmark_price": 1550.0,
            "ai_recommended_min": 1650.0,
            "ai_recommended_max": 1850.0,
            "ai_recommended_target": 1750.0,
            "status": ListingStatus.ACTIVE,
            "notes": "Firm, thick-walled breaker stage fruit tailored for long-distance cold transit (5-7 days transport safety). Uniform pinkish-red coloration with 4.5+ Brix sweetness index.",
            "image_url": tomato_img,
            "images": json.dumps([tomato_img, tomato_img, tomato_img, tomato_img])
        },
        {
            "id": 5,
            "farmer_id": 1,
            "crop_name": "Onion",
            "variety": "Nashik Red (Garwa)",
            "quantity_quintals": 160.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-25",
            "district": "Nashik",
            "state": "Maharashtra",
            "pincode": "422209",
            "lat": 20.1746,
            "lng": 73.9875,
            "is_organic": False,
            "expected_price_per_quintal": 2200.0,
            "mandi_benchmark_price": 1850.0,
            "ai_recommended_min": 2050.0,
            "ai_recommended_max": 2350.0,
            "ai_recommended_target": 2200.0,
            "status": ListingStatus.ACTIVE,
            "notes": "Export grade Garwa onions with tightly clinging dark red skins, single center, and dry necks. Cured under shaded solar ventilation. Excellent 4-5 month shelf stability.",
            "image_url": onion_img,
            "images": json.dumps([onion_img, onion_img, onion_img, onion_img])
        },
        {
            "id": 6,
            "farmer_id": 3,
            "crop_name": "Maize",
            "variety": "Pioneer Golden Kernel",
            "quantity_quintals": 280.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-24",
            "district": "Chhindwara",
            "state": "Madhya Pradesh",
            "pincode": "480001",
            "lat": 22.0574,
            "lng": 78.9382,
            "is_organic": False,
            "expected_price_per_quintal": 2150.0,
            "mandi_benchmark_price": 1920.0,
            "ai_recommended_min": 2050.0,
            "ai_recommended_max": 2250.0,
            "ai_recommended_target": 2150.0,
            "status": ListingStatus.ACTIVE,
            "notes": "High-density yellow maize grains rich in carbohydrates (72% starch). Tested low aflatoxin (<10 ppb). Ideal for livestock feed, poultry integration, and starch extraction mills.",
            "image_url": maize_img,
            "images": json.dumps([maize_img, maize_img, maize_img, maize_img])
        },
        {
            "id": 7,
            "farmer_id": 3,
            "crop_name": "Mustard",
            "variety": "Pusa Bold Yellow Seed",
            "quantity_quintals": 150.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-21",
            "district": "Alwar",
            "state": "Rajasthan",
            "pincode": "301001",
            "lat": 27.5530,
            "lng": 76.6346,
            "is_organic": True,
            "expected_price_per_quintal": 5600.0,
            "mandi_benchmark_price": 5050.0,
            "ai_recommended_min": 5350.0,
            "ai_recommended_max": 5800.0,
            "ai_recommended_target": 5600.0,
            "status": ListingStatus.ACTIVE,
            "notes": "High oil yield variety with 41.5% oil recovery index. Clean double-gravity separated seeds free from argemone adulteration. Cold-pressed kachi ghani quality benchmark.",
            "image_url": mustard_img,
            "images": json.dumps([mustard_img, mustard_img, mustard_img, mustard_img])
        },
        {
            "id": 8,
            "farmer_id": 1,
            "crop_name": "Sugarcane",
            "variety": "Co-0238 High Recovery Cane",
            "quantity_quintals": 450.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-29",
            "district": "Kolhapur",
            "state": "Maharashtra",
            "pincode": "416003",
            "lat": 16.7050,
            "lng": 74.2433,
            "is_organic": False,
            "expected_price_per_quintal": 380.0,
            "mandi_benchmark_price": 335.0,
            "ai_recommended_min": 360.0,
            "ai_recommended_max": 400.0,
            "ai_recommended_target": 380.0,
            "status": ListingStatus.ACTIVE,
            "notes": "Prime ratoon crop with 19.8% Brix sugar content and high juice recovery. Cut within 12 hours of scheduled transport to prevent sugar inversion. Ready for direct mill crushing or jaggery units.",
            "image_url": sugarcane_img,
            "images": json.dumps([sugarcane_img, sugarcane_img, sugarcane_img, sugarcane_img])
        },
        {
            "id": 9,
            "farmer_id": 3,
            "crop_name": "Pulses",
            "variety": "Desi Chana (Gram) Bold",
            "quantity_quintals": 190.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-23",
            "district": "Indore",
            "state": "Madhya Pradesh",
            "pincode": "452001",
            "lat": 22.7196,
            "lng": 75.8577,
            "is_organic": True,
            "expected_price_per_quintal": 6250.0,
            "mandi_benchmark_price": 5700.0,
            "ai_recommended_min": 6000.0,
            "ai_recommended_max": 6500.0,
            "ai_recommended_target": 6250.0,
            "status": ListingStatus.ACTIVE,
            "notes": "NPOP Organic certified Desi Chana with deep golden color and uniform size. 99.5% purity with zero foreign matter. Ideal for besan flour processing, wholesale dal mills, and organic retail.",
            "image_url": pulses_img,
            "images": json.dumps([pulses_img, pulses_img, pulses_img, pulses_img])
        },
        {
            "id": 10,
            "farmer_id": 1,
            "crop_name": "Seasonal Vegetables",
            "variety": "Snowball Cauliflower & Capsicum",
            "quantity_quintals": 75.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-30",
            "district": "Nashik",
            "state": "Maharashtra",
            "pincode": "422209",
            "lat": 20.1600,
            "lng": 73.9400,
            "is_organic": True,
            "expected_price_per_quintal": 2400.0,
            "mandi_benchmark_price": 2100.0,
            "ai_recommended_min": 2250.0,
            "ai_recommended_max": 2550.0,
            "ai_recommended_target": 2400.0,
            "status": ListingStatus.ACTIVE,
            "notes": "Mountain farm cultivated fresh snowball white cauliflower heads alongside crisp green capsicum. Farm-to-fork harvested early morning with zero chemical residues. Excellent retail crispness.",
            "image_url": veg_img,
            "images": json.dumps([veg_img, veg_img, veg_img, veg_img])
        },
        {
            "id": 11,
            "farmer_id": 3,
            "crop_name": "Red Chilli",
            "variety": "Guntur Sannam S4",
            "quantity_quintals": 65.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-22",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "pincode": "522004",
            "lat": 16.3067,
            "lng": 80.4365,
            "is_organic": False,
            "expected_price_per_quintal": 19500.0,
            "mandi_benchmark_price": 16500.0,
            "ai_recommended_min": 18500.0,
            "ai_recommended_max": 20500.0,
            "ai_recommended_target": 19500.0,
            "status": ListingStatus.ACTIVE,
            "notes": "High pungency (35,000-40,000 SHU), bright crimson red, moisture under 10%. Thoroughly sun-cured on concrete yards with stem intact. Prime quality for spice grinding and oleoresin extractors.",
            "image_url": chilli_img,
            "images": json.dumps([chilli_img, chilli_img, chilli_img, chilli_img])
        },
        {
            "id": 12,
            "farmer_id": 3,
            "crop_name": "Soybean",
            "variety": "Yellow Pearl (JS 335)",
            "quantity_quintals": 210.0,
            "quality_grade": QualityGrade.GRADE_A,
            "harvest_date": "2026-08-27",
            "district": "Indore",
            "state": "Madhya Pradesh",
            "pincode": "452001",
            "lat": 22.7500,
            "lng": 75.8900,
            "is_organic": False,
            "expected_price_per_quintal": 4650.0,
            "mandi_benchmark_price": 4200.0,
            "ai_recommended_min": 4450.0,
            "ai_recommended_max": 4800.0,
            "ai_recommended_target": 4650.0,
            "status": ListingStatus.ACTIVE,
            "notes": "High protein (39.5%) and high oil content (19.2%). Well-matured round golden grains with less than 1% moisture damage or split seed. Ready for solvent extraction plants or soya flour milling.",
            "image_url": soybean_img,
            "images": json.dumps([soybean_img, soybean_img, soybean_img, soybean_img])
        }
    ]

def get_seed_orders():
    return [
        {
            "id": 1,
            "order_number": "ORD-2026-9041",
            "listing_id": 5,
            "buyer_id": 4,
            "farmer_id": 1,
            "quantity_ordered": 40.0,
            "price_per_quintal": 2200.0,
            "total_produce_amount": 88000.0,
            "logistics_fee": 3400.0,
            "platform_fee": 0.0,
            "total_amount": 91400.0,
            "status": OrderStatus.IN_TRANSIT,
            "payment_status": PaymentStatus.ESCROW_HELD,
            "payment_ref": "UPI/RAZORPAY-SIM-99812480",
            "delivery_address": "GreenBite Central Fulfillment Center, Plot 42, Turbhe MIDC, Navi Mumbai",
            "delivery_pincode": "400705",
            "delivery_lat": 19.0760,
            "delivery_lng": 72.9980,
            "delivery_otp": "5821"
        },
        {
            "id": 2,
            "order_number": "ORD-2026-9038",
            "listing_id": 1,
            "buyer_id": 4,
            "farmer_id": 2,
            "quantity_ordered": 50.0,
            "price_per_quintal": 3100.0,
            "total_produce_amount": 155000.0,
            "logistics_fee": 4800.0,
            "platform_fee": 0.0,
            "total_amount": 159800.0,
            "status": OrderStatus.DELIVERED,
            "payment_status": PaymentStatus.RELEASED_TO_FARMER,
            "payment_ref": "UPI/RAZORPAY-SIM-88219033",
            "delivery_address": "GreenBite Wholesale Hub, Sector 18, Vashi APMC, Navi Mumbai",
            "delivery_pincode": "400703",
            "delivery_lat": 19.0760,
            "delivery_lng": 72.9980,
            "delivery_otp": "4190"
        }
    ]

def get_seed_mandi_prices():
    return [
        {"crop_name": "Onion", "market_name": "Nashik (Lasalgaon)", "district": "Nashik", "state": "Maharashtra", "min_price": 1400.0, "max_price": 2400.0, "modal_price": 1850.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Wheat", "market_name": "Khanna Mandi", "district": "Ludhiana", "state": "Punjab", "min_price": 2150.0, "max_price": 2450.0, "modal_price": 2275.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Tomato", "market_name": "Pimpalgaon APMC", "district": "Nashik", "state": "Maharashtra", "min_price": 1200.0, "max_price": 1900.0, "modal_price": 1550.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Red Chilli", "market_name": "Guntur Yard", "district": "Guntur", "state": "Andhra Pradesh", "min_price": 14500.0, "max_price": 18500.0, "modal_price": 16500.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Rice", "market_name": "Karnal Grain Market", "district": "Karnal", "state": "Haryana", "min_price": 3400.0, "max_price": 4200.0, "modal_price": 3850.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Potato", "market_name": "Vashi APMC", "district": "Mumbai", "state": "Maharashtra", "min_price": 1100.0, "max_price": 1600.0, "modal_price": 1350.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Soybean", "market_name": "Indore Mandi", "district": "Indore", "state": "Madhya Pradesh", "min_price": 4100.0, "max_price": 4900.0, "modal_price": 4600.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Mustard", "market_name": "Alwar Krishi Upaj", "district": "Alwar", "state": "Rajasthan", "min_price": 5100.0, "max_price": 5800.0, "modal_price": 5450.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Cotton", "market_name": "Rajkot Yard", "district": "Rajkot", "state": "Gujarat", "min_price": 6200.0, "max_price": 7400.0, "modal_price": 6800.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Maize", "market_name": "Chhindwara Mandi", "district": "Chhindwara", "state": "Madhya Pradesh", "min_price": 1850.0, "max_price": 2300.0, "modal_price": 2090.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Sugarcane", "market_name": "Kolhapur APMC", "district": "Kolhapur", "state": "Maharashtra", "min_price": 310.0, "max_price": 370.0, "modal_price": 335.0, "arrival_date": "2026-08-30"},
        {"crop_name": "Pulses", "market_name": "Indore Dal Mill Complex", "district": "Indore", "state": "Madhya Pradesh", "min_price": 5400.0, "max_price": 6600.0, "modal_price": 5700.0, "arrival_date": "2026-08-30"}
    ]

def _sync_sequences(db):
    """Sync PostgreSQL SERIAL sequence counters to MAX(id) to avoid collision on new user writes."""
    if engine.dialect.name == "postgresql":
        try:
            for table in ["users", "crop_listings", "orders", "mandi_prices"]:
                db.execute(text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1));"))
            db.commit()
            logger.info("Synced PostgreSQL sequences successfully.")
        except Exception as e:
            logger.warning(f"Note on sequence sync: {e}")

def seed():
    """Seed missing users, listings, orders, and mandi prices safely without wiping user-created records."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Users
        for u_data in get_seed_users():
            existing = db.query(User).filter((User.id == u_data["id"]) | (User.phone == u_data["phone"])).first()
            if not existing:
                user = User(**u_data)
                db.add(user)
        db.commit()

        # 2. Crop Listings
        for l_data in get_seed_listings():
            existing = db.query(CropListing).filter(CropListing.id == l_data["id"]).first()
            if not existing:
                listing = CropListing(**l_data)
                db.add(listing)
        db.commit()

        # 3. Sample Orders
        for o_data in get_seed_orders():
            existing = db.query(Order).filter(Order.order_number == o_data["order_number"]).first()
            if not existing:
                order = Order(**o_data)
                db.add(order)
        db.commit()

        # 4. Mandi Prices
        if db.query(MandiPrice).count() == 0:
            for m_data in get_seed_mandi_prices():
                db.add(MandiPrice(**m_data))
            db.commit()

        # Sync PostgreSQL primary key sequences
        _sync_sequences(db)
        print("Seed completed successfully with all initial sample data!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

def seed_if_empty():
    """Automatically invoked at application startup. Populates sample data only if missing."""
    db = SessionLocal()
    try:
        listings_count = db.query(CropListing).count()
        users_count = db.query(User).count()
        if listings_count < 12 or users_count < 5:
            logger.info(f"Database has {listings_count} listings and {users_count} users. Populating baseline seed data...")
            db.close()
            seed()
        else:
            logger.info(f"Database already has {listings_count} listings. Skipping auto-seed.")
            _sync_sequences(db)
    except Exception as e:
        logger.warning(f"Auto-seed check encountered notice: {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass

def reset_db_and_seed():
    """Reset database and re-seed all initial records for demonstration / testing."""
    db = SessionLocal()
    try:
        try:
            db.query(CropRfq).delete()
        except Exception:
            pass
        db.query(Order).delete()
        db.query(CropListing).delete()
        db.query(MandiPrice).delete()
        db.query(User).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error resetting database: {e}")
    finally:
        db.close()
    seed()

if __name__ == "__main__":
    seed()
