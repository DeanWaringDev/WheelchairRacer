"""
Recalculate accessibility scores from existing gold data
Uses cleaned descriptions instead of full descriptions to avoid boilerplate text
"""

import json
from typing import Dict, List

# Base scores for each mobility aid type
BASE_SCORES = {
    "racing_chair": 35,
    "day_chair": 30,
    "off_road_chair": 45,
    "handbike": 25,
    "frame_runner": 40,
    "walking_frame": 50,
    "crutches": 55,
    "walking_stick": 60
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


def calculate_accessibility_scores(keywords: List[Dict], base_scores: Dict[str, int]) -> Dict:
    """
    Calculate final accessibility scores with full breakdown
    """
    accessibility = {}
    
    for mobility_type, starting_score in base_scores.items():
        # Calculate keyword adjustment
        keyword_data = calculate_keyword_adjustment(keywords, mobility_type)
        
        # Calculate final score (capped between 0-100)
        final_score = max(0, min(100, starting_score + keyword_data['total']))
        
        accessibility[mobility_type] = {
            "starting_score": starting_score,
            "keyword_adjustment": keyword_data['total'],
            "user_adjustment": 0,  # Keep existing user adjustments
            "final_score": final_score,
            "breakdown": keyword_data['applied']
        }
    
    return accessibility


def main():
    print("Loading existing gold data...")
    with open('gold_parkrun_data.json', 'r', encoding='utf-8') as f:
        gold_data = json.load(f)
    
    parkruns = gold_data['events']
    print(f"Loaded {len(parkruns)} parkruns")
    
    print("\nLoading keywords dictionary...")
    with open('keywords.json', 'r', encoding='utf-8') as f:
        keywords_dict = json.load(f)
    
    print(f"\nRecalculating scores for all parkruns...")
    print("Using CLEANED descriptions (not full) to avoid boilerplate text")
    print("="*80)
    
    updated_count = 0
    
    for parkrun in parkruns:
        # Extract keywords from cleaned description and summary ONLY
        cleaned_desc = parkrun.get('descriptions', {}).get('cleaned', '')
        summary = parkrun.get('descriptions', {}).get('summary', '')
        
        keywords_cleaned = find_keywords_in_text(cleaned_desc, keywords_dict) if cleaned_desc else []
        keywords_summary = find_keywords_in_text(summary, keywords_dict) if summary else []
        
        # Combine and deduplicate
        all_keywords = {kw['keyword']: kw for kw in (keywords_cleaned + keywords_summary)}
        matched_keywords = list(all_keywords.values())
        
        # Recalculate accessibility scores
        accessibility = calculate_accessibility_scores(matched_keywords, BASE_SCORES)
        
        # Update the parkrun data
        parkrun['keywords'] = {
            "matched": [kw['keyword'] for kw in matched_keywords],
            "count": len(matched_keywords),
            "sources": {
                "cleaned_description": [kw['keyword'] for kw in keywords_cleaned],
                "summary": [kw['keyword'] for kw in keywords_summary]
            },
            "details": matched_keywords
        }
        
        parkrun['accessibility'] = accessibility
        
        updated_count += 1
        
        if updated_count % 100 == 0:
            print(f"Processed {updated_count} parkruns...")
    
    print(f"\n✅ Recalculated scores for {updated_count} parkruns")
    
    # Update metadata
    gold_data['metadata']['last_updated'] = "Scores recalculated from cleaned descriptions"
    
    # Save updated data
    print("\nSaving updated gold data...")
    with open('gold_parkrun_data.json', 'w', encoding='utf-8') as f:
        json.dump(gold_data, f, ensure_ascii=False, indent=2)
    
    print("✅ Saved to gold_parkrun_data.json")
    
    # Show sample of changes
    print("\n" + "="*80)
    print("SAMPLE: Rutland Water parkrun")
    print("="*80)
    
    rutland = next((p for p in parkruns if p['slug'] == 'rutlandwater'), None)
    if rutland:
        racing_chair = rutland['accessibility']['racing_chair']
        print(f"Racing Chair Score: {racing_chair['final_score']}")
        print(f"  Starting: {racing_chair['starting_score']}")
        print(f"  Keyword Adjustment: {racing_chair['keyword_adjustment']}")
        print(f"  Keywords matched: {rutland['keywords']['count']}")
        print(f"\nTop keywords:")
        for kw in rutland['keywords']['details'][:10]:
            impact = kw['impacts'].get('racing_chair', 0)
            if impact != 0:
                print(f"  {kw['keyword']}: {impact:+d}")


if __name__ == "__main__":
    main()
