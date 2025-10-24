"""
02_create_parkrun_descriptions.py

Extract course descriptions from parkrun course pages and generate AI summaries.

Process:
1. Load parkrun info from 01_gold_parkrun_info.json
2. Scrape course page for all text content
3. Remove boilerplate text
4. Generate AI summary focused on accessibility
5. Output to 02_gold_parkrun_descriptions.json
"""

import json
import os
import sys
import time
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv(dotenv_path='../../.env')

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def load_parkrun_info():
    """Load parkrun info from 01_gold_parkrun_info.json"""
    info_path = '../data/01_gold_parkrun_info.json'
    
    try:
        with open(info_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract events array from the JSON structure
        events = data['events'] if 'events' in data else data
        
        print(f"✓ Loaded {len(events)} parkruns from 01_gold_parkrun_info.json")
        return events
    except Exception as e:
        print(f"✗ Error loading parkrun info: {e}")
        sys.exit(1)

def load_boilerplate():
    """Load boilerplate sections from boilerplate.json"""
    boilerplate_path = '../data/boilerplate.json'
    
    try:
        with open(boilerplate_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✓ Loaded {len(data['boilerplate_sections'])} boilerplate sections")
        return data['boilerplate_sections']
    except Exception as e:
        print(f"✗ Error loading boilerplate: {e}")
        sys.exit(1)

def scrape_course_description(course_url):
    """
    Scrape ALL text from the course page between header and footer.
    Parkrun course pages have TWO content areas:
    1. Left sidebar (courseleft) - "The Course" section
    2. Right main area (courseright) - "Course Description" etc.
    We need BOTH!
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(course_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove all the stuff we DON'T want
        for unwanted in soup(["script", "style", "nav", "header", "footer", "iframe"]):
            unwanted.decompose()
        
        # Get BOTH content areas
        left_content = soup.find('div', class_='courseleft')  # "The Course" section
        right_content = soup.find('div', class_='courseright')  # Main course info
        
        all_text_parts = []
        
        # Get left sidebar text
        if left_content:
            left_text = left_content.get_text(separator='\n', strip=True)
            all_text_parts.append(left_text)
        
        # Get right main content text
        if right_content:
            right_text = right_content.get_text(separator='\n', strip=True)
            all_text_parts.append(right_text)
        
        # If we didn't find either, fallback to main/body
        if not all_text_parts:
            fallback = (soup.find('main') or 
                       soup.find('div', class_='content') or
                       soup.find('article') or
                       soup.find('body'))
            if fallback:
                all_text_parts.append(fallback.get_text(separator='\n', strip=True))
        
        # Combine all text
        full_text = '\n'.join(all_text_parts)
        
        # Clean up excessive whitespace but keep structure
        lines = [line.strip() for line in full_text.split('\n') if line.strip()]
        cleaned_text = '\n'.join(lines)
        
        return cleaned_text
            
    except Exception as e:
        print(f"   ⚠️  Error scraping {course_url}: {e}")
        return ""

def remove_boilerplate(text, boilerplate_sections):
    """Remove all boilerplate sections from the text"""
    clean_text = text
    
    for section in boilerplate_sections:
        clean_text = clean_text.replace(section, '')
    
    # Clean up extra whitespace
    clean_text = '\n'.join([line.strip() for line in clean_text.split('\n') if line.strip()])
    
    return clean_text.strip()

def generate_ai_summary(clean_description, parkrun_name):
    """
    Generate an accessibility-focused AI summary using OpenAI.
    ~250 words, friendly and encouraging tone.
    """
    if not clean_description or len(clean_description) < 50:
        return ""
    
    try:
        prompt = f"""You are writing an accessibility-focused course description for {parkrun_name}.

Based on this course information:
{clean_description}

Write a friendly, encouraging 250-word description that highlights:
- Surface types (grass, tarmac, gravel, trail, etc.)
- Terrain features (flat, hilly, gradients, elevation changes)
- Any obstacles or challenges mentioned
- Course layout (laps, out-and-back, loop, etc.)
- Any accessibility-relevant details (path width, surfaces, turns, etc.)

Tone: Welcoming and informative for disabled athletes and people with mobility aids.
Focus: What someone using a wheelchair, walking frame, or crutches needs to know.

Write in second person ("you will...") and be specific about physical features.
Do not copy the original text - create an original description.
"""

        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert at writing accessibility-focused event descriptions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )
        
        summary = completion.choices[0].message.content.strip()
        return summary
        
    except Exception as e:
        print(f"   ⚠️  Error generating AI summary: {e}")
        return ""

def process_parkrun(parkrun, boilerplate_sections):
    """Process a single parkrun to extract descriptions"""
    uid = parkrun['uid']
    slug = parkrun['slug']
    long_name = parkrun['long_name']
    course_url = parkrun['course_page_url']
    
    # Step 1: Scrape raw description
    raw_description = scrape_course_description(course_url)
    
    # Step 2: Remove boilerplate
    clean_description = remove_boilerplate(raw_description, boilerplate_sections)
    
    # Step 3: Generate AI summary
    summary_description = ""
    has_summary = False
    
    if clean_description and len(clean_description) >= 50:
        summary_description = generate_ai_summary(clean_description, long_name)
        has_summary = bool(summary_description)
    
    # Step 4: Set flags
    has_description = bool(clean_description)
    
    return {
        "uid": uid,
        "slug": slug,
        "raw_description": raw_description,
        "clean_description": clean_description,
        "summary_description": summary_description,
        "has_description": has_description,
        "has_summary": has_summary
    }

def create_parkrun_descriptions(test_mode=False, use_apis=True):
    """
    Main function to create parkrun descriptions.
    
    Args:
        test_mode: If True, only process first 5 parkruns
        use_apis: If True, call OpenAI API for summaries
    """
    print("=" * 60)
    print("Creating Parkrun Descriptions JSON")
    print("=" * 60)
    print()
    
    if use_apis:
        print("⚠️  API MODE ENABLED - Will call OpenAI API")
        print("   This will take longer and consume API credits")
    else:
        print("📝 NO-API MODE - Will skip AI summary generation")
    print()
    
    # Load data
    print("1. Loading data...")
    parkruns = load_parkrun_info()
    boilerplate_sections = load_boilerplate()
    print()
    
    # Test mode
    if test_mode:
        parkruns = parkruns[:5]
        print(f"🧪 TEST MODE: Processing only {len(parkruns)} parkruns")
        print()
    
    # Process parkruns
    print(f"2. Processing {len(parkruns)} parkruns...")
    descriptions = []
    
    for i, parkrun in enumerate(parkruns, 1):
        slug = parkrun['slug']
        long_name = parkrun['long_name']
        
        # Process this parkrun
        description_data = process_parkrun(parkrun, boilerplate_sections)
        descriptions.append(description_data)
        
        # Progress reporting
        if i % 100 == 0 or i == len(parkruns):
            has_desc = "✓" if description_data['has_description'] else "✗"
            has_sum = "✓" if description_data['has_summary'] else "✗"
            print(f"   {i}/{len(parkruns)} - {long_name} | Desc:{has_desc} Sum:{has_sum}")
        
        # Rate limiting for API calls
        if use_apis and description_data['has_summary']:
            time.sleep(0.5)  # 0.5s between API calls
    
    print()
    print(f"✓ Processed {len(descriptions)} parkruns")
    
    # Calculate statistics
    with_desc = sum(1 for d in descriptions if d['has_description'])
    with_summary = sum(1 for d in descriptions if d['has_summary'])
    
    print(f"   - {with_desc}/{len(descriptions)} have descriptions ({with_desc/len(descriptions)*100:.1f}%)")
    print(f"   - {with_summary}/{len(descriptions)} have AI summaries ({with_summary/len(descriptions)*100:.1f}%)")
    print()
    
    # Save to JSON
    print("3. Saving to 02_gold_parkrun_descriptions.json...")
    output_path = '../data/02_gold_parkrun_descriptions.json'
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(descriptions, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved to {output_path}")
        print()
        
        # Show file size
        file_size = os.path.getsize(output_path) / 1024 / 1024
        print(f"📊 File size: {file_size:.2f} MB")
        
    except Exception as e:
        print(f"✗ Error saving file: {e}")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    # Run in test mode with API calls
    # Change to test_mode=False for full 2,747 parkruns
    # Change to use_apis=False to skip AI summary generation
    create_parkrun_descriptions(test_mode=False, use_apis=True)
