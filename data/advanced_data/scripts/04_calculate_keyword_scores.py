"""
04_calculate_keyword_scores.py

Calculates accessibility scores for each parkrun by matching keywords from keywords.json
against the clean_description text in 02_gold_parkrun_descriptions.json.

Input:
- ../data/keywords.json (keyword definitions and impact scores)
- ../data/02_gold_parkrun_descriptions.json (course descriptions)

Output:
- ../data/04_gold_parkrun_keywords_score.json

Schema:
{
    "uid": int,
    "slug": str,
    "racing_chair_keyword_score": int (0-100),
    "day_chair_keyword_score": int (0-100),
    "off_road_chair_keyword_score": int (0-100),
    "handbike_keyword_score": int (0-100),
    "frame_runner_keyword_score": int (0-100),
    "walking_frame_keyword_score": int (0-100),
    "crutches_keyword_score": int (0-100),
    "walking_stick_keyword_score": int (0-100),
    "matched_keywords": [str] (list of matched keyword phrases),
    "keyword_count": int (total keywords matched)
}

Methodology:
1. Start each mobility type at 50/100 (neutral baseline)
2. Search clean_description for each keyword phrase (case-insensitive)
3. When keyword found, add/subtract its impact score for each mobility type
4. Clamp final scores to 0-100 range
5. Track which keywords were matched for transparency
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
KEYWORDS_FILE = DATA_DIR / 'keywords.json'
DESCRIPTIONS_FILE = DATA_DIR / '02_gold_parkrun_descriptions.json'
OUTPUT_FILE = DATA_DIR / '04_gold_parkrun_keywords_score.json'

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


def load_keywords() -> Dict:
    """Load keyword definitions from keywords.json"""
    with open(KEYWORDS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_descriptions() -> List[Dict]:
    """Load parkrun descriptions from 02_gold_parkrun_descriptions.json"""
    with open(DESCRIPTIONS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def extract_all_keywords(keywords_data: Dict) -> List[tuple]:
    """
    Extract all keywords from the keywords.json structure.
    Returns list of (keyword_phrase, impact_dict, category) tuples.
    
    Args:
        keywords_data: Full keywords.json data structure
        
    Returns:
        List of tuples: (keyword_phrase, {mobility_type: impact_score}, category_name)
    """
    all_keywords = []
    
    # Iterate through all top-level categories (skip metadata)
    for category_name, category_data in keywords_data.items():
        if category_name == 'metadata':
            continue
            
        # Each category has subcategories with keywords and impacts
        for subcategory_name, subcategory_data in category_data.items():
            if not isinstance(subcategory_data, dict):
                continue
                
            # Get keywords list and impact dict
            keywords = subcategory_data.get('keywords', [])
            impacts = subcategory_data.get('impact', {})
            
            # Add each keyword with its full impact dictionary
            for keyword in keywords:
                all_keywords.append((keyword, impacts, f"{category_name}.{subcategory_name}"))
    
    return all_keywords


def find_keywords_in_text(text: str, all_keywords: List[tuple]) -> tuple:
    """
    Search for all keywords in the given text (case-insensitive).
    Returns matched keywords and their cumulative impacts.
    
    Args:
        text: The clean_description text to search
        all_keywords: List of (keyword, impacts, category) tuples
        
    Returns:
        Tuple of (matched_keywords_list, cumulative_impacts_dict)
    """
    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    matched_keywords = []
    cumulative_impacts = {mobility: 0 for mobility in MOBILITY_TYPES}
    
    for keyword_phrase, impacts, category in all_keywords:
        keyword_lower = keyword_phrase.lower()
        
        # Use word boundary matching to avoid partial matches
        # e.g. "grass" shouldn't match "undergrass"
        pattern = r'\b' + re.escape(keyword_lower) + r'\b'
        
        if re.search(pattern, text_lower):
            matched_keywords.append(keyword_phrase)
            
            # Add impacts for each mobility type
            for mobility_type in MOBILITY_TYPES:
                impact_value = impacts.get(mobility_type, 0)
                cumulative_impacts[mobility_type] += impact_value
    
    return matched_keywords, cumulative_impacts


def calculate_final_scores(cumulative_impacts: Dict[str, int], starting_score: int = 50) -> Dict[str, int]:
    """
    Calculate final scores from cumulative impacts, clamped to 0-100 range.
    
    Args:
        cumulative_impacts: Dict of {mobility_type: total_impact}
        starting_score: Starting baseline (default 50)
        
    Returns:
        Dict of {mobility_type: final_score (0-100)}
    """
    final_scores = {}
    
    for mobility_type, impact in cumulative_impacts.items():
        raw_score = starting_score + impact
        # Clamp to 0-100 range
        final_score = max(0, min(100, raw_score))
        final_scores[mobility_type] = final_score
    
    return final_scores


def calculate_scores_for_parkrun(parkrun: Dict, all_keywords: List[tuple]) -> Dict:
    """
    Calculate keyword-based accessibility scores for a single parkrun.
    
    Args:
        parkrun: Parkrun data from 02_gold_parkrun_descriptions.json
        all_keywords: List of all keywords with impacts
        
    Returns:
        Score data dict with uid, slug, scores, and matched keywords
    """
    # Get clean description text
    clean_description = parkrun.get('clean_description', '')
    
    # Find all matching keywords and calculate impacts
    matched_keywords, cumulative_impacts = find_keywords_in_text(clean_description, all_keywords)
    
    # Calculate final scores (starting at 50, applying impacts, clamping to 0-100)
    final_scores = calculate_final_scores(cumulative_impacts, starting_score=50)
    
    # Build output structure
    result = {
        'uid': parkrun['uid'],
        'slug': parkrun['slug'],
        'racing_chair_keyword_score': final_scores['racing_chair'],
        'day_chair_keyword_score': final_scores['day_chair'],
        'off_road_chair_keyword_score': final_scores['off_road_chair'],
        'handbike_keyword_score': final_scores['handbike'],
        'frame_runner_keyword_score': final_scores['frame_runner'],
        'walking_frame_keyword_score': final_scores['walking_frame'],
        'crutches_keyword_score': final_scores['crutches'],
        'walking_stick_keyword_score': final_scores['walking_stick'],
        'matched_keywords': sorted(matched_keywords),  # Alphabetically sorted for consistency
        'keyword_count': len(matched_keywords)
    }
    
    return result


def main():
    """Main execution function"""
    print("=" * 60)
    print("04 - CALCULATE KEYWORD SCORES")
    print("=" * 60)
    print()
    
    # Load data
    print("Loading keyword definitions...")
    keywords_data = load_keywords()
    metadata = keywords_data.get('metadata', {})
    print(f"✓ Loaded keywords version {metadata.get('version', 'unknown')}")
    print()
    
    print("Loading parkrun descriptions...")
    descriptions = load_descriptions()
    print(f"✓ Loaded {len(descriptions)} parkrun descriptions")
    print()
    
    # Extract all keywords
    print("Extracting keywords from categories...")
    all_keywords = extract_all_keywords(keywords_data)
    print(f"✓ Extracted {len(all_keywords)} total keyword phrases")
    print()
    
    # Calculate scores for all parkruns
    print("Calculating keyword-based accessibility scores...")
    results = []
    
    for i, parkrun in enumerate(descriptions, 1):
        result = calculate_scores_for_parkrun(parkrun, all_keywords)
        results.append(result)
        
        # Progress reporting every 100 parkruns
        if i % 100 == 0:
            print(f"  Processed {i}/{len(descriptions)} parkruns... ({i/len(descriptions)*100:.1f}%)")
    
    print(f"✓ Completed scoring for all {len(results)} parkruns")
    print()
    
    # Calculate statistics
    print("=" * 60)
    print("SCORE STATISTICS")
    print("=" * 60)
    print()
    
    for mobility_type in MOBILITY_TYPES:
        score_key = f"{mobility_type}_keyword_score"
        scores = [r[score_key] for r in results]
        avg_score = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
        zero_count = sum(1 for s in scores if s == 0)
        perfect_count = sum(1 for s in scores if s == 100)
        
        print(f"{mobility_type.replace('_', ' ').title()}:")
        print(f"  Average: {avg_score:.1f}")
        print(f"  Range: {min_score} - {max_score}")
        print(f"  Zero scores: {zero_count} ({zero_count/len(scores)*100:.1f}%)")
        print(f"  Perfect scores: {perfect_count} ({perfect_count/len(scores)*100:.1f}%)")
        print()
    
    # Keyword matching statistics
    keyword_counts = [r['keyword_count'] for r in results]
    avg_keywords = sum(keyword_counts) / len(keyword_counts)
    min_keywords = min(keyword_counts)
    max_keywords = max(keyword_counts)
    
    print("Keyword Matches:")
    print(f"  Average per parkrun: {avg_keywords:.1f}")
    print(f"  Range: {min_keywords} - {max_keywords}")
    print()
    
    # Save results
    print("Saving results to JSON...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to {OUTPUT_FILE}")
    print()
    print("=" * 60)
    print("KEYWORD SCORING COMPLETE!")
    print("=" * 60)


if __name__ == '__main__':
    main()
