#!/usr/bin/env python3
"""
Silver Data Processing Script for Parkrun Events
===============================================

This script processes bronze-level parkrun data to create silver-level data with:
- Google Maps URLs generated from coordinates
- Course descriptions scraped from parkrun websites  
- Enhanced metadata for wheelchair accessibility analysis
- Robust error handling and rate limiting for web scraping

Author: Wheelchair Racer Project
Created: 2025-10-16
"""

import json
import sys
import time
import requests
from pathlib import Path
from urllib.parse import urljoin
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('silver_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SilverEvent:
    """Enhanced event data structure for silver level."""
    uid: int
    name: str
    slug: str
    shortName: str
    location: str
    coordinates: List[float]
    country: str
    baseUrl: str
    junior: bool
    # Silver-level enhancements
    coursePageUrl: str
    courseMapUrl: Optional[str] = None  # The actual course map with route highlighted
    scrapingStatus: str = "pending"
    lastUpdated: str = ""

class SilverProcessor:
    """Processes bronze data to silver level with web scraping capabilities."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.processed_count = 0
        self.error_count = 0
        self.rate_limit_delay = 2.5  # seconds between requests - being respectful!
        
    def load_bronze_data(self) -> Dict:
        """Load bronze-level data from JSON file."""
        try:
            with open('bronze_data.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"Loaded bronze data with {len(data.get('events', []))} events")
            return data
        except FileNotFoundError:
            logger.error("bronze_data.json not found in current directory")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format in bronze_data.json: {e}")
            sys.exit(1)



    def generate_course_page_url(self, base_url: str, slug: str) -> str:
        """Generate parkrun course page URL."""
        if not base_url:
            return ""
        
        # Handle different URL formats
        if base_url.startswith('www.'):
            base_url = f"https://{base_url}"
        elif not base_url.startswith('http'):
            base_url = f"https://{base_url}"
            
        return urljoin(base_url, f"/{slug}/course")

    def scrape_course_map_url(self, course_url: str) -> Optional[str]:
        """
        Scrape course map URL from parkrun course page.
        
        Returns:
            Google Maps embed URL with course route highlighted, or None if not found
        """
        if not course_url:
            return None
            
        try:
            logger.debug(f"Scraping course map from: {course_url}")
            
            response = self.session.get(course_url, timeout=10)
            response.raise_for_status()
            
            content = response.text
            
            # Extract Google Maps iframe URL with course route
            import re
            
            # Look for iframe with Google Maps embed
            iframe_pattern = r'<iframe[^>]*src=["\']([^"\']*maps[^"\']*)["\'][^>]*>'
            iframe_matches = re.findall(iframe_pattern, content, re.IGNORECASE)
            
            for iframe_url in iframe_matches:
                if 'google.com/maps' in iframe_url and ('embed' in iframe_url or 'pb=' in iframe_url):
                    logger.debug(f"Found course map URL: {iframe_url[:100]}...")
                    return iframe_url
            
            # Alternative: look for maps URLs in the page content
            maps_pattern = r'https://[^"\s]*google\.com/maps[^"\s]*'
            maps_matches = re.findall(maps_pattern, content)
            
            for maps_url in maps_matches:
                if 'embed' in maps_url or 'pb=' in maps_url:
                    logger.debug(f"Found alternative course map URL: {maps_url[:100]}...")
                    return maps_url
            
            logger.debug("No course map URL found")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.warning(f"Failed to scrape {course_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error scraping {course_url}: {e}")
            return None

    def process_event(self, event_data: Dict) -> SilverEvent:
        """Process a single event from bronze to silver level."""
        
        # Create course page URL
        course_page_url = self.generate_course_page_url(
            event_data.get('baseUrl', ''), 
            event_data['slug']
        )
        
        # Create silver event object
        silver_event = SilverEvent(
            uid=event_data['uid'],
            name=event_data['name'],
            slug=event_data['slug'],
            shortName=event_data['shortName'],
            location=event_data['location'],
            coordinates=event_data['coordinates'],
            country=event_data['country'],
            baseUrl=event_data.get('baseUrl', ''),
            junior=event_data['junior'],
            coursePageUrl=course_page_url,
            lastUpdated="2025-10-16"
        )
        
        return silver_event

    def process_events_batch(self, events: List[Dict], batch_size: int = 50, enable_scraping: bool = False) -> List[Dict]:
        """
        Process a batch of events with optional web scraping.
        
        Args:
            events: List of bronze event data
            batch_size: Maximum number of events to process  
            enable_scraping: Whether to scrape course descriptions (slow!)
        """
        processed_events = []
        
        for i, event_data in enumerate(events[:batch_size]):
            try:
                # Process basic silver-level data
                silver_event = self.process_event(event_data)
                
                # Optional web scraping (rate limited)
                if enable_scraping and silver_event.coursePageUrl:
                    course_map = self.scrape_course_map_url(silver_event.coursePageUrl)
                    silver_event.courseMapUrl = course_map
                    silver_event.scrapingStatus = "completed" if course_map else "failed"
                    
                    # Rate limiting
                    time.sleep(self.rate_limit_delay)
                else:
                    silver_event.scrapingStatus = "skipped"
                
                # Convert to dict for JSON serialization
                event_dict = {
                    'uid': silver_event.uid,
                    'name': silver_event.name,
                    'slug': silver_event.slug,
                    'shortName': silver_event.shortName,
                    'location': silver_event.location,
                    'coordinates': silver_event.coordinates,
                    'country': silver_event.country,
                    'baseUrl': silver_event.baseUrl,
                    'junior': silver_event.junior,
                    'coursePageUrl': silver_event.coursePageUrl,
                    'courseMapUrl': silver_event.courseMapUrl,
                    'scrapingStatus': silver_event.scrapingStatus,
                    'lastUpdated': silver_event.lastUpdated
                }
                
                processed_events.append(event_dict)
                self.processed_count += 1
                
                # Progress reporting - more frequent for long runs
                if (i + 1) % 50 == 0:
                    progress = (i + 1) / min(batch_size, len(events)) * 100
                    elapsed_time = (i + 1) * self.rate_limit_delay / 60  # minutes
                    remaining_time = ((min(batch_size, len(events)) - i - 1) * self.rate_limit_delay) / 60
                    logger.info(f"Progress: {i + 1}/{min(batch_size, len(events))} ({progress:.1f}%) - Elapsed: {elapsed_time:.1f}min, Remaining: ~{remaining_time:.1f}min")
                elif (i + 1) % 10 == 0:
                    logger.info(f"Processed {i + 1}/{min(batch_size, len(events))} events")
                    
            except Exception as e:
                logger.error(f"Error processing event {event_data.get('uid', 'unknown')}: {e}")
                self.error_count += 1
                continue
        
        return processed_events

    def create_silver_data(self, bronze_data: Dict, processed_events: List[Dict]) -> Dict:
        """Create the final silver data structure."""
        
        silver_data = {
            "metadata": {
                "version": "2.0",
                "level": "silver",
                "created": "2025-10-16",
                "description": "Silver level parkrun data with Google Maps URLs and enhanced metadata",
                "total_events": len(processed_events),
                "processing_summary": {
                    "processed_count": self.processed_count,
                    "error_count": self.error_count,
                    "scraping_enabled": any(e.get('scrapingStatus') == 'completed' for e in processed_events)
                },
                "schema": {
                    "uid": "Unique identifier from bronze data",
                    "name": "Full event name",
                    "slug": "URL slug",
                    "shortName": "Short display name",
                    "location": "Event location description",
                    "coordinates": "[longitude, latitude]",
                    "country": "Country name",
                    "baseUrl": "Base parkrun URL for country",
                    "junior": "Boolean - true if junior parkrun",
                    "coursePageUrl": "Parkrun course description page URL",
                    "courseMapUrl": "Google Maps embed URL with course route highlighted",
                    "scrapingStatus": "Status of web scraping attempt",
                    "lastUpdated": "Processing date"
                }
            },
            "events": processed_events
        }
        
        return silver_data

    def save_silver_data(self, silver_data: Dict, filename: str = "silver_data.json"):
        """Save silver data to JSON file."""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(silver_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Successfully saved silver data to {filename}")
        except Exception as e:
            logger.error(f"Error saving silver data: {e}")
            sys.exit(1)

def main():
    """Main processing function."""
    print("🔄 Processing bronze data to silver level...")
    
    processor = SilverProcessor()
    
    # Load bronze data
    print("📂 Loading bronze data...")
    bronze_data = processor.load_bronze_data()
    
    # Determine batch size and processing mode from command line
    if len(sys.argv) > 1:
        if sys.argv[1] == "all":
            batch_size = len(bronze_data['events'])  # Process all 2,747 events
            enable_scraping = True
        elif sys.argv[1] == "sample":
            batch_size = 5  # Process small sample
            enable_scraping = True
        else:
            try:
                batch_size = int(sys.argv[1])
                batch_size = min(batch_size, len(bronze_data['events']))
                enable_scraping = True
            except ValueError:
                print("❌ Invalid batch size. Use 'all', 'sample', or a number.")
                return
    else:
        batch_size = 50  # Default batch size
        enable_scraping = True
    
    print(f"⚙️  Processing {batch_size} events (scraping: {'enabled' if enable_scraping else 'disabled'})...")
    print(f"⏰ Estimated time: ~{(batch_size * 2.5) // 60:.0f} minutes with rate limiting")
    print("🤖 Being respectful to Parkrun servers with 2.5 second delays...")
    
    processed_events = processor.process_events_batch(
        bronze_data['events'], 
        batch_size=batch_size,
        enable_scraping=enable_scraping
    )
    
    # Create silver data structure
    print("🔧 Creating silver data structure...")
    silver_data = processor.create_silver_data(bronze_data, processed_events)
    
    # Save result with batch info in filename if not processing all
    filename = "silver_data.json" if batch_size == len(bronze_data['events']) else f"silver_data_batch_{batch_size}.json"
    print(f"💾 Saving silver data to {filename}...")
    processor.save_silver_data(silver_data, filename)
    
    print(f"✅ Successfully created {filename} with {len(processed_events)} events")
    print(f"📊 Processing Summary:")
    print(f"   • Processed: {processor.processed_count}")
    print(f"   • Errors: {processor.error_count}")
    print(f"   • Scraping: {'enabled' if enable_scraping else 'disabled'}")
    
    if enable_scraping:
        completed_scraping = sum(1 for e in processed_events if e.get('scrapingStatus') == 'completed')
        print(f"   • Successfully scraped: {completed_scraping}")
    
    print("🎉 Silver data processing complete!")

if __name__ == "__main__":
    main()