"""
Clean parkrun descriptions by removing boilerplate text and fixing postcodes.

This script:
1. Removes all boilerplate text from descriptions
2. Fixes incorrect postcodes (TW9 1AE = parkrun HQ) using reverse geocoding
3. Cleans up whitespace and formatting
"""

import json
import re
import time
import requests
from typing import Dict, Optional

# Parkrun HQ postcode (to be replaced)
PARKRUN_HQ_POSTCODE = "TW9 1AE"

def load_boilerplate(filepath: str = "boilerplate.txt") -> list[str]:
    """Load boilerplate phrases from file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by double newlines to get sections
    sections = [s.strip() for s in content.split('\n\n') if s.strip()]
    
    # Also add common variations
    boilerplate = sections + [
        "Some sections of the course may accumulate mud, leaves and puddles after rain.",
        "Dependent on availability, marshals will be at key sections of the course, or signs will be in place.",
        "Course Map",
        "Age Grading",
        "Course Safety",
    ]
    
    return boilerplate


def clean_description(description: str, boilerplate: list[str]) -> str:
    """Remove boilerplate text and clean formatting."""
    cleaned = description
    
    # Remove each boilerplate phrase
    for phrase in boilerplate:
        cleaned = cleaned.replace(phrase, "")
    
    # Remove excessive whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    # Remove leading/trailing whitespace
    cleaned = cleaned.strip()
    
    # Remove standalone punctuation
    cleaned = re.sub(r'\s+[.,;:]+\s+', ' ', cleaned)
    
    return cleaned


def get_postcode_from_coords(lat: float, lng: float, country: str) -> Optional[str]:
    """
    Get postcode from coordinates using reverse geocoding via Nominatim (OpenStreetMap).
    
    Nominatim works worldwide and is free (with rate limiting).
    Rate limit: 1 request per second
    """
    
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lng,
            'format': 'json',
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'WheelchairRacer-Parkrun-Accessibility/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            address = data.get('address', {})
            
            # Try to get postcode (UK/international format)
            postcode = address.get('postcode')
            if postcode:
                print(f"  ✅ Found postcode: {postcode}")
                return postcode
            
            # Some countries use postal_code instead
            postcode = address.get('postal_code')
            if postcode:
                print(f"  ✅ Found postal_code: {postcode}")
                return postcode
        else:
            print(f"  ⚠️  Nominatim returned status {response.status_code}")
        
        # Rate limit for Nominatim (1 request per second)
        time.sleep(1)
        
    except Exception as e:
        print(f"  ⚠️  Nominatim error: {e}")
    
    return None


def fix_postcode(event: Dict, force_lookup: bool = False) -> Dict:
    """
    Fix postcode if it's parkrun HQ or missing.
    
    Args:
        event: Parkrun event dictionary
        force_lookup: If True, always do reverse geocoding even if postcode exists
    """
    current_postcode = event.get('postcode')
    
    # Check if we need to fix the postcode
    needs_fixing = (
        not current_postcode or 
        current_postcode == PARKRUN_HQ_POSTCODE or
        force_lookup
    )
    
    if needs_fixing:
        coords = event.get('coordinates', {})
        lat = coords.get('lat')
        lng = coords.get('lng')
        country = event.get('country', 'UK')
        
        if lat and lng:
            print(f"  🔍 Looking up postcode for {event['name']}...")
            new_postcode = get_postcode_from_coords(lat, lng, country)
            
            if new_postcode:
                event['postcode'] = new_postcode
                event['postcode_source'] = 'reverse_geocoded'
            else:
                print(f"  ❌ Could not find postcode for {event['name']}")
                event['postcode_source'] = 'not_found'
        else:
            print(f"  ⚠️  No coordinates for {event['name']}")
    
    return event


def clean_parkrun_data(
    input_file: str = "parkrun_detail.json",
    output_file: str = "parkrun_detail_clean.json",
    boilerplate_file: str = "boilerplate.txt",
    fix_postcodes: bool = True
):
    """
    Main cleaning function.
    
    Args:
        input_file: Path to raw scraped data
        output_file: Path to save cleaned data
        boilerplate_file: Path to boilerplate text file
        fix_postcodes: Whether to fix incorrect/missing postcodes
    """
    
    print("🧹 Parkrun Data Cleaning Script")
    print("=" * 50)
    
    # Load boilerplate
    print(f"\n📖 Loading boilerplate from {boilerplate_file}...")
    boilerplate = load_boilerplate(boilerplate_file)
    print(f"   Found {len(boilerplate)} boilerplate phrases")
    
    # Load data
    print(f"\n📂 Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    # Extract events array from the JSON structure
    data = full_data.get('events', [])
    metadata = full_data.get('metadata', {})
    
    print(f"   Found {len(data)} parkrun events")
    if metadata:
        print(f"   Metadata: {metadata.get('total_events', 'N/A')} total, {metadata.get('scraping_summary', {}).get('successful_scrapes', 'N/A')} successful scrapes")
    
    # Statistics
    stats = {
        'total': len(data),
        'cleaned_descriptions': 0,
        'fixed_postcodes': 0,
        'missing_postcodes': 0,
        'parkrun_hq_postcodes': 0
    }
    
    # Process each event
    print("\n🔧 Processing events...")
    for i, event in enumerate(data, 1):
        print(f"\n[{i}/{len(data)}] {event['name']}...")
        
        # Clean description
        if event.get('description'):
            original_length = len(event['description'])
            event['description'] = clean_description(event['description'], boilerplate)
            new_length = len(event['description'])
            
            if new_length < original_length:
                stats['cleaned_descriptions'] += 1
                reduction = original_length - new_length
                print(f"  ✂️  Removed {reduction} chars of boilerplate")
        
        # Fix postcode
        if fix_postcodes:
            original_postcode = event.get('postcode')
            
            if original_postcode == PARKRUN_HQ_POSTCODE:
                stats['parkrun_hq_postcodes'] += 1
            
            if not original_postcode:
                stats['missing_postcodes'] += 1
            
            if original_postcode == PARKRUN_HQ_POSTCODE or not original_postcode:
                event = fix_postcode(event)
                
                if event.get('postcode') != original_postcode:
                    stats['fixed_postcodes'] += 1
    
    # Save cleaned data (preserve metadata)
    print(f"\n💾 Saving cleaned data to {output_file}...")
    output_data = {
        'metadata': metadata,
        'events': data
    }
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    # Print statistics
    print("\n" + "=" * 50)
    print("📊 CLEANING SUMMARY")
    print("=" * 50)
    print(f"Total events:              {stats['total']}")
    print(f"Cleaned descriptions:      {stats['cleaned_descriptions']}")
    print(f"Parkrun HQ postcodes:      {stats['parkrun_hq_postcodes']}")
    print(f"Missing postcodes:         {stats['missing_postcodes']}")
    print(f"Fixed postcodes:           {stats['fixed_postcodes']}")
    print(f"Remaining unfixed:         {stats['parkrun_hq_postcodes'] + stats['missing_postcodes'] - stats['fixed_postcodes']}")
    print("=" * 50)
    print(f"\n✅ Done! Cleaned data saved to {output_file}")


if __name__ == "__main__":
    # Run the cleaning
    clean_parkrun_data(
        input_file="parkrun_detail.json",
        output_file="parkrun_detail_clean.json",
        boilerplate_file="boilerplate.txt",
        fix_postcodes=True
    )
