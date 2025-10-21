"""
Test Parkrun Scraper with JSON Output

Creates a sample parkrun_detail.json with 10 test events so you can review
the structure and data quality before running the full scrape.
"""

import json
from scrape_parkrun_details import scrape_course_page
from datetime import datetime
import time

def create_test_json():
    """Create a test JSON with 10 sample events"""
    print("🧪 Creating Test JSON with 10 Sample Events")
    print("=" * 60)
    
    # Load silver data
    print("\n📂 Loading silver_data.json...")
    with open('silver_data.json', 'r', encoding='utf-8') as f:
        silver_data = json.load(f)
    
    # Get first 10 events
    sample_events = silver_data['events'][:10]
    print(f"✅ Loaded {len(sample_events)} events for testing\n")
    
    detail_events = []
    success_count = 0
    postcode_count = 0
    
    for idx, event in enumerate(sample_events, 1):
        uid = event.get('uid')
        name = event.get('name')
        slug = event.get('slug')
        course_url = event.get('coursePageUrl')
        
        print(f"[{idx}/10] Scraping {name}...")
        
        # Create base detail object
        detail = {
            'uid': uid,
            'name': name,
            'slug': slug,
            'coursePageUrl': course_url,
            'description': None,
            'postcode': None,
            'scrapingStatus': 'pending',
            'scrapedAt': None
        }
        
        # Scrape if URL exists
        if course_url:
            description, postcode = scrape_course_page(course_url)
            
            if description:
                detail['description'] = description
                detail['scrapingStatus'] = 'success'
                detail['scrapedAt'] = datetime.now().isoformat()
                success_count += 1
                
                if postcode:
                    detail['postcode'] = postcode
                    postcode_count += 1
                    print(f"  ✅ Success (postcode: {postcode})")
                else:
                    print(f"  ✅ Success (no postcode)")
            else:
                detail['scrapingStatus'] = 'failed'
                print(f"  ❌ Failed")
        else:
            detail['scrapingStatus'] = 'no_url'
            print(f"  ⚠️  No URL")
        
        detail_events.append(detail)
        
        # Rate limiting
        if idx < 10:
            time.sleep(1.0)
    
    # Create test output structure
    output = {
        'metadata': {
            'version': '1.0-TEST',
            'created': datetime.now().isoformat(),
            'description': 'TEST VERSION - Sample of 10 parkrun events for review',
            'total_events': 10,
            'scraping_summary': {
                'successful_scrapes': success_count,
                'postcodes_found': postcode_count,
                'failed_scrapes': 10 - success_count,
                'rate_limit_delay': 1.0
            },
            'schema': {
                'uid': 'Unique identifier from silver data',
                'name': 'Full event name',
                'slug': 'URL slug',
                'coursePageUrl': 'Parkrun course description page URL',
                'description': 'Full course description text from h2, h3, p tags',
                'postcode': 'Postcode from getting there by road section (UK events)',
                'scrapingStatus': 'Status: success, failed, no_url, pending',
                'scrapedAt': 'ISO timestamp of when page was scraped'
            }
        },
        'events': detail_events
    }
    
    # Save to test file
    output_file = 'parkrun_detail_TEST.json'
    print(f"\n💾 Saving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved successfully!\n")
    
    # Print summary
    print("=" * 60)
    print("📊 TEST SCRAPING SUMMARY")
    print("=" * 60)
    print(f"Total events:       {output['metadata']['total_events']}")
    print(f"Successful scrapes: {success_count}/10")
    print(f"Postcodes found:    {postcode_count}/10")
    print(f"Failed scrapes:     {10 - success_count}/10")
    print(f"Success rate:       {(success_count / 10 * 100):.1f}%")
    print("=" * 60)
    
    # Show sample of first event
    if detail_events and detail_events[0].get('description'):
        first_event = detail_events[0]
        print(f"\n📄 SAMPLE - First Event ({first_event['name']}):")
        print("-" * 60)
        desc = first_event['description']
        preview = desc[:400] + "..." if len(desc) > 400 else desc
        print(preview)
        print("-" * 60)
        print(f"Full length: {len(desc)} characters")
        if first_event.get('postcode'):
            print(f"Postcode: {first_event['postcode']}")
    
    print("\n✨ Review the test file: parkrun_detail_TEST.json")
    print("   If it looks good, run: python scrape_parkrun_details.py")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    create_test_json()
