"""
Test Parkrun Scraper

Tests the scraping logic on a small sample of events before running the full scrape.
This helps verify the scraping is working correctly and allows you to check the output.
"""

import json
from scrape_parkrun_details import scrape_course_page, extract_text_content, find_postcode_in_section
from bs4 import BeautifulSoup
import requests

def test_single_event():
    """Test scraping on Bushy parkrun (the first ever parkrun)"""
    print("🧪 Testing on Bushy parkrun...")
    print("=" * 50)
    
    url = "https://www.parkrun.org.uk/bushy/course"
    print(f"URL: {url}\n")
    
    description, postcode = scrape_course_page(url)
    
    if description:
        print("✅ Description extracted successfully!")
        print(f"\nFirst 500 characters:")
        print("-" * 50)
        print(description[:500] + "..." if len(description) > 500 else description)
        print("-" * 50)
        print(f"\nTotal length: {len(description)} characters")
    else:
        print("❌ Failed to extract description")
    
    if postcode:
        print(f"\n✅ Postcode found: {postcode}")
    else:
        print("\n⚠️  No postcode found")
    
    print("\n" + "=" * 50)

def test_sample_events():
    """Test on a sample of 5 events from different countries"""
    print("\n🧪 Testing on sample of 5 events...")
    print("=" * 50)
    
    # Load silver data
    with open('silver_data.json', 'r', encoding='utf-8') as f:
        silver_data = json.load(f)
    
    # Get first 5 events
    sample_events = silver_data['events'][:5]
    
    results = []
    
    for event in sample_events:
        name = event['name']
        url = event.get('coursePageUrl')
        
        print(f"\n📍 {name}")
        print(f"   URL: {url}")
        
        if url:
            description, postcode = scrape_course_page(url)
            
            desc_status = "✅" if description else "❌"
            post_status = f"✅ {postcode}" if postcode else "⚠️  None"
            
            print(f"   Description: {desc_status} ({len(description) if description else 0} chars)")
            print(f"   Postcode: {post_status}")
            
            results.append({
                'name': name,
                'description_length': len(description) if description else 0,
                'postcode': postcode,
                'success': bool(description)
            })
        else:
            print("   ⚠️  No URL available")
            results.append({
                'name': name,
                'description_length': 0,
                'postcode': None,
                'success': False
            })
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    success_count = sum(1 for r in results if r['success'])
    postcode_count = sum(1 for r in results if r['postcode'])
    
    print(f"Events tested: {len(results)}")
    print(f"Successful: {success_count}/{len(results)}")
    print(f"Postcodes found: {postcode_count}/{len(results)}")
    
    avg_length = sum(r['description_length'] for r in results) / len(results)
    print(f"Average description length: {avg_length:.0f} characters")
    
    print("\n✅ Test complete! If results look good, run the full script.")
    print("   Command: python scrape_parkrun_details.py")
    print("=" * 50)

if __name__ == '__main__':
    print("🏃 Parkrun Scraper Test Suite\n")
    
    # Test 1: Single event
    test_single_event()
    
    # Test 2: Sample of events
    test_sample_events()
