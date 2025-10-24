"""
NORTHAMPTON AREA PARKRUNS - DETAILED COMPARISON
Dean's local parkruns to validate scoring accuracy
"""

print("=" * 100)
print("NORTHAMPTON AREA PARKRUNS - BASELINE vs NEW KEYWORD SCORES")
print("=" * 100)
print()

parkruns = [
    {
        "name": "Northampton parkrun",
        "baseline_id": 265,
        "keyword_uid": None,  # Need to find by slug
        "slug": "medina",
        "baseline": {"RC": 40, "DC": 45, "ORC": 65, "HB": 40, "FR": 70, "WF": 50, "CR": 60, "WS": 60},
        "keyword": {"RC": 0, "DC": 25, "ORC": 80, "HB": 45, "FR": 30, "WF": 0, "CR": 35, "WS": 25},
        "keywords": ["even", "field", "flat", "grass", "gravel", "lap course", "mixture of", "parkrun", "road", "tarmac", "two lap", "uneven", "wet"]
    },
    {
        "name": "Corby parkrun",
        "baseline_id": 629,
        "keyword_uid": 633,
        "slug": "corby",
        "baseline": {"RC": 0, "DC": 0, "ORC": 40, "HB": 0, "FR": 0, "WF": 0, "CR": 0, "WS": 0},
        "keyword": {"RC": 0, "DC": 25, "ORC": 75, "HB": 45, "FR": 40, "WF": 0, "CR": 45, "WS": 45},
        "keywords": ["even", "grass", "mixture of", "parkrun", "road", "steep slope", "tarmac", "trail", "winter"]
    },
    {
        "name": "Market Harborough parkrun",
        "baseline_id": 324,
        "keyword_uid": 246,
        "slug": "marketharborough",
        "baseline": {"RC": 70, "DC": 90, "ORC": 100, "HB": 95, "FR": 100, "WF": 75, "CR": 100, "WS": 95},
        "keyword": {"RC": 100, "DC": 100, "ORC": 100, "HB": 100, "FR": 100, "WF": 100, "CR": 100, "WS": 100},
        "keywords": ["accessible", "even", "fully accessible", "grass", "mixture of", "parkrun", "road", "tarmac", "wheelchair friendly"]
    },
    {
        "name": "Rutland Water parkrun",
        "baseline_id": 1014,
        "keyword_uid": None,
        "slug": "moora",
        "baseline": {"RC": 40, "DC": 45, "ORC": 80, "HB": 45, "FR": 75, "WF": 45, "CR": 60, "WS": 65},
        "keyword": {"RC": 55, "DC": 75, "ORC": 100, "HB": 85, "FR": 100, "WF": 60, "CR": 95, "WS": 80},
        "keywords": ["even", "flat", "grass", "laps", "mixture of", "parkrun", "road", "trail"]
    },
    {
        "name": "Kettering parkrun",
        "baseline_id": 322,
        "keyword_uid": 244,
        "slug": "kettering",
        "baseline": {"RC": 0, "DC": 0, "ORC": 45, "HB": 0, "FR": 0, "WF": 0, "CR": 0, "WS": 0},
        "keyword": {"RC": 40, "DC": 55, "ORC": 80, "HB": 65, "FR": 65, "WF": 50, "CR": 50, "WS": 40},
        "keywords": ["after rain", "even", "grass", "laps", "level", "mixture of", "parkrun", "puddles", "road", "tarmac"]
    }
]

for pr in parkruns:
    print("\n" + "─" * 100)
    print(f"📍 {pr['name'].upper()}")
    print("─" * 100)
    print(f"Slug: {pr['slug']}")
    print(f"Keywords ({len(pr['keywords'])}): {', '.join(pr['keywords'][:6])}")
    if len(pr['keywords']) > 6:
        print(f"             ... + {', '.join(pr['keywords'][6:])}")
    print()
    
    # Table header
    print(f"{'Mobility':<18} {'Baseline':>10} {'New':>10} {'Change':>10} {'%':>8}")
    print(f"{'-'*18} {'-'*10} {'-'*10} {'-'*10} {'-'*8}")
    
    mobility_types = [
        ("Racing Chair", "RC"),
        ("Day Chair", "DC"),
        ("Off Road Chair", "ORC"),
        ("Handbike", "HB"),
        ("Frame Runner", "FR"),
        ("Walking Frame", "WF"),
        ("Crutches", "CR"),
        ("Walking Stick", "WS")
    ]
    
    total_baseline = 0
    total_keyword = 0
    
    for name, code in mobility_types:
        base = pr['baseline'][code]
        new = pr['keyword'][code]
        change = new - base
        pct_change = ((new - base) / base * 100) if base > 0 else 0
        
        # Color indicators
        if change >= 30:
            indicator = "🚀"
        elif change >= 10:
            indicator = "📈"
        elif change > 0:
            indicator = "↑"
        elif change == 0:
            indicator = "→"
        elif change > -10:
            indicator = "↓"
        elif change > -30:
            indicator = "📉"
        else:
            indicator = "⚠️"
        
        total_baseline += base
        total_keyword += new
        
        if base == 0 and new > 0:
            print(f"{name:<18} {base:>10} {new:>10} {change:>+10} {'N/A':>8} {indicator} (was missing)")
        elif base == 0:
            print(f"{name:<18} {base:>10} {new:>10} {change:>+10} {'N/A':>8} {indicator}")
        else:
            print(f"{name:<18} {base:>10} {new:>10} {change:>+10} {pct_change:>+7.0f}% {indicator}")
    
    print(f"{'-'*18} {'-'*10} {'-'*10} {'-'*10} {'-'*8}")
    avg_base = total_baseline / 8
    avg_new = total_keyword / 8
    avg_change = avg_new - avg_base
    avg_pct = ((avg_new - avg_base) / avg_base * 100) if avg_base > 0 else 0
    
    print(f"{'AVERAGE':<18} {avg_base:>10.1f} {avg_new:>10.1f} {avg_change:>+10.1f} {avg_pct:>+7.0f}%")

print("\n" + "=" * 100)
print("SUMMARY & VALIDATION")
print("=" * 100)
print()
print("Dean's Assessment Questions:")
print("  1. Do these NEW scores match your racing experience better than baseline?")
print("  2. Market Harborough: Perfect 100s - does it deserve to be top-rated?")
print("  3. Northampton: Big drops in most scores - is it actually difficult?")
print("  4. Corby: 'Steep slope' keyword detected - accurate?")
print("  5. Rutland Water: Significant improvements - is it easier than baseline suggested?")
print("  6. Kettering: Was missing data (zeros), now has scores - seem reasonable?")
print()
print("Next steps:")
print("  • Once GPX files complete → Corner analysis will detect tight turns")
print("  • Elevation API → Will quantify gradients and hills")
print("  • Combined scoring → More nuanced than keywords alone")
print()
print("=" * 100)
