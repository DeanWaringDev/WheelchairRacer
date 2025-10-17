"""
Parkrun Course Details Scraper

This script scrapes detailed information from parkrun course pages including:
- Course descriptions (from h2, h3, p tags and text nodes)
- Postcodes (from 'getting there by road' sections)

Usage:
    python scrape_parkrun_details.py

Output:
    parkrun_detail.json - Detailed course information for all parkrun events
"""

import json
import requests
from bs4 import BeautifulSoup
import time
import re
from typing import Dict, List, Optional
from datetime import datetime

# Configuration
INPUT_FILE = 'silver_data.json'
OUTPUT_FILE = 'parkrun_detail.json'
RATE_LIMIT_DELAY = 1.0  # Seconds between requests (respectful scraping)
REQUEST_TIMEOUT = 10  # Seconds
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

# UK Postcode regex pattern
# Matches formats like: SW1A 1AA, EC1A 1BB, W1A 0AX, etc.
UK_POSTCODE_PATTERN = re.compile(
    r'\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})\b',
    re.IGNORECASE
)

def load_silver_data() -> Dict:
    """Load the silver_data.json file"""
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_text_content(soup: BeautifulSoup) -> str:
    """
    Extract ALL relevant text content from the page.
    This is critical for accessibility analysis - we need every detail.
    
    Args:
        soup: BeautifulSoup object of the page
        
    Returns:
        Combined text content as a single string
    """
    text_parts = []
    
    # Find the main content area (usually div with id 'primary' or class 'content')
    main_content = soup.find('div', id='primary') or soup.find('main') or soup
    
    if not main_content:
        main_content = soup
    
    # Strategy: Get ALL text from all relevant tags, including div, span, li, etc.
    # This ensures we capture everything including course descriptions not in p tags
    relevant_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'li', 'td', 'th', 'strong', 'em', 'b', 'i']
    
    # Get all text-containing elements
    seen_texts = set()  # Avoid duplicates
    
    for tag in main_content.find_all(relevant_tags):
        # Get direct text from this tag (not from children)
        direct_text = tag.find(text=True, recursive=False)
        if direct_text:
            text = direct_text.strip()
            if text and len(text) > 3 and text not in seen_texts:
                text_parts.append(text)
                seen_texts.add(text)
        
        # Also get complete text from certain important tags
        if tag.name in ['h1', 'h2', 'h3', 'h4', 'p', 'li']:
            full_text = tag.get_text(strip=True)
            if full_text and len(full_text) > 5 and full_text not in seen_texts:
                text_parts.append(full_text)
                seen_texts.add(full_text)
    
    # Also capture any standalone text nodes not in tags
    for text_node in main_content.find_all(text=True):
        text = text_node.strip()
        if text and len(text) > 10 and text not in seen_texts:
            # Skip script and style content
            parent = text_node.parent
            if parent and parent.name not in ['script', 'style', 'noscript', 'meta', 'link']:
                text_parts.append(text)
                seen_texts.add(text)
    
    # Join all text parts with newlines
    description = '\n\n'.join(text_parts)
    
    return description.strip()

def find_postcode_in_section(soup: BeautifulSoup) -> Optional[str]:
    """
    Find postcode anywhere on the page - search thoroughly.
    This is important for location data.
    
    Args:
        soup: BeautifulSoup object of the page
        
    Returns:
        Postcode string if found, None otherwise
    """
    # Strategy 1: Look in common sections first
    priority_sections = []
    
    # Find headings that might contain location info
    for heading in soup.find_all(['h2', 'h3', 'h4']):
        text = heading.get_text().lower()
        if any(phrase in text for phrase in [
            'getting there', 'by road', 'by car', 'driving', 'on foot',
            'location', 'address', 'directions', 'how to find', 'parking'
        ]):
            priority_sections.append(heading)
    
    # Search priority sections first
    for section in priority_sections:
        # Get the heading and next few siblings
        search_text = section.get_text() + " "
        current = section
        for _ in range(10):  # Check next 10 elements
            current = current.find_next_sibling()
            if current:
                search_text += " " + current.get_text()
            else:
                break
        
        # Search for UK postcode pattern
        match = UK_POSTCODE_PATTERN.search(search_text)
        if match:
            postcode = f"{match.group(1).upper()} {match.group(2).upper()}"
            return postcode
    
    # Strategy 2: Search the entire page text if not found in priority sections
    full_text = soup.get_text()
    
    # Find ALL postcode matches on the page
    all_matches = UK_POSTCODE_PATTERN.findall(full_text)
    
    if all_matches:
        # Take the first match (usually the most relevant)
        first_match = all_matches[0]
        postcode = f"{first_match[0].upper()} {first_match[1].upper()}"
        return postcode
    
    return None

def scrape_course_page(url: str) -> tuple[Optional[str], Optional[str]]:
    """
    Scrape a single parkrun course page.
    
    Args:
        url: The course page URL
        
    Returns:
        Tuple of (description, postcode) - either can be None if not found
    """
    try:
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract description
        description = extract_text_content(soup)
        
        # Find postcode
        postcode = find_postcode_in_section(soup)
        
        return description, postcode
        
    except requests.RequestException as e:
        print(f"  ⚠️  Error fetching {url}: {str(e)}")
        return None, None
    except Exception as e:
        print(f"  ⚠️  Error parsing {url}: {str(e)}")
        return None, None

def create_detail_json(silver_data: Dict) -> Dict:
    """
    Create the parkrun_detail.json structure by scraping course pages.
    
    Args:
        silver_data: The loaded silver_data.json data
        
    Returns:
        Dictionary ready to be saved as parkrun_detail.json
    """
    events = silver_data.get('events', [])
    total_events = len(events)
    
    print(f"\n📊 Starting to scrape {total_events} parkrun course pages...")
    print(f"⏱️  Estimated time: ~{(total_events * RATE_LIMIT_DELAY) / 60:.1f} minutes")
    print(f"🤝 Using respectful rate limiting ({RATE_LIMIT_DELAY}s between requests)\n")
    
    detail_events = []
    success_count = 0
    postcode_found_count = 0
    
    for idx, event in enumerate(events, 1):
        uid = event.get('uid')
        name = event.get('name')
        slug = event.get('slug')
        course_url = event.get('coursePageUrl')
        
        print(f"[{idx}/{total_events}] {name} ({slug})...")
        
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
                    postcode_found_count += 1
                    print(f"  ✅ Scraped successfully (postcode: {postcode})")
                else:
                    print(f"  ✅ Scraped successfully (no postcode found)")
            else:
                detail['scrapingStatus'] = 'failed'
                print(f"  ❌ Scraping failed")
        else:
            detail['scrapingStatus'] = 'no_url'
            print(f"  ⚠️  No course URL available")
        
        detail_events.append(detail)
        
        # Rate limiting - be respectful to parkrun servers
        if idx < total_events:  # Don't wait after the last request
            time.sleep(RATE_LIMIT_DELAY)
    
    # Create output structure
    output = {
        'metadata': {
            'version': '1.0',
            'created': datetime.now().isoformat(),
            'description': 'Detailed parkrun course information including descriptions and postcodes',
            'total_events': total_events,
            'scraping_summary': {
                'successful_scrapes': success_count,
                'postcodes_found': postcode_found_count,
                'failed_scrapes': total_events - success_count,
                'rate_limit_delay': RATE_LIMIT_DELAY
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
    
    return output

def save_detail_json(data: Dict):
    """Save the detail data to JSON file"""
    print(f"\n💾 Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved successfully!")

def main():
    """Main execution flow"""
    print("🏃 Parkrun Course Details Scraper")
    print("=" * 50)
    
    # Load silver data
    silver_data = load_silver_data()
    
    # Create detail data by scraping
    detail_data = create_detail_json(silver_data)
    
    # Save to file
    save_detail_json(detail_data)
    
    # Print summary
    summary = detail_data['metadata']['scraping_summary']
    print("\n" + "=" * 50)
    print("📈 SCRAPING SUMMARY")
    print("=" * 50)
    print(f"Total events:       {detail_data['metadata']['total_events']}")
    print(f"Successful scrapes: {summary['successful_scrapes']}")
    print(f"Postcodes found:    {summary['postcodes_found']}")
    print(f"Failed scrapes:     {summary['failed_scrapes']}")
    print(f"Success rate:       {(summary['successful_scrapes'] / detail_data['metadata']['total_events'] * 100):.1f}%")
    print("=" * 50)
    print("\n✨ Done! You can now move on to the data analysis stage.\n")

if __name__ == '__main__':
    main()
