"""
Test script to verify hierarchy implementation
Run this after starting the backend server
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_hierarchy():
    print("🧪 Testing Smart Citizen LK Hierarchy Implementation\n")
    
    # Step 1: Login as President/Admin
    print("1️⃣ Logging in as President/Admin...")
    admin_login = requests.post(f"{BASE_URL}/auth/login", json={
        "nic": "999999999V",
        "password": "admin"
    })
    admin_token = admin_login.json()["token"]
    print(f"✅ Admin logged in. Token: {admin_token[:20]}...")
    
    # Step 2: View all divisions
    print("\n2️⃣ Viewing all DS divisions...")
    divisions = requests.get(
        f"{BASE_URL}/admin/divisions",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    print(f"✅ Found {len(divisions.json())} division(s):")
    for div in divisions.json():
        print(f"   - {div['ds_name']} at {div['division']}")
    
    # Step 3: Login as DS
    print("\n3️⃣ Logging in as DS Officer...")
    ds_login = requests.post(f"{BASE_URL}/auth/login", json={
        "nic": "777777777V",
        "password": "ds"
    })
    ds_token = ds_login.json()["token"]
    print(f"✅ DS logged in. Token: {ds_token[:20]}...")
    
    # Step 4: DS views their GS officers
    print("\n4️⃣ DS viewing their GS officers...")
    gs_officers = requests.get(
        f"{BASE_URL}/ds/gs-officers",
        headers={"Authorization": f"Bearer {ds_token}"}
    )
    print(f"✅ Found {len(gs_officers.json())} GS officer(s):")
    for gs in gs_officers.json():
        print(f"   - {gs['fullname']} at {gs['gs_section']}")
    
    # Step 5: Login as GS
    print("\n5️⃣ Logging in as GS Officer...")
    gs_login = requests.post(f"{BASE_URL}/auth/login", json={
        "nic": "888888888V",
        "password": "gs"
    })
    gs_token = gs_login.json()["token"]
    print(f"✅ GS logged in. Token: {gs_token[:20]}...")
    
    # Step 6: GS adds a citizen
    print("\n6️⃣ GS adding a new citizen...")
    try:
        add_citizen = requests.post(
            f"{BASE_URL}/gs/add-citizen",
            headers={"Authorization": f"Bearer {gs_token}"},
            json={
                "fullname": "Test Citizen Nimal",
                "nic": "200012345678",
                "phone": "0771234567",
                "email": "test@example.com",
                "password": "test123",
                "address": "Test Address, Wellawatta"
            }
        )
        if add_citizen.status_code == 200:
            result = add_citizen.json()
            print(f"✅ Citizen added: {result['details']['citizen_name']}")
            print(f"   - NIC: {result['details']['citizen_nic']}")
            print(f"   - Section: {result['details']['gs_section']}")
        elif add_citizen.status_code == 400:
            print("⚠️  Citizen already exists (expected if running multiple times)")
        else:
            print(f"❌ Failed: {add_citizen.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Step 7: Login as citizen and apply for service
    print("\n7️⃣ Citizen logging in and applying for service...")
    try:
        citizen_login = requests.post(f"{BASE_URL}/auth/login", json={
            "nic": "200012345678",
            "password": "test123"
        })
        if citizen_login.status_code == 200:
            citizen_token = citizen_login.json()["token"]
            print(f"✅ Citizen logged in. Token: {citizen_token[:20]}...")
            
            # Apply for service
            print("\n   Applying for Birth Certificate...")
            application = requests.post(
                f"{BASE_URL}/applications",
                headers={"Authorization": f"Bearer {citizen_token}"},
                json={
                    "service_type": "Birth Certificate",
                    "applicant_nic": "200012345678",
                    "details": {
                        "name": "Baby Test",
                        "reason": "Birth registration"
                    },
                    "approval_level": "gs_ds"
                }
            )
            
            if application.status_code == 200:
                app_result = application.json()
                print(f"✅ Application submitted!")
                print(f"   - ID: {app_result['id']}")
                print(f"   - Approval Level: {app_result['approval_level']}")
                print(f"   - Current Stage: {app_result['current_stage']}")
                print(f"   - Assigned To: {app_result.get('assigned_to', 'N/A')}")
            else:
                print(f"❌ Application failed: {application.json()}")
        else:
            print("⚠️  Citizen login failed (user may not exist yet)")
    except Exception as e:
        print(f"⚠️  Citizen test skipped: {e}")
    
    print("\n" + "="*60)
    print("🎉 Hierarchy Implementation Test Complete!")
    print("="*60)

if __name__ == "__main__":
    try:
        test_hierarchy()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server!")
        print("   Make sure the backend is running at http://localhost:8000")
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
