"""
07_fetch_user_scores.py - Fetch User-Submitted Accessibility Scores

This script queries Supabase for user-submitted accessibility scores and feedback,
aggregates them by parkrun and mobility type, and generates confidence-weighted
community scores.

Input:
    - Supabase: parkrun_score_feedback table
    - data/01_gold_parkrun_info.json (for UID mapping)

Output:
    - data/07_gold_parkrun_user_submitted_scores.json

Author: Dean Waring
Date: 2024-10-24
"""

import json
import os
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Supabase client (need to install: pip install supabase)
try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase package not installed")
    print("Please install it: pip install supabase")
    exit(1)

# ============================================================
# CONFIGURATION
# ============================================================

# File paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
INFO_FILE = DATA_DIR / '01_gold_parkrun_info.json'
OUTPUT_FILE = DATA_DIR / '07_gold_parkrun_user_submitted_scores.json'

# Load environment variables - try multiple locations
POSSIBLE_ENV_LOCATIONS = [
    BASE_DIR.parent.parent / 'frontend' / '.env.local',  # Frontend .env.local (primary)
    BASE_DIR.parent.parent / 'frontend' / '.env',        # Frontend .env
    BASE_DIR.parent.parent / '.env',                     # Root of repo
]

env_loaded = False
for env_path in POSSIBLE_ENV_LOCATIONS:
    if env_path.exists():
        load_dotenv(env_path)
        env_loaded = True
        break

# Supabase configuration
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Supabase credentials not found")
    print("Tried locations:")
    for env_path in POSSIBLE_ENV_LOCATIONS:
        exists = "✓" if env_path.exists() else "✗"
        print(f"  {exists} {env_path}")
    print()
    print("Please create a .env file with:")
    print("  VITE_SUPABASE_URL=your_supabase_url")
    print("  VITE_SUPABASE_ANON_KEY=your_anon_key")
    print()
    print("Or set them as environment variables")
    exit(1)

# Mobility types
MOBILITY_TYPES = [
    'racing_chair',
    'day_chair', 
    'off_road_chair',
    'handbike',
    'frame_runner',
    'walking_frame',
    'crutches',
    'walking_stick'
]

# Score adjustment mapping
ADJUSTMENT_TO_SCORE_DELTA = {
    'too_low': +20,      # Score should be higher
    'slightly_low': +10,
    'accurate': 0,
    'slightly_high': -10,
    'too_high': -20      # Score should be lower
}

# Confidence levels based on number of ratings
def get_confidence_level(rating_count: int) -> str:
    """Calculate confidence level based on number of ratings."""
    if rating_count >= 10:
        return 'high'
    elif rating_count >= 5:
        return 'medium'
    elif rating_count >= 2:
        return 'low'
    else:
        return 'very_low'

# ============================================================
# SUPABASE QUERIES
# ============================================================

def fetch_user_feedback(supabase: Client) -> List[Dict]:
    """
    Fetch all user feedback from Supabase.
    
    Returns:
        List of feedback records
    """
    print("Fetching user feedback from Supabase...")
    
    try:
        response = supabase.table('parkrun_score_feedback').select('*').execute()
        
        if not response.data:
            print("  ⚠️  No user feedback found in database")
            return []
        
        print(f"  ✓ Fetched {len(response.data)} feedback records")
        return response.data
        
    except Exception as e:
        print(f"  ⚠️  Error fetching feedback: {e}")
        return []

# ============================================================
# SCORE AGGREGATION
# ============================================================

def aggregate_user_scores(feedback_records: List[Dict], slug_to_uid: Dict[str, int]) -> List[Dict]:
    """
    Aggregate user feedback into average scores by parkrun and mobility type.
    
    Strategy:
    1. Group feedback by (parkrun_slug, mobility_type)
    2. For each group, calculate:
       - Average score adjustment (using ADJUSTMENT_TO_SCORE_DELTA)
       - Suggested scores (if provided by users)
       - Number of ratings (confidence metric)
       - Most common reasons
    3. Generate final community score (0-100)
    
    Args:
        feedback_records: Raw feedback from Supabase
        slug_to_uid: Mapping of slug -> parkrun UID
    
    Returns:
        List of aggregated scores per parkrun
    """
    print()
    print("Aggregating user scores...")
    
    # Group by parkrun and mobility type
    grouped = defaultdict(lambda: defaultdict(list))
    
    for record in feedback_records:
        slug = record.get('parkrun_slug')
        mobility = record.get('mobility_type')
        
        if not slug or not mobility:
            continue
        
        grouped[slug][mobility].append(record)
    
    results = []
    processed_count = 0
    
    # Process each parkrun
    for slug, mobility_data in grouped.items():
        uid = slug_to_uid.get(slug)
        
        if uid is None:
            print(f"  ⚠️  {slug}: No UID mapping found, skipping")
            continue
        
        # Initialize result for this parkrun
        result = {
            'uid': uid,
            'slug': slug,
            'has_user_scores': True,
            'total_feedback_count': sum(len(records) for records in mobility_data.values())
        }
        
        # Process each mobility type
        for mobility_type in MOBILITY_TYPES:
            records = mobility_data.get(mobility_type, [])
            
            if not records:
                # No user feedback for this mobility type
                result[f'{mobility_type}_user_score'] = None
                result[f'{mobility_type}_rating_count'] = 0
                result[f'{mobility_type}_confidence'] = 'none'
                continue
            
            # Calculate average score adjustment
            adjustments = []
            suggested_scores = []
            reasons = []
            
            for record in records:
                adj = record.get('score_adjustment')
                if adj and adj in ADJUSTMENT_TO_SCORE_DELTA:
                    adjustments.append(ADJUSTMENT_TO_SCORE_DELTA[adj])
                
                sugg = record.get('suggested_score')
                if sugg is not None:
                    suggested_scores.append(int(sugg))
                
                reason = record.get('reason')
                if reason:
                    reasons.append(reason)
            
            # Calculate community score
            # Priority: 1) Average of suggested scores, 2) Neutral (50) + avg adjustment
            if suggested_scores:
                community_score = sum(suggested_scores) / len(suggested_scores)
            elif adjustments:
                # Start at neutral and apply average adjustment
                avg_adjustment = sum(adjustments) / len(adjustments)
                community_score = 50 + avg_adjustment
            else:
                # No quantifiable feedback
                community_score = None
            
            # Clamp to 0-100
            if community_score is not None:
                community_score = max(0, min(100, int(round(community_score))))
            
            # Store results
            rating_count = len(records)
            result[f'{mobility_type}_user_score'] = community_score
            result[f'{mobility_type}_rating_count'] = rating_count
            result[f'{mobility_type}_confidence'] = get_confidence_level(rating_count)
            
            # Store most common reasons (top 3)
            if reasons:
                from collections import Counter
                reason_counts = Counter(reasons)
                top_reasons = [reason for reason, count in reason_counts.most_common(3)]
                result[f'{mobility_type}_common_reasons'] = top_reasons
            else:
                result[f'{mobility_type}_common_reasons'] = []
        
        results.append(result)
        processed_count += 1
    
    print(f"  ✓ Aggregated scores for {processed_count} parkruns")
    
    return results

def create_placeholder_entries(
    slug_to_uid: Dict[str, int],
    processed_slugs: set
) -> List[Dict]:
    """
    Create placeholder entries for parkruns without user feedback.
    
    Args:
        slug_to_uid: Mapping of slug -> parkrun UID
        processed_slugs: Set of slugs that have user scores
    
    Returns:
        List of placeholder entries
    """
    print()
    print("Creating placeholders for parkruns without user feedback...")
    
    placeholders = []
    
    for slug, uid in slug_to_uid.items():
        if slug in processed_slugs:
            continue
        
        placeholder = {
            'uid': uid,
            'slug': slug,
            'has_user_scores': False,
            'total_feedback_count': 0
        }
        
        # Add null scores for all mobility types
        for mobility_type in MOBILITY_TYPES:
            placeholder[f'{mobility_type}_user_score'] = None
            placeholder[f'{mobility_type}_rating_count'] = 0
            placeholder[f'{mobility_type}_confidence'] = 'none'
            placeholder[f'{mobility_type}_common_reasons'] = []
        
        placeholders.append(placeholder)
    
    print(f"  ✓ Created {len(placeholders)} placeholder entries")
    
    return placeholders

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("=" * 60)
    print("07_fetch_user_scores.py - User Feedback Aggregation")
    print("=" * 60)
    print()
    
    # Load parkrun info for UID mapping
    print("Loading parkrun info...")
    with open(INFO_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # Handle metadata wrapper if present
        if isinstance(data, dict) and 'events' in data:
            parkrun_info = data['events']
        elif isinstance(data, dict) and 'parkruns' in data:
            parkrun_info = data['parkruns']
        else:
            parkrun_info = data if isinstance(data, list) else []
    
    slug_to_uid = {item['slug']: item['uid'] for item in parkrun_info}
    print(f"  ✓ Loaded {len(slug_to_uid)} parkrun mappings")
    
    # Initialize Supabase client
    print()
    print("Connecting to Supabase...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("  ✓ Connected successfully")
    except Exception as e:
        print(f"  ✗ Connection failed: {e}")
        return
    
    # Fetch user feedback
    print()
    feedback_records = fetch_user_feedback(supabase)
    
    if not feedback_records:
        print()
        print("No user feedback found. Creating empty dataset...")
        results = []
    else:
        # Aggregate scores
        results = aggregate_user_scores(feedback_records, slug_to_uid)
    
    # Add placeholders
    processed_slugs = {item['slug'] for item in results}
    placeholders = create_placeholder_entries(slug_to_uid, processed_slugs)
    results.extend(placeholders)
    
    # Sort by UID
    results.sort(key=lambda x: x['uid'])
    
    # Save results
    print()
    print("Saving results...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"  ✓ Saved to {OUTPUT_FILE.name}")
    
    # Statistics
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total parkruns: {len(results)}")
    print(f"With user feedback: {len(results) - len(placeholders)}")
    print(f"Without user feedback: {len(placeholders)}")
    print(f"Total feedback records: {len(feedback_records)}")
    
    if feedback_records:
        # Per-mobility type statistics
        print()
        print("Feedback by Mobility Type:")
        mobility_counts = defaultdict(int)
        for record in feedback_records:
            mobility = record.get('mobility_type')
            if mobility:
                mobility_counts[mobility] += 1
        
        for mobility_type in MOBILITY_TYPES:
            count = mobility_counts.get(mobility_type, 0)
            print(f"  {mobility_type}: {count} ratings")
        
        # Confidence distribution
        print()
        print("Confidence Distribution:")
        confidence_counts = defaultdict(int)
        for result in results:
            for mobility_type in MOBILITY_TYPES:
                conf = result.get(f'{mobility_type}_confidence', 'none')
                if conf != 'none':
                    confidence_counts[conf] += 1
        
        for level in ['high', 'medium', 'low', 'very_low']:
            count = confidence_counts.get(level, 0)
            print(f"  {level}: {count} mobility×parkrun combinations")
    
    print()
    print("✓ User score aggregation complete!")
    print()

if __name__ == '__main__':
    main()
