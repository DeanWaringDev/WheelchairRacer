"""
Smart extraction of course descriptions from parkrun data.

Instead of removing boilerplate, we extract ONLY the relevant course description.
"""

import json
import re
from typing import Dict, Optional
from datetime import datetime


def extract_course_description(full_text: str, event_name: str) -> str:
    """
    Extract only the actual course description from the full scraped text.
    
    Strategy:
    1. Look for markers that indicate where the real description starts
    2. Extract paragraphs after these markers
    3. Stop when we hit navigation/admin text
    
    Common patterns:
    - Course description comes after "Course Description" heading
    - Usually starts with descriptive text like "A fast", "The course", "This is"
    - Ends before "Location of start", "Facilities", "Getting There"
    """
    
    if not full_text:
        return ""
    
    # Markers that indicate the start of useful course description
    start_markers = [
        "SAFETYMESSAGE",  # Often appears right before the description
        "For more information, please see our",
        "Course Description",
    ]
    
    # Markers that indicate we've gone past the course description
    end_markers = [
        "Location of start",
        "Getting there by",
        "Facilities",
        "Post Run Coffee",
        "Parking for our event",
        "extra clearing",  # HTML comment at the end
        "Toilets located",
        "Toilets are",
        "The nearest",
        "Please note",
        "If arriving by car",
        "The address",
        "OS Grid ref:",
    ]
    
    # Try to find where the description starts
    start_pos = 0
    for marker in start_markers:
        pos = full_text.find(marker)
        if pos != -1:
            start_pos = max(start_pos, pos + len(marker))
    
    # If no markers found, try to find the first paragraph after "Age Grading"
    if start_pos == 0:
        age_grading_pos = full_text.find("Age Grading")
        if age_grading_pos != -1:
            # Skip the Age Grading section
            support_pos = full_text.find("Support", age_grading_pos)
            if support_pos != -1:
                start_pos = support_pos + len("Support")
    
    # Extract text from start position
    text_after_marker = full_text[start_pos:].strip()
    
    # Find where to stop
    end_pos = len(text_after_marker)
    for marker in end_markers:
        pos = text_after_marker.find(marker)
        if pos != -1:
            end_pos = min(end_pos, pos)
    
    # Extract the description
    description = text_after_marker[:end_pos].strip()
    
    # Clean up
    description = clean_extracted_description(description)
    
    # If description is too short, it's probably not useful
    if len(description) < 50:
        print(f"  ⚠️  Very short description ({len(description)} chars): {description[:100]}")
        return description
    
    # If description is too long (>3000 chars), we probably grabbed too much
    if len(description) > 3000:
        print(f"  ⚠️  Very long description ({len(description)} chars), may need trimming")
    
    return description


def clean_extracted_description(text: str) -> str:
    """
    Clean up the extracted description.
    
    - Remove extra whitespace
    - Remove obvious navigation elements
    - Remove HTML comments
    - Fix formatting issues
    """
    
    # Remove HTML comments
    text = re.sub(r'extra clearing.*$', '', text, flags=re.DOTALL)
    
    # Remove navigation text patterns
    nav_patterns = [
        r'Course Map\s*',
        r'Course Description\s*',
        r'Support\s*',
        r'parkrun_conditional meta not found\s*',
        r'SAFETYMESSAGE\s*',
    ]
    
    for pattern in nav_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Clean up whitespace
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)  # Max 2 newlines
    text = re.sub(r'[ \t]+', ' ', text)  # Normalize spaces
    text = text.strip()
    
    return text


def extract_all_descriptions(
    input_file: str = "parkrun_detail.json",
    output_file: str = "parkrun_descriptions_extracted.json"
):
    """
    Extract course descriptions from all parkrun events.
    """
    
    print("📝 Extracting Course Descriptions")
    print("=" * 50)
    
    # Load data
    print(f"\n📂 Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    events = full_data.get('events', [])
    metadata = full_data.get('metadata', {})
    
    print(f"   Found {len(events)} parkrun events")
    
    # Statistics
    stats = {
        'total': len(events),
        'extracted': 0,
        'short_descriptions': 0,
        'long_descriptions': 0,
        'empty': 0,
        'total_chars_before': 0,
        'total_chars_after': 0,
    }
    
    # Process each event
    print("\n🔍 Extracting descriptions...")
    for i, event in enumerate(events, 1):
        name = event['name']
        original_desc = event.get('description', '')
        
        if i % 100 == 0:
            print(f"   Progress: {i}/{len(events)}")
        
        if not original_desc:
            stats['empty'] += 1
            continue
        
        # Extract
        extracted_desc = extract_course_description(original_desc, name)
        
        # Update event
        event['description_original_length'] = len(original_desc)
        event['description'] = extracted_desc
        event['description_extracted_length'] = len(extracted_desc)
        
        # Stats
        stats['total_chars_before'] += len(original_desc)
        stats['total_chars_after'] += len(extracted_desc)
        
        if extracted_desc:
            stats['extracted'] += 1
            
            if len(extracted_desc) < 100:
                stats['short_descriptions'] += 1
            elif len(extracted_desc) > 1000:
                stats['long_descriptions'] += 1
        else:
            stats['empty'] += 1
    
    # Calculate reduction
    if stats['total_chars_before'] > 0:
        reduction_pct = 100 * (1 - stats['total_chars_after'] / stats['total_chars_before'])
        stats['reduction_percentage'] = round(reduction_pct, 1)
    
    # Save
    print(f"\n💾 Saving extracted descriptions to {output_file}...")
    output_data = {
        'metadata': {
            **metadata,
            'extraction_date': datetime.now().isoformat(),
            'extraction_stats': stats
        },
        'events': events
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 EXTRACTION SUMMARY")
    print("=" * 50)
    print(f"Total events:              {stats['total']}")
    print(f"Extracted descriptions:    {stats['extracted']}")
    print(f"Empty descriptions:        {stats['empty']}")
    print(f"Short (<100 chars):        {stats['short_descriptions']}")
    print(f"Long (>1000 chars):        {stats['long_descriptions']}")
    print(f"\nSize reduction:")
    print(f"  Before: {stats['total_chars_before']:,} chars")
    print(f"  After:  {stats['total_chars_after']:,} chars")
    print(f"  Saved:  {stats['total_chars_before'] - stats['total_chars_after']:,} chars ({stats.get('reduction_percentage', 0)}%)")
    print("=" * 50)


if __name__ == "__main__":
    extract_all_descriptions()
