"""
Local parkrun comparison for Dean's area (Northampton region)
"""

import json
import csv
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
BASELINE_CSV = DATA_DIR.parent / 'current_scores_baseline.csv'
KEYWORD_JSON = DATA_DIR / '04_gold_parkrun_keywords_score.json'

# Load data
print("Loading data...")
with open(KEYWORD_JSON, 'r', encoding='utf-8') as f:
    keyword_scores = json.load(f)

with open(BASELINE_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    baseline_scores = list(reader)

# Create lookup by ID
baseline_by_id = {int(row['id']): row for row in baseline_scores}
keyword_by_id = {item['uid']: item for item in keyword_scores}

# Local parkruns from Northampton area
local_parkruns = [
    265,  # Northampton parkrun
    629,  # Corby parkrun
    324,  # Market Harborough parkrun
    1014, # Rutland Water parkrun
    322,  # Kettering parkrun
]

print("\n" + "=" * 120)
print("NORTHAMPTON AREA PARKRUNS - SCORE COMPARISON")
print("=" * 120)
print("\nComparing baseline scores vs new keyword-based scores")
print("Focus: Do the new scores match Dean's real-world experience?")
print()

for parkrun_id in local_parkruns:
    if parkrun_id not in baseline_by_id or parkrun_id not in keyword_by_id:
        print(f"\n⚠️  Parkrun ID {parkrun_id} not found in both datasets")
        continue
    
    baseline = baseline_by_id[parkrun_id]
    keyword = keyword_by_id[parkrun_id]
    
    print(f"\n{'═' * 120}")
    print(f"📍 {baseline['name'].upper()} (ID: {parkrun_id}, Slug: {keyword['slug']})")
    print(f"{'═' * 120}")
    print(f"\n🔍 Matched Keywords ({keyword['keyword_count']}): {', '.join(keyword['matched_keywords'])}")
    print()
    
    # Calculate averages
    mobility_types = [
        ('Racing Chair', 'racing_chair', 'RC'),
        ('Day Chair', 'day_chair', 'DC'),
        ('Off Road Chair', 'off_road_chair', 'ORC'),
        ('Handbike', 'handbike', 'HB'),
        ('Frame Runner', 'frame_runner', 'FR'),
        ('Walking Frame', 'walking_frame', 'WF'),
        ('Crutches', 'crutches', 'CR'),
        ('Walking Stick', 'walking_stick', 'WS')
    ]
    
    baseline_avg = sum(int(baseline[key]) for _, key, _ in mobility_types) / len(mobility_types)
    keyword_avg = sum(keyword[f"{key}_keyword_score"] for _, key, _ in mobility_types) / len(mobility_types)
    
    print(f"{'Mobility Type':<20} {'Baseline':>10} {'New Score':>10} {'Change':>10} {'Assessment':<30}")
    print(f"{'─' * 20} {'─' * 10} {'─' * 10} {'─' * 10} {'─' * 30}")
    
    for display_name, key, abbr in mobility_types:
        baseline_score = int(baseline[key])
        new_score = keyword[f"{key}_keyword_score"]
        change = new_score - baseline_score
        
        # Detailed assessment
        if change > 30:
            assessment = "🚀 Much better detection"
        elif change > 10:
            assessment = "📈 Improved accuracy"
        elif change > 0:
            assessment = "✓ Slightly better"
        elif change == 0:
            assessment = "= No change"
        elif change > -10:
            assessment = "✓ Slightly lower"
        elif change > -30:
            assessment = "📉 More realistic?"
        else:
            assessment = "⚠️  Significantly lower"
        
        # Add indicator if baseline was zero
        if baseline_score == 0 and new_score > 0:
            assessment += " (was missing data)"
        
        print(f"{display_name:<20} {baseline_score:>10} {new_score:>10} {change:>+10} {assessment:<30}")
    
    print(f"\n{'─' * 120}")
    print(f"Average Score:       {baseline_avg:>10.1f} {keyword_avg:>10.1f} {keyword_avg - baseline_avg:>+10.1f}")
    print()

print("\n" + "=" * 120)
print("INTERPRETATION GUIDE")
print("=" * 120)
print()
print("Questions to consider:")
print("  1. Do the NEW scores better match your actual racing/training experience?")
print("  2. Are difficult courses now showing lower scores (more realistic)?")
print("  3. Are easy/accessible courses showing higher scores?")
print("  4. Do the matched keywords accurately describe each course?")
print()
print("Remember: These are KEYWORD-ONLY scores. Final scores will also include:")
print("  • GPX analysis (corners, tight turns, path width)")
print("  • Elevation data (hills, gradients, climbs)")
print("  • User community ratings")
print()
print("Next step: Dean reviews these scores against his real-world knowledge!")
print("=" * 120)
print()
