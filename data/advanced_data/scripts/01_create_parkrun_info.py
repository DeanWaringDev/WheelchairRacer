"""
Script to create 01_gold_parkrun_info.json from raw parkrun data.

This extracts basic parkrun information (names, locations, URLs) without 
any accessibility scoring or analysis.

Uses OpenAI to detect language from course pages.
Uses Google Geocoding API to get postcodes from coordinates.

Test run: First 15 parkruns only (outputs to TEST.01_gold_parkrun_info.json)
Full run: All parkruns (outputs to 01_gold_parkrun_info.json)
"""

import json
import os
import time
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv('../../.env')

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
GOOGLE_API_KEY = os.getenv('GOOGLE_GEOCODING_API_KEY')

# Country code to country name mapping (derived from parkrun URLs)
COUNTRY_MAPPING = {
    "0": "Unknown",
    "3": "Australia",
    "4": "Austria", 
    "14": "Canada",
    "23": "Denmark",
    "30": "Finland",
    "32": "Germany",
    "42": "Ireland",
    "44": "Italy",
    "46": "Japan",
    "54": "Lithuania",
    "57": "Malaysia",
    "64": "Netherlands",
    "65": "New Zealand",
    "66": "New Zealand",
    "67": "Norway",
    "74": "Poland",
    "75": "Poland",
    "76": "Portugal",
    "77": "Russia",
    "82": "Singapore",
    "85": "South Africa",
    "90": "Sweden",
    "97": "United Kingdom",
    "98": "United States",
    "100": "United States",
    # Add more as we discover them
}

def get_country_name(country_code: str, countries_data: Dict) -> str:
    """
    Get country name from country code using URL mapping.
    Falls back to COUNTRY_MAPPING if URL not available.
    """
    # First try our mapping
    if country_code in COUNTRY_MAPPING:
        return COUNTRY_MAPPING[country_code]
    
    # Try to derive from URL
    country_info = countries_data.get(country_code, {})
    url = country_info.get('url', '')
    
    if not url:
        return "Unknown"
    
    # Parse country from URL (e.g., www.parkrun.com.au -> Australia)
    # This is a simple heuristic - we might need to refine it
    if '.au' in url:
        return "Australia"
    elif '.uk' in url or 'parkrun.org.uk' in url:
        return "United Kingdom"
    elif '.za' in url:
        return "South Africa"
    elif '.nz' in url:
        return "New Zealand"
    elif '.ie' in url:
        return "Ireland"
    elif '.de' in url:
        return "Germany"
    elif '.ca' in url:
        return "Canada"
    
    return "Unknown"

def get_postcode_from_coordinates(lat: float, lon: float, parkrun_name: str, country: str) -> Optional[str]:
    """
    Get postcode from coordinates using OpenAI (cheaper than Google Geocoding).
    
    Args:
        lat: Latitude
        lon: Longitude
        parkrun_name: Name of parkrun (for context)
        country: Country name
    
    Returns:
        Postcode string or None if not found
    """
    try:
        prompt = f"""Given these coordinates: {lat}, {lon}
Location: {parkrun_name}
Country: {country}

What is the postcode/postal code for this location? Reply with ONLY the postcode, nothing else.
If you cannot determine it with confidence, reply with "UNKNOWN"."""
        
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a geocoding assistant. Reply with only the postcode/postal code for the given coordinates."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=20
        )
        
        postcode = completion.choices[0].message.content.strip()
        
        # Don't return UNKNOWN, return None instead
        if postcode.upper() == "UNKNOWN":
            return None
        
        return postcode
    
    except Exception as e:
        print(f"      Warning: Could not get postcode for {parkrun_name}: {e}")
        return None

def get_language_from_url(url: str, parkrun_name: str) -> str:
    """
    Detect language from parkrun course page using OpenAI.
    
    Args:
        url: Course page URL
        parkrun_name: Name of parkrun (for context)
    
    Returns:
        Language name (e.g., "English", "German", etc.)
    """
    if not url:
        return "English"  # Default fallback
    
    try:
        # Fetch the page content
        response = requests.get(url, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        html_content = response.text
        
        # Extract text from <main> tag (simplified)
        # In production, you'd want to use BeautifulSoup
        main_start = html_content.find('<main')
        if main_start == -1:
            main_start = html_content.find('<body')
        
        if main_start != -1:
            main_end = html_content.find('</main>', main_start)
            if main_end == -1:
                main_end = min(main_start + 5000, len(html_content))
            
            # Get first ~1000 characters of main content
            main_content = html_content[main_start:main_end][:1000]
            
            # Strip HTML tags (simple version)
            import re
            text_content = re.sub('<[^<]+?>', '', main_content)
            text_content = ' '.join(text_content.split())[:500]  # First 500 chars
            
            # Use OpenAI to detect language
            prompt = f"""Analyze the following text from a parkrun course page and identify the language.
Reply with ONLY the language name (e.g., "English", "German", "French", "Polish", etc.).

Text: {text_content}"""
            
            completion = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a language detection assistant. Reply with only the language name."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=10
            )
            
            language = completion.choices[0].message.content.strip()
            return language
        
        return "English"  # Default fallback
    
    except Exception as e:
        print(f"      Warning: Could not detect language for {parkrun_name}: {e}")
        return "English"  # Default fallback

def build_course_url(country_code: str, slug: str, countries_data: Dict) -> str:
    """
    Build the course page URL using country base URL and event slug.
    Format: https://[base_url]/[slug]/course/
    """
    country_info = countries_data.get(country_code, {})
    base_url = country_info.get('url', '')
    
    if not base_url or not slug:
        return ""
    
    # Add https:// if not present
    if not base_url.startswith('http'):
        base_url = f"https://{base_url}"
    
    # Build full URL
    return f"{base_url}/{slug}/course/"

def process_parkrun_feature(feature: Dict, countries_data: Dict, use_apis: bool = False) -> Dict:
    """
    Extract parkrun info from a GeoJSON feature.
    
    Args:
        feature: GeoJSON feature containing parkrun data
        countries_data: Country definitions from raw data
        use_apis: If True, call OpenAI/Google APIs for postcode and language
    """
    feature_id = feature.get('id', 'unknown')
    geometry = feature.get('geometry', {})
    properties = feature.get('properties', {})
    
    # Extract coordinates
    coordinates = geometry.get('coordinates', [])
    lon, lat = coordinates if len(coordinates) == 2 else (0, 0)
    
    # Extract properties
    slug = properties.get('eventname', '')
    short_name = properties.get('EventShortName', '')
    long_name = properties.get('EventLongName', '')
    location = properties.get('EventLocation', '')
    country_code = str(properties.get('countrycode', '0'))
    series_id = properties.get('seriesid', 1)
    
    # Determine if junior (series_id 2 = junior)
    is_junior = (series_id == 2)
    
    # Get country name
    country = get_country_name(country_code, countries_data)
    
    # Build course URL
    course_url = build_course_url(country_code, slug, countries_data)
    
    # Initialize with None
    postcode = None
    language = None
    
    # Call APIs if enabled
    if use_apis:
        # Get postcode from OpenAI (cheaper than Google!)
        if lat != 0 and lon != 0:
            postcode = get_postcode_from_coordinates(lat, lon, long_name, country)
            time.sleep(0.3)  # Rate limiting
        
        # Get language from OpenAI
        if course_url:
            language = get_language_from_url(course_url, long_name)
            time.sleep(0.3)  # Rate limiting for OpenAI
    
    return {
        "uid": feature_id,
        "short_name": short_name,
        "long_name": long_name,
        "slug": slug,
        "location": location,
        "coordinates": coordinates,
        "country": country,
        "is_junior": is_junior,
        "course_page_url": course_url,
        "postcode": postcode,
        "language": language
    }

def create_parkrun_info(test_mode: bool = True, limit: int = 15, use_apis: bool = False):
    """
    Create parkrun info JSON file.
    
    Args:
        test_mode: If True, only process first `limit` parkruns
        limit: Number of parkruns to process in test mode
        use_apis: If True, call OpenAI and Google APIs for postcode/language
    """
    print("=" * 60)
    print("Creating Parkrun Info JSON")
    print("=" * 60)
    
    if use_apis:
        print("\n⚠️  API MODE ENABLED - Will call OpenAI & Google APIs")
        print("   This will take longer and consume API credits")
        if not GOOGLE_API_KEY or not openai_client:
            print("   WARNING: API keys not found in .env file!")
            return
    else:
        print("\n📋 API MODE DISABLED - Postcode and language will be null")
    
    # Load raw data
    print("\n1. Loading raw parkrun data...")
    with open('../data/raw_parkrun_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    countries = data.get('countries', {})
    events = data.get('events', {})
    features = events.get('features', [])
    
    print(f"   ✓ Found {len(features)} parkruns")
    print(f"   ✓ Found {len(countries)} country definitions")
    
    # Process features
    print("\n2. Processing parkrun features...")
    if test_mode:
        print(f"   TEST MODE: Processing first {limit} parkruns only")
        features = features[:limit]
    
    parkrun_info = []
    for i, feature in enumerate(features, 1):
        info = process_parkrun_feature(feature, countries, use_apis=use_apis)
        parkrun_info.append(info)
        
        if i % 100 == 0 or (test_mode and use_apis):
            status = f"{i}/{len(features)} - {info['long_name']}"
            if use_apis:
                status += f" | PC: {info['postcode'] or 'N/A'} | Lang: {info['language'] or 'N/A'}"
            print(f"   {status}")
    
    print(f"   ✓ Processed {len(parkrun_info)} parkruns")
    
    # Create output
    output = {
        "metadata": {
            "version": "1.0",
            "description": "Gold standard parkrun information - basic event details",
            "total_events": len(parkrun_info),
            "test_mode": test_mode,
            "apis_used": use_apis,
            "notes": "postcode and language from OpenAI GPT-4o-mini" if use_apis else "postcode and language set to null"
        },
        "events": parkrun_info
    }
    
    # Save to file
    output_file = "../data/01_gold_parkrun_info.json"
    print(f"\n3. Saving to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"   ✓ Saved successfully")
    
    # Show sample
    print("\n4. Sample output (first 3 parkruns):")
    for i, info in enumerate(parkrun_info[:3], 1):
        print(f"\n   {i}. {info['long_name']}")
        print(f"      UID: {info['uid']}")
        print(f"      Slug: {info['slug']}")
        print(f"      Location: {info['location']}")
        print(f"      Country: {info['country']}")
        print(f"      Is Junior: {info['is_junior']}")
        print(f"      Course URL: {info['course_page_url']}")
        print(f"      Coordinates: {info['coordinates']}")
        if use_apis:
            print(f"      Postcode: {info['postcode']}")
            print(f"      Language: {info['language']}")
    
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)
    print(f"\nOutput file: {output_file}")
    print(f"Total parkruns: {len(parkrun_info)}")
    
    if use_apis:
        with_postcodes = sum(1 for p in parkrun_info if p['postcode'])
        with_languages = sum(1 for p in parkrun_info if p['language'])
        print(f"With postcodes: {with_postcodes}/{len(parkrun_info)}")
        print(f"With languages: {with_languages}/{len(parkrun_info)}")
    
    print("\nNext steps:")
    if not use_apis:
        print("1. Review the output file")
        print("2. Run with use_apis=True to add postcode/language")
        print("3. Run full dataset (set test_mode=False)")
    else:
        print("1. Review the output file")
        print("2. Run full dataset (set test_mode=False) if satisfied")

if __name__ == "__main__":
    # Run FULL dataset with OpenAI APIs
    create_parkrun_info(test_mode=False, use_apis=True)
