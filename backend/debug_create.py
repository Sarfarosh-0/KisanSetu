import traceback
from main import app, create_crop_listing
from schemas import CropListingCreate
from database import SessionLocal
from models import User

db = SessionLocal()
user = db.query(User).first()
print("Found user:", user.id, user.name, user.role)

payload = CropListingCreate(
    crop_name="Onion",
    variety="Nashik Red",
    quantity_quintals=50,
    harvest_date="2026-10-15",
    district="Nashik",
    state="Maharashtra",
    pincode="422001",
    lat=20.0,
    lng=73.8,
    expected_price_per_quintal=2200
)

try:
    res = create_crop_listing(payload, current_user=user, db=db)
    print("Success:", res)
except Exception as e:
    print("Caught Exception:")
    traceback.print_exc()
