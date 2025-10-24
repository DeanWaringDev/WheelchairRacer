"""
Script: 03_create_parkrun_maps.py
Purpose: Extract Google Maps URLs from parkrun course pages
Stage: 1 of 3 (URL extraction only)

This script:
1. Loads parkrun info from 01_gold_parkrun_info.json
2. Scrapes each course page to find the Google Maps URL
3. Creates 03_gold_parkrun_maps.json with initial structure
4. Sets kml_file, gpx_file to null (populated later manually/Stage 3)

Output Schema:
{
    "uid": 1,
    "slug": "bushy",
    "google_maps_url": "https://maps.google.com/...",
    "kml_file": null,
    "gpx_file": null,
    "has_kml": false,
    "has_gpx": false
}
"""

import json
import requests
from bs4 import BeautifulSoup
import time
import os
from pathlib import Path

def load_parkrun_info():
    """Load parkrun info from 01_gold_parkrun_info.json"""
    input_file = Path(__file__).parent.parent / 'data' / '01_gold_parkrun_info.json'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract events array from metadata wrapper
    if isinstance(data, dict) and 'events' in data:
        return data['events']
    return data

def extract_google_maps_url(course_url):
    """
    Scrape the course page and extract the Google Maps URL
    
    Returns:
        str: Google Maps URL if found, empty string if not found
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(course_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for Google Maps links
        # Common patterns:
        # 1. <a href="https://maps.google.com/...">
        # 2. <iframe src="https://www.google.com/maps/...">
        # 3. Links with text containing "map" or "course map"
        
        # Method 1: Find all links containing Google Maps patterns
        # Pattern variations: maps.google.com, google.com/maps, google.co.uk/maps, etc.
        for link in soup.find_all('a', href=True):
            href = link['href']
            if 'google' in href and '/maps' in href:
                return href
        
        # Method 2: Check iframes (more common for embedded maps)
        for iframe in soup.find_all('iframe', src=True):
            src = iframe['src']
            if 'google' in src and '/maps' in src:
                return src
        
        # If no URL found
        return ""
        
    except Exception as e:
        print(f"  ⚠️  Error scraping {course_url}: {str(e)}")
        return ""

def create_parkrun_maps(test_mode=False):
    """
    Main function to create parkrun maps JSON
    
    Args:
        test_mode: If True, only process first 5 parkruns for testing
    """
    print("=" * 60)
    print("Creating Parkrun Maps JSON - Stage 1: URL Extraction")
    print("=" * 60)
    print()
    
    # Load parkrun info
    print("1. Loading data...")
    parkruns = load_parkrun_info()
    
    if test_mode:
        parkruns = parkruns[:5]
        print(f"✓ TEST MODE: Processing first {len(parkruns)} parkruns")
    else:
        print(f"✓ Loaded {len(parkruns)} parkruns from 01_gold_parkrun_info.json")
    
    print()
    print(f"2. Extracting Google Maps URLs from {len(parkruns)} parkruns...")
    print()
    
    # Process each parkrun
    results = []
    found_count = 0
    missing_count = 0
    
    for i, parkrun in enumerate(parkruns, 1):
        uid = parkrun['uid']
        slug = parkrun['slug']
        course_url = parkrun['course_page_url']
        
        print(f"[{i}/{len(parkruns)}] {slug}...", end=" ", flush=True)
        
        # Extract Google Maps URL
        google_maps_url = extract_google_maps_url(course_url)
        
        if google_maps_url:
            print("✓ Found")
            found_count += 1
        else:
            print("✗ Not found")
            missing_count += 1
        
        # Create result object
        result = {
            "uid": uid,
            "slug": slug,
            "google_maps_url": google_maps_url,
            "kml_file": None,
            "gpx_file": None,
            "has_kml": False,
            "has_gpx": False
        }
        
        results.append(result)
        
        # Progress reporting every 100 parkruns
        if i % 100 == 0:
            print(f"   Progress: {i}/{len(parkruns)} ({i/len(parkruns)*100:.1f}%)")
            print(f"   Found: {found_count} | Missing: {missing_count}")
            print()
        
        # Rate limiting - be nice to parkrun servers
        time.sleep(0.5)
    
    print()
    print("3. Saving results...")
    
    # Save to JSON
    output_file = Path(__file__).parent.parent / 'data' / '03_gold_parkrun_maps.json'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to {output_file}")
    print()
    print("=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)
    print()
    print("STATISTICS:")
    print(f"  Total parkruns: {len(results)}")
    print(f"  Google Maps URLs found: {found_count} ({found_count/len(results)*100:.1f}%)")
    print(f"  Google Maps URLs missing: {missing_count} ({missing_count/len(results)*100:.1f}%)")
    print()
    print("NEXT STEPS:")
    print("  1. Review parkruns with missing Google Maps URLs")
    print("  2. Manually download KML files for all parkruns")
    print("     - Save as: data/kml/{slug}.kml")
    print("  3. Run Stage 3 script to convert KML→GPX and update JSON")
    print()

if __name__ == "__main__":
    # Run in test mode first
    # Change to test_mode=False for full 2,747 parkruns
    create_parkrun_maps(test_mode=False)
