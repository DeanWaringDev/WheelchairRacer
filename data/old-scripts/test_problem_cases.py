"""
Test Improved Scraper on Problem Cases

Tests the improved scraping on the specific parkrun events that were problematic:
- Bushy: Should capture course description "A fast, flat course..."
- Banstead: Should find postcode SW19 5NR (it's actually in Wimbledon, not Banstead)
- Woodhouse Moor: Should find postcode LS6 1AN
"""

import json
from scrape_parkrun_details import scrape_course_page

def test_problem_cases():
    """Test the specific problem cases identified"""
    print("🧪 Testing Improved Scraper on Problem Cases")
    print("=" * 70)
    
    test_cases = [
        {
            'name': 'Bushy parkrun',
            'url': 'https://www.parkrun.org.uk/bushy/course',
            'should_contain': 'A fast, flat course',
            'expected_postcode': 'KT8 9AE'
        },
        {
            'name': 'Banstead Woods parkrun',
            'url': 'https://www.parkrun.org.uk/banstead/course',
            'should_contain': None,  # Just check if we get more content
            'expected_postcode': 'CR5 3NR'  # This is the actual car park postcode
        },
        {
            'name': 'Woodhouse Moor parkrun',
            'url': 'https://www.parkrun.org.uk/woodhousemoor/course',
            'should_contain': None,
            'expected_postcode': 'LS6 1AN'
        }
    ]
    
    for idx, test in enumerate(test_cases, 1):
        print(f"\n[{idx}/3] Testing: {test['name']}")
        print("-" * 70)
        print(f"URL: {test['url']}")
        
        description, postcode = scrape_course_page(test['url'])
        
        if description:
            print(f"✅ Description captured: {len(description)} characters")
            
            # Check for specific content if expected
            if test['should_contain']:
                if test['should_contain'] in description:
                    print(f"✅ FOUND key text: '{test['should_contain']}'")
                else:
                    print(f"⚠️  MISSING key text: '{test['should_contain']}'")
                    print(f"   First 300 chars: {description[:300]}...")
        else:
            print("❌ No description captured")
        
        if postcode:
            print(f"✅ Postcode found: {postcode}")
            if test['expected_postcode'] and postcode == test['expected_postcode']:
                print(f"✅ CORRECT postcode!")
            elif test['expected_postcode']:
                print(f"⚠️  Expected: {test['expected_postcode']}, Got: {postcode}")
        else:
            print(f"❌ No postcode found (expected: {test['expected_postcode']})")
        
        print()
    
    print("=" * 70)
    print("\n✨ Testing complete! Review results above.")

if __name__ == '__main__':
    test_problem_cases()
