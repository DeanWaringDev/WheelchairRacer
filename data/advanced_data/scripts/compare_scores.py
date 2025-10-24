"""
Quick comparison of new keyword scores vs baseline scores for sample parkruns
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
with open(KEYWORD_JSON, 'r') as f:
    keyword_scores = json.load(f)

with open(BASELINE_CSV, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    baseline_scores = list(reader)

# Create lookup by ID
baseline_by_id = {int(row['id']): row for row in baseline_scores}
keyword_by_id = {item['uid']: item for item in keyword_scores}

# Pick 10 diverse parkruns from the baseline CSV
sample_parkruns = [
    100,  # Bushy parkrun
    101,  # Wimbledon Common parkrun
    106,  # Brighton & Hove parkrun
    108,  # Albert parkrun, Middlesbrough
    135,  # Aberdeen parkrun
    146,  # Albert parkrun, Melbourne
    365,  # Abingdon parkrun
    470,  # Aberystwyth parkrun
    1607, # Aberbeeg parkrun
    2391  # Abbey Park parkrun
]

print("\n" + "=" * 120)
print("SCORE COMPARISON: NEW KEYWORD SCORES vs BASELINE SCORES")
print("=" * 120)

for parkrun_id in sample_parkruns:
    if parkrun_id not in baseline_by_id or parkrun_id not in keyword_by_id:
        print(f"\n⚠️  Parkrun ID {parkrun_id} not found in both datasets")
        continue
    
    baseline = baseline_by_id[parkrun_id]
    keyword = keyword_by_id[parkrun_id]
    
    print(f"\n{'─' * 120}")
    print(f"PARKRUN: {baseline['name']} (ID: {parkrun_id}, Slug: {keyword['slug']})")
    print(f"Matched Keywords ({keyword['keyword_count']}): {', '.join(keyword['matched_keywords'][:10])}")
    if keyword['keyword_count'] > 10:
        print(f"                    ... and {keyword['keyword_count'] - 10} more")
    print(f"{'─' * 120}")
    
    # Header
    print(f"{'Mobility Type':<20} {'Baseline':>10} {'New Score':>10} {'Change':>10} {'Status':<15}")
    print(f"{'-' * 20} {'-' * 10} {'-' * 10} {'-' * 10} {'-' * 15}")
    
    mobility_types = [
        ('Racing Chair', 'racing_chair'),
        ('Day Chair', 'day_chair'),
        ('Off Road Chair', 'off_road_chair'),
        ('Handbike', 'handbike'),
        ('Frame Runner', 'frame_runner'),
        ('Walking Frame', 'walking_frame'),
        ('Crutches', 'crutches'),
        ('Walking Stick', 'walking_stick')
    ]
    
    for display_name, key in mobility_types:
        baseline_score = int(baseline[key])
        new_score = keyword[f"{key}_keyword_score"]
        change = new_score - baseline_score
        
        # Determine status
        if change > 0:
            status = f"⬆️ +{change} IMPROVED"
        elif change < 0:
            status = f"⬇️ {change} DECREASED"
        else:
            status = "➡️ SAME"
        
        # Color coding (using text indicators)
        if abs(change) >= 20:
            status = f"{'⚠️ ' if change < 0 else '✨'}{status}"
        
        print(f"{display_name:<20} {baseline_score:>10} {new_score:>10} {change:>+10} {status:<15}")

print("\n" + "=" * 120)
print("SUMMARY")
print("=" * 120)
print()
print("Legend:")
print("  ⬆️  = Score improved (new > baseline)")
print("  ⬇️  = Score decreased (new < baseline)")
print("  ➡️  = Score unchanged")
print("  ✨ = Large improvement (≥20 points)")
print("  ⚠️  = Large decrease (≥20 points)")
print()
print("Note: New scores are keyword-based only. Final scores will combine:")
print("  - Keyword analysis (current)")
print("  - GPX map analysis (corners, turns)")
print("  - Elevation analysis (gradients, hills)")
print("  - User-submitted scores (community ratings)")
print()
