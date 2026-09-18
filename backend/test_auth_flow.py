"""
End-to-End Verification Test for Server-Side Authentication & JWT Verification
Tests against live FastAPI server at http://127.0.0.1:8000 using Python standard library urllib.request:
  1. Password Hashing and Verification
  2. User Registration with Password
  3. Login with correct/wrong password and JWT token generation
  4. Protected POST /api/listings without token (Expect 401)
  5. Protected POST /api/listings with Farmer 1 token (Expect 200)
  6. Attempt PUT /api/listings/{id} with Farmer 2 token (Expect 403 Forbidden)
  7. Successful PUT /api/listings/{id} with Farmer 1 token (Expect 200)
  8. Attempt Order on own listing (Expect 400)
  9. Attempt DELETE /api/listings/{id} with Farmer 2 token (Expect 403 Forbidden)
  10. Successful DELETE with Farmer 1 token (Expect 200)
"""

import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            resp_body = response.read().decode("utf-8")
            return status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"raw": err_body}

def run_tests():
    print("==================================================")
    print("   KISANSETU AUTH & JWT VERIFICATION TEST SUITE   ")
    print("==================================================")
    
    # 1. Register a new test Farmer (Farmer A)
    phone_farmer_a = f"+9198{int(time.time()) % 100000000:08d}"
    pwd_farmer_a = "SecretFarmer123"

    status, farmer_a = make_request("POST", "/api/auth/register", {
        "name": "Test Farmer Alpha",
        "phone": phone_farmer_a,
        "password": pwd_farmer_a,
        "role": "FARMER",
        "district": "Nashik",
        "state": "Maharashtra"
    })
    assert status == 200, f"Register Farmer Alpha failed with {status}: {farmer_a}"
    token_a = farmer_a.get("access_token")
    assert token_a, "Farmer Alpha response must contain access_token!"
    print(f"[PASS] 1. Farmer Alpha registered & JWT issued: ID={farmer_a['id']}, token={token_a[:20]}...")

    # 2. Test Login with WRONG password
    status_bad, bad_login = make_request("POST", "/api/auth/login", {
        "phone": phone_farmer_a,
        "password": "WrongPassword!",
        "role": "FARMER"
    })
    assert status_bad == 401, f"Expected 401 for bad password, got {status_bad}: {bad_login}"
    print("[PASS] 2. Wrong password correctly rejected with HTTP 401 Unauthorized")

    # 3. Test Login with CORRECT password
    status_good, good_login = make_request("POST", "/api/auth/login", {
        "phone": phone_farmer_a,
        "password": pwd_farmer_a,
        "role": "FARMER"
    })
    assert status_good == 200, f"Expected 200 for good password, got {status_good}: {good_login}"
    token_a = good_login["access_token"]
    print("[PASS] 3. Correct password login succeeded with fresh JWT token")

    # 4. Register Farmer B (Farmer Beta)
    phone_farmer_b = f"+9197{int(time.time() + 10) % 100000000:08d}"
    pwd_farmer_b = "SecretFarmer456"
    status_b, farmer_b = make_request("POST", "/api/auth/register", {
        "name": "Test Farmer Beta",
        "phone": phone_farmer_b,
        "password": pwd_farmer_b,
        "role": "FARMER",
        "district": "Pune",
        "state": "Maharashtra"
    })
    assert status_b == 200, f"Register Farmer Beta failed with {status_b}: {farmer_b}"
    token_b = farmer_b["access_token"]
    print(f"[PASS] 4. Farmer Beta registered & JWT issued: ID={farmer_b['id']}")

    # 5. Test protected endpoint without token (Expect 401)
    status_no_tok, res_no_tok = make_request("POST", "/api/listings", {
        "crop_name": "Onion",
        "variety": "Nashik Red",
        "quantity_quintals": 50,
        "harvest_date": "2026-10-15",
        "district": "Nashik",
        "state": "Maharashtra",
        "pincode": "422001",
        "lat": 20.0,
        "lng": 73.8,
        "expected_price_per_quintal": 2200
    })
    assert status_no_tok == 401, f"Expected 401 for unauthenticated listing creation, got {status_no_tok}: {res_no_tok}"
    print("[PASS] 5. Unauthenticated POST /api/listings correctly rejected with HTTP 401 Unauthorized")

    # 6. Create listing WITH Farmer Alpha token (Expect 200)
    status_create, listing = make_request("POST", "/api/listings", {
        "crop_name": "Onion",
        "variety": "Nashik Red",
        "quantity_quintals": 50,
        "harvest_date": "2026-10-15",
        "district": "Nashik",
        "state": "Maharashtra",
        "pincode": "422001",
        "lat": 20.0,
        "lng": 73.8,
        "expected_price_per_quintal": 2200
    }, token=token_a)
    assert status_create == 200, f"Expected 200 for authenticated listing, got {status_create}: {listing}"
    listing_id = listing["id"]
    assert listing["farmer_id"] == farmer_a["id"], "Listing farmer_id must match authenticated user ID!"
    print(f"[PASS] 6. Authenticated listing created: ID={listing_id}, farmer_id={listing['farmer_id']}")

    # 7. Attempt to UPDATE Farmer Alpha's listing using Farmer Beta's token (Expect 403 Forbidden)
    status_unauth_up, res_unauth_up = make_request("PUT", f"/api/listings/{listing_id}", {
        "expected_price_per_quintal": 3000
    }, token=token_b)
    assert status_unauth_up == 403, f"Expected 403 Forbidden for non-owner update, got {status_unauth_up}: {res_unauth_up}"
    print("[PASS] 7. Cross-user update blocked with HTTP 403 Forbidden (Ownership Check Passed!)")

    # 8. Attempt to UPDATE Farmer Alpha's listing using Farmer Alpha's own token (Expect 200)
    status_auth_up, res_auth_up = make_request("PUT", f"/api/listings/{listing_id}", {
        "expected_price_per_quintal": 2400
    }, token=token_a)
    assert status_auth_up == 200, f"Expected 200 for owner update, got {status_auth_up}: {res_auth_up}"
    assert res_auth_up["expected_price_per_quintal"] == 2400
    print("[PASS] 8. Owner update succeeded with HTTP 200 OK")

    # 9. Register a Buyer and test Order placement
    phone_buyer = f"+9188{int(time.time() + 20) % 100000000:08d}"
    pwd_buyer = "BuyerSecret123"
    status_buyer, buyer = make_request("POST", "/api/auth/register", {
        "name": "Test Retail Buyer",
        "phone": phone_buyer,
        "password": pwd_buyer,
        "role": "BUYER",
        "district": "Mumbai",
        "state": "Maharashtra"
    })
    assert status_buyer == 200, f"Register Buyer failed: {status_buyer}: {buyer}"
    token_buyer = buyer["access_token"]

    # Attempt to place order by Farmer Alpha on their own listing (Expect 400)
    status_self, res_self = make_request("POST", "/api/orders", {
        "listing_id": listing_id,
        "buyer_id": farmer_a["id"],
        "quantity_ordered": 10,
        "delivery_address": "Farm Gate",
        "delivery_pincode": "422001"
    }, token=token_a)
    assert status_self == 400, f"Expected 400 for self-purchase, got {status_self}: {res_self}"
    print("[PASS] 9. Self-purchase prevention verified with HTTP 400 Bad Request")

    # Place order as legitimate Buyer (Expect 200)
    status_order, order = make_request("POST", "/api/orders", {
        "listing_id": listing_id,
        "buyer_id": buyer["id"],
        "quantity_ordered": 10,
        "delivery_address": "Vashi APMC Wholesale Market",
        "delivery_pincode": "400703"
    }, token=token_buyer)
    assert status_order == 200, f"Expected 200 for buyer order, got {status_order}: {order}"
    assert order["buyer_id"] == buyer["id"]
    print(f"[PASS] 10. Buyer placed order successfully: Order #{order['order_number']}, ID={order['id']}")

    # 11. Attempt to DELETE Farmer Alpha's listing using Farmer Beta's token (Expect 403)
    status_unauth_del, res_unauth_del = make_request("DELETE", f"/api/listings/{listing_id}", token=token_b)
    assert status_unauth_del == 403, f"Expected 403 for non-owner delete, got {status_unauth_del}: {res_unauth_del}"
    print("[PASS] 11. Cross-user deletion blocked with HTTP 403 Forbidden")

    # 12. Attempt to DELETE Farmer Alpha's listing with active orders (Expect 400)
    status_del_ordered, res_del_ordered = make_request("DELETE", f"/api/listings/{listing_id}", token=token_a)
    assert status_del_ordered == 400, f"Expected 400 when deleting listing with orders, got {status_del_ordered}: {res_del_ordered}"
    print("[PASS] 12. Active order deletion protection verified with HTTP 400 Bad Request")

    # 13. Create a temporary listing with no orders and verify successful owner deletion (Expect 200)
    status_create2, listing2 = make_request("POST", "/api/listings", {
        "crop_name": "Wheat",
        "variety": "Sharbati",
        "quantity_quintals": 20,
        "harvest_date": "2026-11-01",
        "district": "Nashik",
        "state": "Maharashtra",
        "pincode": "422001",
        "lat": 20.0,
        "lng": 73.8,
        "expected_price_per_quintal": 2500
    }, token=token_a)
    assert status_create2 == 200
    listing2_id = listing2["id"]

    status_auth_del, res_auth_del = make_request("DELETE", f"/api/listings/{listing2_id}", token=token_a)
    assert status_auth_del == 200, f"Expected 200 for owner delete, got {status_auth_del}: {res_auth_del}"
    print("[PASS] 13. Owner deletion of un-ordered listing succeeded with HTTP 200 OK")

    print("==================================================")
    print("   ALL 12 AUTH & SECURITY TESTS PASSED 100%!     ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
