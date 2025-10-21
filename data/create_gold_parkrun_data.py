"""
Create Gold Parkrun Data - Comprehensive Data Merge Script
Combines all parkrun data sources into a single gold standard JSON file
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict
import requests
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Google Geocoding API setup
GOOGLE_GEOCODING_API_KEY = os.environ.get("GOOGLE_GEOCODING_API_KEY", "")

# File paths
SILVER_DATA = "silver_data.json"
PARKRUN_DETAIL = "parkrun_detail.json"
PARKRUN_DETAIL_CLEAN = "parkrun_detail_clean.json"
PARKRUN_SUMMARIES = "parkrun_descriptions_extracted.json"
KEYWORDS_FILE = "keywords.json"
OUTPUT_FILE = "gold_parkrun_data.json"

# Base scores for each mobility type
BASE_SCORES = {
    "racing_chair": 35,
    "day_chair": 40,
    "off_road_chair": 55,
    "handbike": 50,
    "frame_runner": 40,
    "walking_frame": 40,
    "crutches": 40,
    "walking_stick": 50
}


def load_json(filename: str) -> Any:
    """Load JSON file with error handling"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"⚠️  Warning: {filename} not found")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing {filename}: {e}")
        return None


def get_user_adjustment(user_scores: List[Dict], mobility_type: str, current_score: int) -> Dict:
    """
    Calculate weighted user adjustment based on submission count
    More submissions = higher confidence = stronger adjustment
    
    Weight formula:
    - 1 submission = 10% weight (0.05)
    - 5 submissions = 25% weight (0.25)
    - 10 submissions = 50% weight (0.50)
    - 20+ submissions = 100% weight (1.0)
    """
    submissions = [s for s in user_scores if s.get('mobility_type') == mobility_type]
    
    if not submissions:
        return {
            "count": 0,
            "avg_suggested_score": None,
            "confidence": 0.0,
            "adjustment": 0
        }
    
    count = len(submissions)
    avg_suggested = sum(s.get('suggested_score', current_score) for s in submissions) / count
    difference = avg_suggested - current_score
    
    # Calculate confidence weight (caps at 1.0)
    confidence = min(count / 20, 1.0)
    
    # Apply weighted adjustment
    weighted_adjustment = round(difference * confidence)
    
    return {
        "count": count,
        "avg_suggested_score": round(avg_suggested, 1),
        "confidence": round(confidence, 2),
        "adjustment": weighted_adjustment
    }


def find_keywords_in_text(text: str, keywords_dict: Dict) -> List[Dict]:
    """
    Find all keyword matches in text and return with their impacts
    """
    text_lower = text.lower()
    matches = []
    
    # Skip metadata
    for category, category_data in keywords_dict.items():
        if category == "metadata":
            continue
        
        # Check if this is a category with subcategories
        if isinstance(category_data, dict):
            for subcategory, subcat_data in category_data.items():
                if isinstance(subcat_data, dict) and 'keywords' in subcat_data:
                    keywords_list = subcat_data['keywords']
                    impact = subcat_data.get('impact', {})
                    
                    for keyword in keywords_list:
                        if keyword.lower() in text_lower:
                            matches.append({
                                "keyword": keyword,
                                "category": f"{category}/{subcategory}",
                                "impacts": impact
                            })
    
    return matches


def calculate_keyword_adjustment(keywords: List[Dict], mobility_type: str) -> Dict:
    """
    Calculate total keyword adjustment for a mobility type
    """
    total_adjustment = 0
    applied_keywords = []
    
    for kw in keywords:
        impact = kw['impacts'].get(mobility_type, 0)
        if impact != 0:
            total_adjustment += impact
            applied_keywords.append({
                "keyword": kw['keyword'],
                "category": kw['category'],
                "impact": impact
            })
    
    return {
        "total": total_adjustment,
        "applied": applied_keywords
    }


def calculate_accessibility_scores(
    keywords: List[Dict],
    user_scores: List[Dict],
    base_scores: Dict[str, int]
) -> Dict:
    """
    Calculate final accessibility scores with full breakdown
    """
    accessibility = {}
    
    for mobility_type, starting_score in base_scores.items():
        # Calculate keyword adjustment
        keyword_data = calculate_keyword_adjustment(keywords, mobility_type)
        score_after_keywords = starting_score + keyword_data['total']
        
        # Calculate user adjustment
        user_data = get_user_adjustment(user_scores, mobility_type, score_after_keywords)
        
        # Calculate final score (capped between 0-100)
        final_score = max(0, min(100, score_after_keywords + user_data['adjustment']))
        
        accessibility[mobility_type] = {
            "starting_score": starting_score,
            "keyword_adjustment": keyword_data['total'],
            "user_adjustment": user_data['adjustment'],
            "final_score": final_score,
            "breakdown": {
                "keywords_applied": keyword_data['applied'],
                "user_feedback": {
                    "submission_count": user_data['count'],
                    "avg_suggested": user_data['avg_suggested_score'],
                    "confidence_weight": user_data['confidence']
                }
            }
        }
    
    return accessibility


def get_postcode_from_coordinates(lat: float, lon: float) -> Optional[str]:
    """
    Get accurate postcode using Google Geocoding API
    """
    if not GOOGLE_GEOCODING_API_KEY:
        print("⚠️  Warning: GOOGLE_GEOCODING_API_KEY not set, skipping postcode lookup")
        return None
    
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "latlng": f"{lat},{lon}",
            "key": GOOGLE_GEOCODING_API_KEY,
            "result_type": "postal_code"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('results'):
            # Extract postal code from address components
            for result in data['results']:
                for component in result.get('address_components', []):
                    if 'postal_code' in component.get('types', []):
                        return component.get('long_name')
        
        return None
    
    except Exception as e:
        print(f"⚠️  Geocoding error: {e}")
        return None


def detect_language(text: str) -> str:
    """
    Detect language using OpenAI GPT-4o-mini
    """
    if not text or len(text) < 50:
        return "English"  # Default for very short text
    
    try:
        # Use first 500 characters for detection (cheaper and faster)
        text_sample = text[:500]
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a language detection expert. Respond with ONLY the language name in English (e.g., 'English', 'German', 'Danish', 'French', etc.). No explanation."
                },
                {
                    "role": "user",
                    "content": f"What language is this text written in?\n\n{text_sample}"
                }
            ],
            temperature=0,
            max_tokens=10
        )
        
        language = response.choices[0].message.content.strip()
        return language
    
    except Exception as e:
        print(f"⚠️  Language detection error: {e}")
        return "English"  # Default to English on error


def translate_to_english(text: str, source_language: str) -> Optional[str]:
    """
    Translate text to English using OpenAI GPT-4o-mini
    """
    if source_language.lower() == "english":
        return None  # No translation needed
    
    if not text or len(text) < 50:
        return None
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional translator. Translate the following {source_language} text to English. Maintain the original structure and meaning. Return ONLY the translation, no explanations."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        translation = response.choices[0].message.content.strip()
        return translation
    
    except Exception as e:
        print(f"⚠️  Translation error: {e}")
        return None


def create_parkrun_gold_entry(
    silver_event: Dict,
    detail_event: Optional[Dict],
    clean_event: Optional[Dict],
    summary_event: Optional[Dict],
    keywords_dict: Dict,
    user_scores: List[Dict] = None
) -> Dict:
    """
    Create a single gold parkrun entry by merging all data sources
    """
    if user_scores is None:
        user_scores = []
    
    slug = silver_event.get('slug')
    
    # Extract descriptions
    full_description = detail_event.get('description', '') if detail_event else ''
    cleaned_description = clean_event.get('description', '') if clean_event else full_description
    summary = summary_event.get('description', '') if summary_event else ''
    
    # Detect language using OpenAI
    language = detect_language(full_description or cleaned_description)
    
    # Translate to English if needed
    translated_description = None
    if language.lower() != "english" and full_description:
        translated_description = translate_to_english(full_description, language)
        time.sleep(0.1)  # Rate limiting
    
    # Get accurate postcode from coordinates
    postcode = None
    if silver_event.get('coordinates'):
        coords = silver_event['coordinates']
        if len(coords) == 2:
            lon, lat = coords  # [longitude, latitude]
            postcode = get_postcode_from_coordinates(lat, lon)
            time.sleep(0.1)  # Rate limiting for Google API
    
    # Find keywords in cleaned description and summary (NOT full - avoids boilerplate)
    keywords_cleaned = find_keywords_in_text(cleaned_description, keywords_dict) if cleaned_description else []
    keywords_summary = find_keywords_in_text(summary, keywords_dict) if summary else []
    
    # Combine and deduplicate keywords
    all_keywords = {kw['keyword']: kw for kw in (keywords_cleaned + keywords_summary)}
    matched_keywords = list(all_keywords.values())
    
    # Separate keyword sources for transparency
    keyword_sources = {
        "cleaned_description": [kw['keyword'] for kw in keywords_cleaned],
        "summary": [kw['keyword'] for kw in keywords_summary]
    }
    
    # Calculate accessibility scores
    accessibility = calculate_accessibility_scores(
        matched_keywords,
        user_scores,
        BASE_SCORES
    )
    
    # Build gold entry
    gold_entry = {
        "uid": silver_event.get('uid'),
        "short_name": silver_event.get('shortName'),
        "long_name": silver_event.get('name'),
        "slug": slug,
        "location": silver_event.get('location'),
        "coordinates": silver_event.get('coordinates'),
        "country": silver_event.get('country'),
        "is_junior": silver_event.get('junior', False),
        "course_page_url": silver_event.get('coursePageUrl'),
        "google_maps_url": silver_event.get('courseMapUrl'),
        "postcode": postcode,
        "language": language,
        
        "descriptions": {
            "full": full_description,
            "cleaned": cleaned_description,
            "summary": summary,
            "translated": translated_description
        },
        
        "keywords": {
            "matched": [kw['keyword'] for kw in matched_keywords],
            "count": len(matched_keywords),
            "sources": keyword_sources,
            "details": matched_keywords
        },
        
        "user_feedback": {
            "total_submissions": len(user_scores),
            "raw_submissions": user_scores
        },
        
        "accessibility": accessibility,
        
        "metadata": {
            "last_updated": datetime.now().isoformat(),
            "data_sources": {
                "silver_data": silver_event.get('last_updated'),
                "detail_scraped_at": detail_event.get('scrapedAt') if detail_event else None,
                "summary_generated": True if summary else False
            },
            "version": "2.0"
        }
    }
    
    return gold_entry


def main():
    """
    Main function to create gold parkrun data
    """
    print("🏃 Creating Gold Parkrun Data...")
    print("=" * 60)
    
    # Load all data sources
    print("\n📂 Loading data sources...")
    silver_data = load_json(SILVER_DATA)
    detail_data = load_json(PARKRUN_DETAIL)
    clean_data = load_json(PARKRUN_DETAIL_CLEAN)
    summary_data = load_json(PARKRUN_SUMMARIES)
    keywords_data = load_json(KEYWORDS_FILE)
    
    if not silver_data:
        print("❌ Cannot proceed without silver_data.json")
        return
    
    # Extract events from different sources
    silver_events = silver_data.get('events', [])
    detail_events = {e['slug']: e for e in detail_data.get('events', [])} if detail_data else {}
    clean_events = {e['slug']: e for e in clean_data.get('events', [])} if clean_data else {}
    summary_events = {e['slug']: e for e in summary_data.get('events', [])} if summary_data else {}
    
    print(f"✅ Loaded {len(silver_events)} parkrun events from silver data")
    print(f"✅ Loaded {len(detail_events)} detail entries")
    print(f"✅ Loaded {len(clean_events)} cleaned descriptions")
    print(f"✅ Loaded {len(summary_events)} AI summaries")
    
    # Create gold entries
    print("\n🔨 Building gold data entries...")
    
    # TEST MODE: Only process first 5 parkruns
    TEST_MODE = False  # Set to False for full run
    TEST_COUNT = 5
    
    if TEST_MODE:
        print(f"   🧪 TEST MODE: Processing only {TEST_COUNT} parkruns")
        silver_events = silver_events[:TEST_COUNT]
    else:
        print("   ⚠️  This will take a while due to API calls (language detection, translation, postcode lookup)")
        print("   💰 Estimated cost: ~$0.12 total")
    
    gold_events = []
    
    for idx, silver_event in enumerate(silver_events, 1):
        slug = silver_event.get('slug')
        
        if idx % 10 == 0 or TEST_MODE:
            print(f"   Processing {idx}/{len(silver_events)}... ({(idx/len(silver_events)*100):.1f}%)")
        
        detail_event = detail_events.get(slug)
        clean_event = clean_events.get(slug)
        summary_event = summary_events.get(slug)
        
        # TODO: Fetch user scores from Supabase for this slug
        user_scores = []  # Placeholder
        
        gold_entry = create_parkrun_gold_entry(
            silver_event,
            detail_event,
            clean_event,
            summary_event,
            keywords_data,
            user_scores
        )
        
        gold_events.append(gold_entry)
    
    # Create final gold data structure
    gold_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "version": "2.0",
            "total_events": len(gold_events),
            "description": "Gold standard parkrun data - comprehensive merge of all sources"
        },
        "events": gold_events
    }
    
    # Save to file
    print(f"\n💾 Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gold_data, f, indent=2, ensure_ascii=False)
    
    # Print statistics
    print("\n" + "=" * 60)
    print("✅ Gold parkrun data created successfully!")
    print(f"📊 Total events: {len(gold_events)}")
    
    # Count how many have summaries
    with_summaries = sum(1 for e in gold_events if e['descriptions']['summary'])
    print(f"📝 Events with AI summaries: {with_summaries}/{len(gold_events)}")
    
    # Count keyword matches
    total_keywords = sum(e['keywords']['count'] for e in gold_events)
    print(f"🔑 Total keyword matches: {total_keywords}")
    
    # Language distribution
    languages = defaultdict(int)
    for e in gold_events:
        languages[e['language']] += 1
    print(f"🌍 Languages detected: {dict(languages)}")
    
    print(f"\n✨ Output file: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
