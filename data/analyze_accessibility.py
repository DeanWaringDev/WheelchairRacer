"""
Analyze parkrun accessibility using keywords and calculate scores for all mobility types.

Takes extracted course descriptions and keywords.json to produce accessibility scores.
"""

import json
import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from collections import defaultdict


def load_keywords(filepath: str = "keywords.json") -> Dict:
    """Load the keywords configuration."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def normalize_text(text: str) -> str:
    """Normalize text for keyword matching."""
    # Convert to lowercase
    text = text.lower()
    # Replace common variations
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text


def find_keyword_matches(description: str, keywords_config: Dict) -> List[Dict]:
    """
    Find all keyword matches in a description.
    
    Returns list of matches with their impacts for each mobility type.
    
    Structure of keywords_config:
    {
      "surface_types": {
        "smooth_surfaces": {
          "keywords": ["tarmac", "asphalt", ...],
          "impact": {"racing_chair": 30, "day_chair": 30, ...}
        }
      }
    }
    """
    if not description:
        return []
    
    normalized = normalize_text(description)
    matches = []
    
    # Process each main category (surface_types, terrain_features, etc.)
    for category_name, category_data in keywords_config.items():
        if category_name == 'metadata':
            continue
        
        # Each category has subcategories (smooth_surfaces, packed_surfaces, etc.)
        for subcategory_name, subcategory_data in category_data.items():
            # Get keywords array and impact dict
            keywords = subcategory_data.get('keywords', [])
            impacts = subcategory_data.get('impact', {})
            
            # Check each keyword
            for keyword_phrase in keywords:
                # Normalize keyword for matching
                normalized_keyword = normalize_text(keyword_phrase)
                
                # Check if keyword appears in description
                # Use word boundaries to avoid partial matches
                pattern = r'\b' + re.escape(normalized_keyword) + r'\b'
                
                if re.search(pattern, normalized):
                    matches.append({
                        'keyword': keyword_phrase,
                        'category': category_name,
                        'subcategory': subcategory_name,
                        'impacts': impacts
                    })
    
    return matches


def calculate_scores(matches: List[Dict], mobility_types: List[str]) -> Dict[str, Dict]:
    """
    Calculate accessibility scores for all mobility types.
    
    Starting score: 50/100 (neutral)
    Perfect course: 100/100
    Impossible course: 0/100
    """
    
    scores = {}
    
    for mobility_type in mobility_types:
        # Start at 50 (neutral)
        score = 50
        impacts_applied = []
        
        # Apply each keyword impact
        for match in matches:
            impact = match['impacts'].get(mobility_type, 0)
            
            if impact != 0:
                score += impact
                impacts_applied.append({
                    'keyword': match['keyword'],
                    'category': match['category'],
                    'impact': impact
                })
        
        # Clamp score between 0 and 100
        score = max(0, min(100, score))
        
        scores[mobility_type] = {
            'score': round(score, 1),
            'keyword_count': len(impacts_applied),
            'impacts': impacts_applied
        }
    
    return scores


def categorize_score(score: float) -> str:
    """Categorize score into accessibility levels."""
    if score >= 80:
        return "excellent"
    elif score >= 60:
        return "good"
    elif score >= 40:
        return "moderate"
    elif score >= 20:
        return "challenging"
    else:
        return "very_challenging"


def analyze_all_events(
    input_file: str = "parkrun_descriptions_extracted.json",
    keywords_file: str = "keywords.json",
    output_file: str = "parkrun_accessibility_scores.json"
):
    """
    Analyze accessibility for all parkrun events.
    """
    
    print("Parkrun Accessibility Analysis")
    print("=" * 60)
    
    # Load keywords
    print(f"\nLoading keywords from {keywords_file}...")
    keywords_config = load_keywords(keywords_file)
    
    mobility_types = list(keywords_config['metadata']['mobility_types'].keys())
    print(f"   Analyzing for {len(mobility_types)} mobility types:")
    for mt in mobility_types:
        print(f"   - {mt}")
    
    # Count total keywords
    total_keywords = 0
    for category_name, category_data in keywords_config.items():
        if category_name != 'metadata':
            for subcategory_name, subcategory_data in category_data.items():
                keywords = subcategory_data.get('keywords', [])
                total_keywords += len(keywords)
    print(f"   Total keywords: {total_keywords}")
    
    # Load parkrun data
    print(f"\nLoading parkrun data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        parkrun_data = json.load(f)
    
    events = parkrun_data['events']
    metadata = parkrun_data['metadata']
    print(f"   Found {len(events)} parkrun events")
    
    # Statistics
    stats = {
        'total_events': len(events),
        'analyzed': 0,
        'no_description': 0,
        'keyword_matches_total': 0,
        'avg_keywords_per_event': 0,
        'score_distribution': {mt: defaultdict(int) for mt in mobility_types},
        'best_courses': {mt: [] for mt in mobility_types},
        'worst_courses': {mt: [] for mt in mobility_types}
    }
    
    # Analyze each event
    # Process each event
    print("\nAnalyzing accessibility...")
    for i, event in enumerate(events, 1):
        if i % 250 == 0:
            print(f"   Progress: {i}/{len(events)}")
        
        description = event.get('description', '')
        
        if not description or len(description) < 20:
            stats['no_description'] += 1
            event['accessibility'] = {
                'analyzed': False,
                'reason': 'no_description'
            }
            continue
        
        # Find keyword matches
        matches = find_keyword_matches(description, keywords_config)
        stats['keyword_matches_total'] += len(matches)
        
        # Calculate scores for all mobility types
        scores = calculate_scores(matches, mobility_types)
        
        # Add to event
        event['accessibility'] = {
            'analyzed': True,
            'scores': {mt: scores[mt]['score'] for mt in mobility_types},
            'categories': {mt: categorize_score(scores[mt]['score']) for mt in mobility_types},
            'keyword_matches': len(matches),
            'detailed_scores': scores
        }
        
        stats['analyzed'] += 1
        
        # Update score distribution
        for mt in mobility_types:
            category = categorize_score(scores[mt]['score'])
            stats['score_distribution'][mt][category] += 1
            
            # Track best/worst courses
            stats['best_courses'][mt].append({
                'name': event['name'],
                'score': scores[mt]['score']
            })
            stats['worst_courses'][mt].append({
                'name': event['name'],
                'score': scores[mt]['score']
            })
    
    # Calculate averages
    if stats['analyzed'] > 0:
        stats['avg_keywords_per_event'] = round(
            stats['keyword_matches_total'] / stats['analyzed'], 1
        )
    
    # Get top/bottom courses for each mobility type
    for mt in mobility_types:
        stats['best_courses'][mt] = sorted(
            stats['best_courses'][mt],
            key=lambda x: x['score'],
            reverse=True
        )[:5]
        
        stats['worst_courses'][mt] = sorted(
            stats['worst_courses'][mt],
            key=lambda x: x['score']
        )[:5]
    
    # Save results
    print(f"\nSaving results to {output_file}...")
    output_data = {
        'metadata': {
            **metadata,
            'analysis_version': '1.0',
            'analysis_date': datetime.now().isoformat(),
            'keywords_version': keywords_config['metadata']['version'],
            'mobility_types': mobility_types,
            'scoring_system': keywords_config['metadata']['scoring_system'],
            'statistics': stats
        },
        'events': events
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 60)
    print("ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"Total events:              {stats['total_events']}")
    print(f"Analyzed:                  {stats['analyzed']}")
    print(f"No description:            {stats['no_description']}")
    print(f"Total keyword matches:     {stats['keyword_matches_total']:,}")
    print(f"Avg keywords per event:    {stats['avg_keywords_per_event']}")
    
    print("\n" + "=" * 60)
    print("SCORE DISTRIBUTION BY MOBILITY TYPE")
    print("=" * 60)
    
    for mt in mobility_types:
        print(f"\n{mt.replace('_', ' ').title()}:")
        dist = stats['score_distribution'][mt]
        print(f"  Excellent (80-100):      {dist['excellent']}")
        print(f"  Good (60-79):            {dist['good']}")
        print(f"  Moderate (40-59):        {dist['moderate']}")
        print(f"  Challenging (20-39):     {dist['challenging']}")
        print(f"  Very Challenging (0-19): {dist['very_challenging']}")
        
        print(f"\n  Top 5 courses:")
        for i, course in enumerate(stats['best_courses'][mt], 1):
            print(f"    {i}. {course['name']}: {course['score']}/100")
        
        print(f"\n  Bottom 5 courses:")
        for i, course in enumerate(stats['worst_courses'][mt], 1):
            print(f"    {i}. {course['name']}: {course['score']}/100")
    
    print("\n" + "=" * 60)
    print("Analysis complete!")
    print("=" * 60)


if __name__ == "__main__":
    analyze_all_events()
