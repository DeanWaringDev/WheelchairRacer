"""
04b_incorporate_user_feedback_keywords.py - Add User Feedback Text to Keyword Analysis

This script analyzes user-submitted feedback text (from parkrun_score_feedback table)
and searches for accessibility keywords. When users mention specific issues like
"steep hill", "narrow path", "gate", etc., we add those keywords to the parkrun's
keyword list and recalculate scores.

This creates a feedback loop where real user experiences enhance the automated scoring.

Input:
    - data/04_gold_parkrun_keywords_score.json (existing keyword scores)
    - Supabase: parkrun_score_feedback table
    - data/keywords.json (keyword definitions)

Output:
    - data/04_gold_parkrun_keywords_score.json (updated with user feedback keywords)
    - Report of keywords found in user feedback

Author: Dean Waring
Date: 2024-10-24
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set
from collections import defaultdict
from dotenv import load_dotenv

# Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase package not installed")
    print("Please install it: pip install supabase")
    exit(1)

# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'

KEYWORDS_FILE = DATA_DIR / 'keywords.json'
SCORES_FILE = DATA_DIR / '04_gold_parkrun_keywords_score.json'

# Load environment variables
POSSIBLE_ENV_LOCATIONS = [
    BASE_DIR.parent.parent / 'frontend' / '.env.local',
    BASE_DIR.parent.parent / 'frontend' / '.env',
    BASE_DIR.parent.parent / '.env',
]

env_loaded = False
for env_path in POSSIBLE_ENV_LOCATIONS:
    if env_path.exists():
        load_dotenv(env_path)
        env_loaded = True
        break

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Supabase credentials not found")
    exit(1)

MOBILITY_TYPES = [
    'racing_chair', 'day_chair', 'off_road_chair', 'handbike',
    'frame_runner', 'walking_frame', 'crutches', 'walking_stick'
]

# ============================================================
# KEYWORD EXTRACTION
# ============================================================

def load_keyword_definitions() -> Dict:
    """Load keyword definitions and flatten into searchable format."""
    with open(KEYWORDS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract all keywords with their impacts
    keyword_impacts = {}
    
    for category_name, category_data in data.items():
        if category_name == 'metadata':
            continue
        
        if isinstance(category_data, dict):
            for subcategory, items in category_data.items():
                if isinstance(items, dict) and 'keywords' in items:
                    keywords_list = items['keywords']
                    impacts = items.get('impact', {})  # FIX: 'impact' not 'impacts'
                    
                    for keyword in keywords_list:
                        # Store impacts for each mobility type
                        keyword_impacts[keyword.lower()] = {
                            mt: impacts.get(mt, 0) for mt in MOBILITY_TYPES
                        }
    
    return keyword_impacts

def extract_keywords_from_text(text: str, keyword_impacts: Dict) -> Set[str]:
    """
    Search text for accessibility keywords.
    
    Uses word boundaries to avoid partial matches.
    Case-insensitive.
    
    Args:
        text: User feedback text
        keyword_impacts: Dict of keyword -> impacts
    
    Returns:
        Set of matched keywords
    """
    if not text:
        return set()
    
    text_lower = text.lower()
    matched = set()
    
    for keyword in keyword_impacts.keys():
        # Use word boundaries for multi-word phrases
        # For single words, ensure they're standalone
        keyword_pattern = r'\b' + re.escape(keyword) + r'\b'
        
        if re.search(keyword_pattern, text_lower):
            matched.add(keyword)
    
    return matched

# ============================================================
# FETCH USER FEEDBACK
# ============================================================

def fetch_user_feedback(supabase: Client) -> List[Dict]:
    """Fetch all user feedback from Supabase."""
    print("Fetching user feedback from Supabase...")
    
    try:
        response = supabase.table('parkrun_score_feedback').select('*').execute()
        
        if not response.data:
            print("  ⚠️  No user feedback found")
            return []
        
        print(f"  ✓ Fetched {len(response.data)} feedback records")
        return response.data
        
    except Exception as e:
        print(f"  ⚠️  Error fetching feedback: {e}")
        return []

# ============================================================
# ANALYZE FEEDBACK
# ============================================================

def analyze_feedback_keywords(
    feedback_records: List[Dict],
    keyword_impacts: Dict
) -> Dict[str, Set[str]]:
    """
    Analyze user feedback text for keywords.
    
    Returns:
        Dict of parkrun_slug -> set of keywords found in user feedback
    """
    print()
    print("Analyzing user feedback for keywords...")
    
    parkrun_keywords = defaultdict(set)
    keyword_counts = defaultdict(int)
    
    for record in feedback_records:
        slug = record.get('parkrun_slug')
        if not slug:
            continue
        
        # Combine reason and additional_details
        reason = record.get('reason', '')
        details = record.get('additional_details', '')
        
        # Map reason codes to keywords
        reason_keyword_map = {
            'steep_hills': 'steep',
            'uneven_surface': 'uneven',
            'narrow_paths': 'narrow',
            'obstacles': 'obstacle',
            'poor_surface': 'rough',
            'terrain_change': 'varied terrain',
            'weather_impact': 'weather dependent'
        }
        
        # Add mapped keyword from reason
        if reason in reason_keyword_map:
            mapped_keyword = reason_keyword_map[reason]
            if mapped_keyword in keyword_impacts:
                parkrun_keywords[slug].add(mapped_keyword)
                keyword_counts[mapped_keyword] += 1
        
        # Search additional_details for keywords
        found_keywords = extract_keywords_from_text(details, keyword_impacts)
        
        for keyword in found_keywords:
            parkrun_keywords[slug].add(keyword)
            keyword_counts[keyword] += 1
    
    print(f"  ✓ Found keywords in feedback for {len(parkrun_keywords)} parkruns")
    print()
    
    if keyword_counts:
        print("  Most common user-reported keywords:")
        sorted_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)
        for keyword, count in sorted_keywords[:10]:
            print(f"    - {keyword}: {count} mentions")
    
    return dict(parkrun_keywords)

# ============================================================
# UPDATE KEYWORD SCORES
# ============================================================

def recalculate_keyword_scores(
    keyword: str,
    keyword_impacts: Dict,
    starting_score: int = 50
) -> Dict[str, int]:
    """
    Calculate impact of a single keyword on all mobility types.
    
    Args:
        keyword: The keyword to calculate impacts for
        keyword_impacts: Dict of keyword -> mobility impacts
        starting_score: Starting score (default 50)
    
    Returns:
        Dict of mobility_type -> new score
    """
    impacts = keyword_impacts.get(keyword, {})
    
    scores = {}
    for mobility_type in MOBILITY_TYPES:
        impact = impacts.get(mobility_type, 0)
        new_score = starting_score + impact
        # Clamp to 0-100
        new_score = max(0, min(100, new_score))
        scores[mobility_type] = new_score
    
    return scores

def update_keyword_scores(
    existing_scores: List[Dict],
    user_feedback_keywords: Dict[str, Set[str]],
    keyword_impacts: Dict
) -> List[Dict]:
    """
    Update keyword scores by incorporating user feedback keywords.
    
    Strategy:
    1. For each parkrun with user feedback keywords
    2. Add new keywords to matched_keywords list (if not already present)
    3. Recalculate scores for all mobility types
    4. Update the record
    
    Args:
        existing_scores: Current keyword score data
        user_feedback_keywords: Dict of slug -> set of keywords from feedback
        keyword_impacts: Keyword impact definitions
    
    Returns:
        Updated scores list
    """
    print()
    print("Updating keyword scores with user feedback...")
    
    updated_count = 0
    new_keywords_added = 0
    
    # Create lookup dict
    scores_by_slug = {item['slug']: item for item in existing_scores}
    
    for slug, user_keywords in user_feedback_keywords.items():
        if slug not in scores_by_slug:
            print(f"  ⚠️  {slug}: Not found in existing scores, skipping")
            continue
        
        parkrun_data = scores_by_slug[slug]
        
        # Get existing matched keywords
        existing_keywords = set(parkrun_data.get('matched_keywords', []))
        
        # Find new keywords from user feedback
        new_keywords = user_keywords - existing_keywords
        
        # ALWAYS recalculate if there are user feedback keywords
        # (even if keywords were already in the list from previous runs)
        # This ensures bug fixes to keyword impacts get applied
        
        # Add new keywords
        all_keywords = existing_keywords.union(user_keywords)
        parkrun_data['matched_keywords'] = sorted(list(all_keywords))
        parkrun_data['keyword_count'] = len(all_keywords)
        
        # Recalculate scores for all mobility types
        # Start at 50 and apply impacts from all keywords
        mobility_scores = {mt: 50 for mt in MOBILITY_TYPES}
        
        for keyword in all_keywords:
            impacts = keyword_impacts.get(keyword, {})
            for mt in MOBILITY_TYPES:
                impact = impacts.get(mt, 0)
                mobility_scores[mt] += impact
        
        # Clamp to 0-100 and update
        for mt in MOBILITY_TYPES:
            score = max(0, min(100, mobility_scores[mt]))
            parkrun_data[f'{mt}_keyword_score'] = score
        
        # Track that we updated this parkrun
        parkrun_data['has_user_feedback_keywords'] = True
        parkrun_data['user_feedback_keyword_count'] = len(new_keywords)
        
        updated_count += 1
        new_keywords_added += len(new_keywords)
        
        print(f"  ✓ {slug}: Added {len(new_keywords)} keyword(s) from user feedback")
        for kw in new_keywords:
            print(f"      + {kw}")
    
    print()
    print(f"  ✓ Updated {updated_count} parkruns")
    print(f"  ✓ Added {new_keywords_added} new keywords from user feedback")
    
    return existing_scores

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("=" * 60)
    print("04b_incorporate_user_feedback_keywords.py")
    print("Enhance Keyword Scoring with User Feedback")
    print("=" * 60)
    print()
    
    # Load keyword definitions
    print("Loading keyword definitions...")
    keyword_impacts = load_keyword_definitions()
    print(f"  ✓ Loaded {len(keyword_impacts)} keywords")
    
    # Load existing keyword scores
    print()
    print("Loading existing keyword scores...")
    with open(SCORES_FILE, 'r', encoding='utf-8') as f:
        existing_scores = json.load(f)
    print(f"  ✓ Loaded {len(existing_scores)} parkrun scores")
    
    # Connect to Supabase
    print()
    print("Connecting to Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("  ✓ Connected")
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        return
    
    # Fetch user feedback
    print()
    feedback_records = fetch_user_feedback(supabase)
    
    if not feedback_records:
        print()
        print("No user feedback to process. Exiting.")
        return
    
    # Analyze feedback for keywords
    user_feedback_keywords = analyze_feedback_keywords(feedback_records, keyword_impacts)
    
    if not user_feedback_keywords:
        print()
        print("No keywords found in user feedback. Exiting.")
        return
    
    # Update scores
    updated_scores = update_keyword_scores(
        existing_scores,
        user_feedback_keywords,
        keyword_impacts
    )
    
    # Save updated scores
    print()
    print("Saving updated scores...")
    with open(SCORES_FILE, 'w', encoding='utf-8') as f:
        json.dump(updated_scores, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Saved to {SCORES_FILE.name}")
    
    print()
    print("=" * 60)
    print("✓ User feedback keywords incorporated!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Re-run 08_calculate_final_scores.py to update final scores")
    print("  2. Check validation to see if user feedback improved accuracy")
    print()

if __name__ == '__main__':
    main()
