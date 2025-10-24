"""
08_calculate_final_scores.py - Calculate Final Weighted Accessibility Scores

This script combines all scoring sources (keywords, maneuverability, elevation, user feedback)
using mobility-specific weighting to produce final accessibility scores for each parkrun.

The weighting system is tuned based on ground-truth validation from real wheelchair users
and recognizes that different mobility types prioritize different factors:
- Racing chairs: Heavily affected by path width and turns (high maneuverability weight)
- Walking aids: Heavily affected by gradual hills (high elevation weight)
- Off-road chairs: Better at handling terrain (lower penalty weights)

Input Files:
    - data/04_gold_parkrun_keywords_score.json (keyword-based scoring)
    - data/05_gold_parkrun_map_analysis_score.json (turn/width analysis)
    - data/06_gold_parkrun_elevation_score.json (gradient analysis)
    - data/07_gold_parkrun_user_submitted_scores.json (community feedback)

Output:
    - data/08_gold_parkrun_final_scores.json (final weighted scores)

Author: Dean Waring
Date: 2024-10-24
"""

import json
from pathlib import Path
from typing import Dict, List, Optional

# ============================================================
# CONFIGURATION
# ============================================================

# File paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'

KEYWORDS_FILE = DATA_DIR / '04_gold_parkrun_keywords_score.json'
MANEUVER_FILE = DATA_DIR / '05_gold_parkrun_map_analysis_score.json'
ELEVATION_FILE = DATA_DIR / '06_gold_parkrun_elevation_score.json'
USER_SCORES_FILE = DATA_DIR / '07_gold_parkrun_user_submitted_scores.json'
OUTPUT_FILE = DATA_DIR / '08_gold_parkrun_final_scores.json'

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

# ============================================================
# MOBILITY-SPECIFIC WEIGHTING
# ============================================================

# Weights tuned based on ground-truth validation from real users
# Each mobility type has different priorities:
#
# Racing Chair: VERY sensitive to path width and tight turns (high maneuverability)
#               Elevation critical (risk of tipping backwards on steep hills)
#               Keywords catch major obstacles
#
# Day Chair: Moderate sensitivity to turns, sensitive to elevation
#            Elevation = accessibility barrier (can't climb steep hills, tipping risk)
#            Keywords important for terrain type
#
# Off-Road Chair: Better at handling terrain than day chair
#                 More tolerant of rough surfaces
#                 Still affected by major obstacles
#
# Walking Aids: Hills are HARDER but NOT accessibility barriers (can still complete)
#               More affected by surface quality, obstacles, narrow paths
#               Elevation weight reduced - difficulty ≠ inaccessibility
#
# USER FEEDBACK: Most valuable resource - increased weights significantly
#                Will readjust if trolls submit unrealistic scores

MOBILITY_WEIGHTS = {
    'racing_chair': {
        'keywords': 0.20,       # 20% - Catches major obstacles, surface issues (reduced from 25%)
        'maneuverability': 0.40, # 40% - CRITICAL for racing chairs (reduced from 50%)
        'elevation': 0.10,      # 10% - Important (reduced from 15%)
        'user_feedback': 0.30   # 30% - Most valuable! (increased from 10%)
    },
    'day_chair': {
        'keywords': 0.20,       # 20% - Terrain and obstacle detection (reduced from 25%)
        'maneuverability': 0.15, # 15% - Moderate sensitivity to turns (reduced from 20%)
        'elevation': 0.30,      # 30% - Accessibility barrier (reduced from 40%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    },
    'off_road_chair': {
        'keywords': 0.20,       # 20% - Important for terrain type (reduced from 30%)
        'maneuverability': 0.10, # 10% - Less critical (reduced from 15%)
        'elevation': 0.25,      # 25% - Moderate sensitivity (reduced from 35%)
        'user_feedback': 0.45   # 45% - Most valuable! (increased from 20%)
    },
    'handbike': {
        'keywords': 0.20,       # 20% - Terrain and obstacle detection (reduced from 25%)
        'maneuverability': 0.20, # 20% - Moderate sensitivity (reduced from 30%)
        'elevation': 0.25,      # 25% - Upper body strength helps (reduced from 30%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    },
    'frame_runner': {
        'keywords': 0.20,       # 20% - Terrain and obstacle detection (reduced from 25%)
        'maneuverability': 0.20, # 20% - Moderate sensitivity (reduced from 30%)
        'elevation': 0.25,      # 25% - Moderate difficulty (reduced from 30%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    },
    'walking_frame': {
        'keywords': 0.30,       # 30% - Surface, obstacles CRITICAL (reduced from 40%)
        'maneuverability': 0.10, # 10% - Path width moderately important (reduced from 15%)
        'elevation': 0.25,      # 25% - Hills harder but not inaccessible (reduced from 30%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    },
    'crutches': {
        'keywords': 0.30,       # 30% - Surface and obstacles CRITICAL (reduced from 40%)
        'maneuverability': 0.10, # 10% - Some sensitivity (reduced from 15%)
        'elevation': 0.25,      # 25% - Hills harder but not inaccessible (reduced from 30%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    },
    'walking_stick': {
        'keywords': 0.30,       # 30% - Surface and obstacles CRITICAL (reduced from 40%)
        'maneuverability': 0.10, # 10% - Some sensitivity (reduced from 15%)
        'elevation': 0.25,      # 25% - Hills harder but not inaccessible (reduced from 30%)
        'user_feedback': 0.35   # 35% - Most valuable! (increased from 15%)
    }
}

# User feedback confidence multipliers
# High confidence user feedback gets higher weight
CONFIDENCE_MULTIPLIERS = {
    'none': 0.0,       # No user feedback - use base weights
    'very_low': 0.3,   # 1 rating - low confidence, minimal weight adjustment
    'low': 0.6,        # 2-4 ratings - moderate confidence
    'medium': 0.8,     # 5-9 ratings - good confidence
    'high': 1.0        # 10+ ratings - high confidence, full weight
}

# ============================================================
# SCORE CALCULATION
# ============================================================

def calculate_weighted_score(
    keyword_score: Optional[int],
    maneuver_score: Optional[int],
    elevation_score: Optional[int],
    user_score: Optional[int],
    user_confidence: str,
    mobility_type: str
) -> Dict:
    """
    Calculate final weighted score for a specific mobility type.
    
    Strategy:
    1. Get base weights for this mobility type
    2. Adjust user feedback weight based on confidence level
    3. Redistribute weights if any components are missing
    4. Calculate weighted average
    5. Apply "minimum penalty" - if any critical component is very low, cap the final score
    
    The "minimum penalty" prevents scenarios where one bad score (e.g., maneuverability 15)
    gets averaged out by good scores in other areas. Real-world accessibility requires
    ALL factors to be acceptable.
    
    Args:
        keyword_score: 0-100 or None
        maneuver_score: 0-100 or None
        elevation_score: 0-100 or None
        user_score: 0-100 or None
        user_confidence: 'none', 'very_low', 'low', 'medium', 'high'
        mobility_type: One of MOBILITY_TYPES
    
    Returns:
        Dict with final_score, component_scores, weights_used, confidence
    """
    # Get base weights
    base_weights = MOBILITY_WEIGHTS[mobility_type].copy()
    
    # Adjust user feedback weight based on confidence
    confidence_mult = CONFIDENCE_MULTIPLIERS.get(user_confidence, 0.0)
    
    # For very_low confidence (1 rating), still give it decent weight if it's extreme
    if user_confidence == 'very_low' and user_score is not None:
        if user_score <= 10 or user_score >= 90:
            # Extreme user scores (very bad or very good) - trust them more
            confidence_mult = 0.6
    
    adjusted_user_weight = base_weights['user_feedback'] * confidence_mult
    
    # Track which components are available
    components = {
        'keywords': keyword_score,
        'maneuverability': maneuver_score,
        'elevation': elevation_score,
        'user_feedback': user_score if confidence_mult > 0 else None
    }
    
    # Calculate actual weights (redistribute if components missing)
    available_components = {k: v for k, v in components.items() if v is not None}
    
    if not available_components:
        # No data at all - return neutral score
        return {
            'final_score': 50,
            'component_scores': components,
            'weights_used': base_weights,
            'confidence': 'none',
            'data_sources': 0
        }
    
    # Redistribute weights proportionally
    actual_weights = {}
    for component in available_components.keys():
        if component == 'user_feedback':
            actual_weights[component] = adjusted_user_weight
        else:
            actual_weights[component] = base_weights[component]
    
    # Normalize weights to sum to 1.0
    weight_sum = sum(actual_weights.values())
    if weight_sum > 0:
        actual_weights = {k: v / weight_sum for k, v in actual_weights.items()}
    
    # Calculate weighted score
    weighted_sum = sum(
        available_components[comp] * actual_weights[comp]
        for comp in available_components.keys()
    )
    
    final_score = weighted_sum
    
    # APPLY MINIMUM PENALTY
    # If any highly-weighted component is very low, cap the final score
    # This prevents good scores in one area from masking critical issues in another
    
    penalty_threshold = 25  # Scores below this trigger penalties
    penalty_applied = False
    
    for component, score in available_components.items():
        weight = actual_weights.get(component, 0)
        
        # Only apply penalty if this component has significant weight (>20%)
        if weight >= 0.20 and score <= penalty_threshold:
            # This is a critical component with a bad score
            # Cap final score based on how bad it is
            if score == 0:
                final_score = min(final_score, 0)   # Absolute blocker -> score stays 0
                penalty_applied = True
            elif score <= 5:
                final_score = min(final_score, 15)  # Very bad -> cap at 15
                penalty_applied = True
            elif score <= 15:
                final_score = min(final_score, 30)  # Bad -> cap at 30
                penalty_applied = True
            elif score <= 25:
                final_score = min(final_score, 50)  # Marginal -> cap at 50
                penalty_applied = True
    
    final_score = int(round(final_score))
    
    # Determine overall confidence
    data_source_count = len(available_components)
    if user_confidence in ['high', 'medium']:
        overall_confidence = 'high'
    elif data_source_count >= 3:
        overall_confidence = 'medium'
    elif data_source_count >= 2:
        overall_confidence = 'low'
    else:
        overall_confidence = 'very_low'
    
    return {
        'final_score': final_score,
        'component_scores': components,
        'weights_used': actual_weights,
        'confidence': overall_confidence,
        'data_sources': data_source_count,
        'penalty_applied': penalty_applied
    }

# ============================================================
# DATA LOADING
# ============================================================

def load_data_sources() -> Dict:
    """
    Load all scoring data sources and organize by slug.
    
    Returns:
        Dict with keywords, maneuver, elevation, user_scores organized by slug
    """
    print("Loading data sources...")
    
    # Load keywords
    with open(KEYWORDS_FILE, 'r', encoding='utf-8') as f:
        keywords_data = json.load(f)
    keywords = {item['slug']: item for item in keywords_data}
    print(f"  ✓ Keywords: {len(keywords)} parkruns")
    
    # Load maneuverability
    with open(MANEUVER_FILE, 'r', encoding='utf-8') as f:
        maneuver_data = json.load(f)
    maneuver = {item['slug']: item for item in maneuver_data}
    print(f"  ✓ Maneuverability: {len(maneuver)} parkruns")
    
    # Load elevation
    with open(ELEVATION_FILE, 'r', encoding='utf-8') as f:
        elevation_data = json.load(f)
    elevation = {item['slug']: item for item in elevation_data}
    print(f"  ✓ Elevation: {len(elevation)} parkruns")
    
    # Load user scores
    with open(USER_SCORES_FILE, 'r', encoding='utf-8') as f:
        user_scores_data = json.load(f)
    user_scores = {item['slug']: item for item in user_scores_data}
    print(f"  ✓ User scores: {len(user_scores)} parkruns")
    
    return {
        'keywords': keywords,
        'maneuver': maneuver,
        'elevation': elevation,
        'user_scores': user_scores
    }

# ============================================================
# MAIN CALCULATION
# ============================================================

def calculate_final_scores(data_sources: Dict) -> List[Dict]:
    """
    Calculate final weighted scores for all parkruns and all mobility types.
    
    Args:
        data_sources: Dict with keywords, maneuver, elevation, user_scores
    
    Returns:
        List of final score records
    """
    print()
    print("Calculating final weighted scores...")
    
    keywords = data_sources['keywords']
    maneuver = data_sources['maneuver']
    elevation = data_sources['elevation']
    user_scores = data_sources['user_scores']
    
    results = []
    
    # Process all parkruns (use keywords as master list since it's complete)
    for slug, keyword_data in keywords.items():
        uid = keyword_data['uid']
        
        # Get data from each source
        maneuver_data = maneuver.get(slug, {})
        elevation_data = elevation.get(slug, {})
        user_data = user_scores.get(slug, {})
        
        # Build result for this parkrun
        result = {
            'uid': uid,
            'slug': slug
        }
        
        # Calculate scores for each mobility type
        for mobility_type in MOBILITY_TYPES:
            # Get component scores
            keyword_score = keyword_data.get(f'{mobility_type}_keyword_score')
            maneuver_score = maneuver_data.get(f'{mobility_type}_maneuverability')
            elevation_score = elevation_data.get(f'{mobility_type}_elevation')
            user_score = user_data.get(f'{mobility_type}_user_score')
            user_confidence = user_data.get(f'{mobility_type}_confidence', 'none')
            
            # Calculate weighted score
            score_result = calculate_weighted_score(
                keyword_score,
                maneuver_score,
                elevation_score,
                user_score,
                user_confidence,
                mobility_type
            )
            
            # Store results
            result[f'{mobility_type}_final_score'] = score_result['final_score']
            result[f'{mobility_type}_confidence'] = score_result['confidence']
            result[f'{mobility_type}_data_sources'] = score_result['data_sources']
            
            # Store component breakdown for transparency
            result[f'{mobility_type}_breakdown'] = {
                'keyword_score': keyword_score,
                'maneuverability_score': maneuver_score,
                'elevation_score': elevation_score,
                'user_score': user_score,
                'user_confidence': user_confidence,
                'weights_used': score_result['weights_used']
            }
        
        results.append(result)
    
    # Sort by UID
    results.sort(key=lambda x: x['uid'])
    
    print(f"  ✓ Calculated scores for {len(results)} parkruns")
    
    return results

# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("=" * 60)
    print("08_calculate_final_scores.py - Weighted Score Combination")
    print("=" * 60)
    print()
    
    # Load all data sources
    data_sources = load_data_sources()
    
    # Calculate final scores
    results = calculate_final_scores(data_sources)
    
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
    print()
    
    # Average scores by mobility type
    print("Average Final Scores by Mobility Type:")
    for mobility_type in MOBILITY_TYPES:
        scores = [r[f'{mobility_type}_final_score'] for r in results]
        avg = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
        print(f"  {mobility_type:16}: {avg:5.1f} (range {min_score}-{max_score})")
    
    # Confidence distribution
    print()
    print("Confidence Distribution:")
    for confidence_level in ['high', 'medium', 'low', 'very_low', 'none']:
        count = sum(
            1 for r in results 
            for mt in MOBILITY_TYPES 
            if r.get(f'{mt}_confidence') == confidence_level
        )
        pct = count / (len(results) * len(MOBILITY_TYPES)) * 100
        print(f"  {confidence_level:10}: {count:5} ({pct:4.1f}%)")
    
    # Data source coverage
    print()
    print("Data Source Coverage:")
    for source_count in [4, 3, 2, 1]:
        count = sum(
            1 for r in results
            for mt in MOBILITY_TYPES
            if r.get(f'{mt}_data_sources', 0) == source_count
        )
        pct = count / (len(results) * len(MOBILITY_TYPES)) * 100
        label = "All 4 sources" if source_count == 4 else f"{source_count} sources"
        print(f"  {label:15}: {count:5} ({pct:4.1f}%)")
    
    print()
    print("✓ Final score calculation complete!")
    print()

if __name__ == '__main__':
    main()
