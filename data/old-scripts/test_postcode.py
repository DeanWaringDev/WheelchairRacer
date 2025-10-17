"""
Quick test to debug postcode lookup
"""
import requests
import time

# Test with a UK parkrun that should have TW9 1AE
# Let's use Bushy Park (the first ever parkrun)
lat = 51.4102
lng = -0.3362
country = "UK"

print(f"Testing reverse geocoding for coordinates: {lat}, {lng}")
print(f"Country: {country}")
print("-" * 50)

# Test postcodes.io
print("\n📡 Testing postcodes.io API...")
try:
    # CORRECT endpoint for reverse geocoding
    url = f"https://api.postcodes.io/postcodes?lon={lng}&lat={lat}"
    print(f"URL: {url}")
    
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nFull JSON: {data}")
        
        if data.get('result') and len(data['result']) > 0:
            postcode = data['result'][0].get('postcode')
            print(f"\n✅ SUCCESS! Postcode: {postcode}")
        else:
            print("\n❌ No results in response")
    else:
        print(f"\n❌ Failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")
    import traceback
    traceback.print_exc()

# Also test the CORRECT reverse geocoding endpoint
print("\n" + "=" * 50)
print("📡 Testing postcodes.io REVERSE endpoint...")
try:
    url = f"https://api.postcodes.io/postcodes?lon={lng}&lat={lat}&limit=1&radius=1000"
    print(f"URL: {url}")
    
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nKeys in data: {data.keys()}")
        
        if data.get('result'):
            print(f"Result type: {type(data['result'])}")
            if data['result']:
                print(f"First result: {data['result'][0] if isinstance(data['result'], list) else data['result']}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")
    import traceback
    traceback.print_exc()

# Test Nominatim
print("\n" + "=" * 50)
print("📡 Testing Nominatim API...")
try:
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        'lat': lat,
        'lon': lng,
        'format': 'json',
        'addressdetails': 1
    }
    headers = {
        'User-Agent': 'WheelchairRacer/1.0 (testing)'
    }
    
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = requests.get(url, params=params, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nFull JSON: {data}")
        
        address = data.get('address', {})
        postcode = address.get('postcode') or address.get('postal_code')
        
        if postcode:
            print(f"\n✅ SUCCESS! Postcode: {postcode}")
        else:
            print(f"\n❌ No postcode in address")
            print(f"Address keys: {address.keys()}")
    else:
        print(f"\n❌ Failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")
    import traceback
    traceback.print_exc()
