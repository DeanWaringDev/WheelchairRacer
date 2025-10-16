#!/usr/bin/env python3
"""
Parkrun Data Processor - Raw to Bronze
=====================================

This script processes the raw parkrun data JSON file and creates a clean,
structured bronze_data.json file with the following schema:

- Unique ID: Starting at 100, incrementing for each event
- Name: EventLongName 
- Slug: eventname
- ShortName: EventShortName
- Location: EventLocation
- Coordinates: [longitude, latitude]
- Country: Derived from countrycode
- Base URL: Derived from country's parkrun URL
- Junior: Boolean (True if junior parkrun, False otherwise)

Usage:
    python process_to_bronze.py

Author: Dean Waring
Date: October 2025
"""

import json
import sys
from pathlib import Path

def load_raw_data():
    """Load the raw parkrun data from JSON file."""
    try:
        with open('raw_parkrun_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: raw_parkrun_data.json not found in current directory")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
        sys.exit(1)

def create_country_lookup(countries_data):
    """
    Create a lookup dictionary for country codes to URLs and names.
    
    Args:
        countries_data (dict): Raw countries data from JSON
        
    Returns:
        dict: {country_code: {"url": str, "bounds": list, "name": str}}
    """
    country_lookup = {}
    
    # Map of country codes to readable names (complete mapping for all countries)
    country_names = {
        0: "International",   # No URL, general/international
        3: "Australia",       # www.parkrun.com.au
        4: "Austria",         # www.parkrun.co.at
        14: "Canada",         # www.parkrun.ca
        23: "Denmark",        # www.parkrun.dk
        30: "Finland",        # www.parkrun.fi
        32: "Germany",        # www.parkrun.com.de
        42: "Ireland",        # www.parkrun.ie
        44: "Italy",          # www.parkrun.it
        46: "Japan",          # www.parkrun.jp
        54: "Lithuania",      # www.parkrun.lt
        57: "Malaysia",       # www.parkrun.my
        64: "Netherlands",    # www.parkrun.co.nl
        65: "New Zealand",    # www.parkrun.co.nz
        67: "Norway",         # www.parkrun.no
        74: "Poland",         # www.parkrun.pl
        82: "Singapore",      # www.parkrun.sg
        85: "South Africa",   # www.parkrun.co.za
        88: "Sweden",         # www.parkrun.se
        97: "United Kingdom", # www.parkrun.org.uk
        98: "United States"   # www.parkrun.us
    }
    
    for country_code, country_info in countries_data.items():
        if country_code.isdigit():
            code = int(country_code)
            country_lookup[code] = {
                "url": country_info.get("url"),
                "bounds": country_info.get("bounds"),
                "name": country_names.get(code, f"Country {code}")
            }
    
    return country_lookup

def is_junior_event(event_name, series_id):
    """
    Determine if an event is a junior parkrun.
    
    Args:
        event_name (str): The full event name
        series_id (int): The series ID from the data
        
    Returns:
        bool: True if junior event, False otherwise
    """
    if not event_name:
        return False
        
    # Check if "junior" appears in the name (case insensitive)
    name_lower = event_name.lower()
    has_junior_in_name = "junior" in name_lower
    
    # Check if series ID is 2 (junior series)
    is_series_2 = series_id == 2
    
    return has_junior_in_name or is_series_2

def process_events(events_data, country_lookup, start_uid=100):
    """
    Process the events data into clean bronze format.
    
    Args:
        events_data (dict): Raw events data from JSON
        country_lookup (dict): Country code lookup dictionary
        start_uid (int): Starting unique ID
        
    Returns:
        list: List of processed events
    """
    processed_events = []
    current_uid = start_uid
    
    if "features" not in events_data:
        print("Warning: No 'features' found in events data")
        return processed_events
    
    for feature in events_data["features"]:
        try:
            # Extract properties
            props = feature.get("properties", {})
            geometry = feature.get("geometry", {})
            
            # Get coordinates [longitude, latitude]
            coordinates = geometry.get("coordinates", [None, None])
            
            # Get country info
            country_code = props.get("countrycode")
            country_info = country_lookup.get(country_code, {})
            
            # Create processed event
            processed_event = {
                "uid": current_uid,
                "name": props.get("EventLongName", ""),
                "slug": props.get("eventname", ""),
                "shortName": props.get("EventShortName", ""),
                "location": props.get("EventLocation", ""),
                "coordinates": coordinates,
                "country": country_info.get("name", f"Unknown ({country_code})"),
                "countryCode": country_code,
                "baseUrl": country_info.get("url", ""),
                "junior": is_junior_event(
                    props.get("EventLongName", ""), 
                    props.get("seriesid")
                )
            }
            
            processed_events.append(processed_event)
            current_uid += 1
            
        except Exception as e:
            print(f"Warning: Error processing event {feature.get('id', 'unknown')}: {e}")
            continue
    
    return processed_events

def save_bronze_data(processed_events):
    """Save processed events to bronze_data.json"""
    bronze_data = {
        "metadata": {
            "version": "1.0",
            "created": "2025-10-16",
            "description": "Bronze level parkrun data - cleaned and structured from raw data",
            "total_events": len(processed_events),
            "schema": {
                "uid": "Unique identifier starting from 100",
                "name": "Full event name (EventLongName)",
                "slug": "URL slug (eventname)",
                "shortName": "Short display name",
                "location": "Event location description",
                "coordinates": "[longitude, latitude]",
                "country": "Country name",
                "countryCode": "Numeric country code",
                "baseUrl": "Base parkrun URL for country",
                "junior": "Boolean - true if junior parkrun"
            }
        },
        "events": processed_events
    }
    
    try:
        with open('bronze_data.json', 'w', encoding='utf-8') as f:
            json.dump(bronze_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Successfully created bronze_data.json with {len(processed_events)} events")
    except Exception as e:
        print(f"❌ Error saving bronze_data.json: {e}")
        sys.exit(1)

def main():
    """Main processing function."""
    print("🔄 Processing raw parkrun data to bronze level...")
    
    # Load raw data
    print("📂 Loading raw data...")
    raw_data = load_raw_data()
    
    # Create country lookup
    print("🗺️  Creating country lookup...")
    country_lookup = create_country_lookup(raw_data.get("countries", {}))
    print(f"   Found {len(country_lookup)} countries")
    
    # Process events
    print("⚙️  Processing events...")
    processed_events = process_events(raw_data.get("events", {}), country_lookup)
    
    # Save bronze data
    print("💾 Saving bronze data...")
    save_bronze_data(processed_events)
    
    # Summary statistics
    junior_count = sum(1 for event in processed_events if event["junior"])
    countries = set(event["country"] for event in processed_events)
    
    print(f"""
📊 Processing Summary:
   • Total events: {len(processed_events)}
   • Junior events: {junior_count}
   • Regular events: {len(processed_events) - junior_count}
   • Countries: {len(countries)}
   • UIDs assigned: 100-{99 + len(processed_events)}
   
🎉 Bronze data processing complete!
""")

if __name__ == "__main__":
    main()