#!/usr/bin/env python3
"""
Batch Silver Data Processing Script for Parkrun Events
====================================================

This script processes bronze-level parkrun data in batches to create silver-level data.
It saves progress after each batch to prevent data loss from interruptions.

Features:
- Batch processing with configurable batch size
- Progress saving and resumption
- Rate limiting for respectful web scraping
- Comprehensive error handling
- Detailed logging and progress tracking

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
from datetime import datetime
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ProcessingState:
    """Tracks the current processing state"""
    last_processed_index: int = 0
    processed_count: int = 0
    error_count: int = 0
    batch_number: int = 0
    last_save_time: str = ""

class BatchSilverProcessor:
    def __init__(self, rate_limit_delay: float = 2.5, batch_size: int = 25):
        self.rate_limit_delay = rate_limit_delay
        self.batch_size = batch_size
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Files
        self.bronze_file = Path('bronze_data.json')
        self.silver_file = Path('silver_data.json')
        self.state_file = Path('silver_processing_state.json')
        
    def load_processing_state(self) -> ProcessingState:
        """Load the current processing state from file"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    state_data = json.load(f)
                return ProcessingState(**state_data)
            except Exception as e:
                logger.warning(f"Could not load processing state: {e}")
        
        return ProcessingState()
    
    def save_processing_state(self, state: ProcessingState):
        """Save the current processing state to file"""
        state.last_save_time = datetime.now().isoformat()
        with open(self.state_file, 'w') as f:
            json.dump(state.__dict__, f, indent=2)
    
    def load_existing_silver_data(self) -> Dict:
        """Load existing silver data if it exists"""
        if self.silver_file.exists():
            try:
                with open(self.silver_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Could not load existing silver data: {e}")
        
        # Return default structure
        return {
            "metadata": {
                "version": "2.0",
                "level": "silver",
                "created": datetime.now().strftime("%Y-%m-%d"),
                "description": "Silver level parkrun data with Google Maps URLs and enhanced metadata",
                "total_events": 0,
                "processing_summary": {
                    "processed_count": 0,
                    "error_count": 0,
                    "scraping_enabled": True
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
            "events": []
        }
    
    def scrape_course_map_url(self, course_url: str) -> Tuple[Optional[str], str]:
        """
        Extract Google Maps embed URL from parkrun course page
        Returns: (map_url, status)
        """
        try:
            response = self.session.get(course_url, timeout=10)
            response.raise_for_status()
            
            # Look for Google Maps iframe with embedded route
            iframe_pattern = r'<iframe[^>]+src="(https://www\.google\.com/maps/d/embed[^"]+)"[^>]*></iframe>'
            match = re.search(iframe_pattern, response.text, re.IGNORECASE)
            
            if match:
                return match.group(1), "completed"
            else:
                # Check for other Google Maps patterns
                maps_pattern = r'https://www\.google\.com/maps/[^"\s<>]+'
                match = re.search(maps_pattern, response.text, re.IGNORECASE)
                if match:
                    return match.group(0), "completed"
                else:
                    return None, "no_map_found"
                    
        except requests.exceptions.Timeout:
            return None, "timeout"
        except requests.exceptions.RequestException as e:
            return None, f"error: {str(e)[:50]}"
        except Exception as e:
            return None, f"parse_error: {str(e)[:50]}"
    
    def process_event(self, event: Dict) -> Dict:
        """Process a single parkrun event"""
        processed_event = {
            "uid": event["uid"],
            "name": event["name"],
            "slug": event["slug"],
            "shortName": event["shortName"],
            "location": event["location"],
            "coordinates": event["coordinates"],
            "country": event["country"],
            "baseUrl": event["baseUrl"],
            "junior": event.get("junior", False),
            "coursePageUrl": f"https://{event['baseUrl']}/{event['slug']}/course",
            "courseMapUrl": None,
            "scrapingStatus": "pending",
            "lastUpdated": datetime.now().strftime("%Y-%m-%d")
        }
        
        # Attempt to scrape the course map URL
        course_url = processed_event["coursePageUrl"]
        map_url, status = self.scrape_course_map_url(course_url)
        
        processed_event["courseMapUrl"] = map_url
        processed_event["scrapingStatus"] = status
        
        return processed_event
    
    def process_batch(self, events: List[Dict], start_idx: int, state: ProcessingState) -> List[Dict]:
        """Process a batch of events"""
        processed_events = []
        batch_end = min(start_idx + self.batch_size, len(events))
        
        logger.info(f"Processing batch {state.batch_number + 1}: events {start_idx + 1}-{batch_end}")
        
        for i in range(start_idx, batch_end):
            event = events[i]
            
            try:
                processed_event = self.process_event(event)
                processed_events.append(processed_event)
                state.processed_count += 1
                
                # Log progress every 10 events within batch
                if (i - start_idx + 1) % 10 == 0:
                    progress = ((i + 1) / len(events)) * 100
                    logger.info(f"  Progress: {i + 1}/{len(events)} ({progress:.1f}%)")
                
                # Rate limiting - be respectful to parkrun servers
                time.sleep(self.rate_limit_delay)
                
            except Exception as e:
                logger.error(f"Error processing event {event.get('name', 'unknown')}: {e}")
                state.error_count += 1
                
                # Add failed event with error status
                error_event = {
                    **event,
                    "coursePageUrl": f"https://{event['baseUrl']}/{event['slug']}/course",
                    "courseMapUrl": None,
                    "scrapingStatus": f"error: {str(e)[:50]}",
                    "lastUpdated": datetime.now().strftime("%Y-%m-%d")
                }
                processed_events.append(error_event)
        
        state.last_processed_index = batch_end - 1
        state.batch_number += 1
        
        return processed_events
    
    def save_silver_data(self, silver_data: Dict, state: ProcessingState):
        """Save the silver data to file"""
        silver_data["metadata"]["total_events"] = len(silver_data["events"])
        silver_data["metadata"]["processing_summary"]["processed_count"] = state.processed_count
        silver_data["metadata"]["processing_summary"]["error_count"] = state.error_count
        
        with open(self.silver_file, 'w') as f:
            json.dump(silver_data, f, indent=2)
        
        logger.info(f"Saved silver data: {len(silver_data['events'])} events")
    
    def run_batch_processing(self):
        """Main batch processing function"""
        print("🔄 Starting batch processing of bronze data to silver level...")
        
        # Load bronze data
        print("📂 Loading bronze data...")
        if not self.bronze_file.exists():
            print("❌ Bronze data file not found! Run bronze processing first.")
            return
        
        with open(self.bronze_file, 'r') as f:
            bronze_data = json.load(f)
        
        events = bronze_data['events']
        total_events = len(events)
        
        print(f"📊 Found {total_events} events to process")
        
        # Load processing state
        state = self.load_processing_state()
        
        # Load existing silver data
        silver_data = self.load_existing_silver_data()
        
        if state.last_processed_index > 0:
            print(f"🔄 Resuming from event {state.last_processed_index + 1}")
            print(f"📈 Progress so far: {state.processed_count} processed, {state.error_count} errors")
        
        # Calculate remaining work
        remaining_events = total_events - (state.last_processed_index + 1)
        if remaining_events <= 0:
            print("✅ All events already processed!")
            return
        
        estimated_time = (remaining_events * self.rate_limit_delay) / 60
        print(f"⏰ Processing {remaining_events} remaining events")
        print(f"⌛ Estimated time: ~{estimated_time:.1f} minutes")
        print("🤖 Being respectful to Parkrun servers with rate limiting...")
        
        # Process in batches
        current_idx = state.last_processed_index + 1
        
        while current_idx < total_events:
            # Process batch
            batch_events = self.process_batch(events, current_idx, state)
            
            # Add to silver data
            silver_data["events"].extend(batch_events)
            
            # Save progress
            self.save_silver_data(silver_data, state)
            self.save_processing_state(state)
            
            # Progress update
            progress = ((current_idx + len(batch_events)) / total_events) * 100
            remaining = total_events - (current_idx + len(batch_events))
            remaining_time = (remaining * self.rate_limit_delay) / 60
            
            print(f"✅ Batch {state.batch_number} complete: {progress:.1f}% done")
            print(f"📊 Total processed: {state.processed_count}, errors: {state.error_count}")
            print(f"⏳ Remaining: ~{remaining_time:.1f} minutes")
            
            current_idx += len(batch_events)
            
            # Small pause between batches
            if current_idx < total_events:
                time.sleep(1)
        
        print("🎉 Batch processing complete!")
        print(f"📊 Final stats: {state.processed_count} processed, {state.error_count} errors")
        
        # Cleanup state file
        if self.state_file.exists():
            self.state_file.unlink()
        
        print("✨ Silver data processing finished successfully!")

def main():
    """Main function with command line argument handling"""
    
    if len(sys.argv) < 2:
        print("Usage: python process_silver_batch.py <batch_size>")
        print("  batch_size: Number of events to process per batch (default: 25)")
        print("Example: python process_silver_batch.py 50")
        return
    
    try:
        batch_size = int(sys.argv[1])
        if batch_size < 1:
            raise ValueError("Batch size must be positive")
    except ValueError as e:
        print(f"Invalid batch size: {e}")
        return
    
    processor = BatchSilverProcessor(batch_size=batch_size)
    processor.run_batch_processing()

if __name__ == "__main__":
    main()