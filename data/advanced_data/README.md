# Advanced Data Analysis - Working Directory

**Created:** 2025-10-22  
**Branch:** feature/advanced-data-analysis  
**Status:** Initial setup complete

## Purpose

This folder contains the working files for building out a modular, reusable data analysis system. The goal is to move beyond parkrun-specific analysis to create a general-purpose event accessibility scoring system.

## Folder Structure

```
advanced_data/
├── data/                           # All data files (input and output)
│   ├── keywords.json              # Keyword definitions for accessibility scoring
│   ├── raw_parkrun_data.json      # Raw scraped parkrun data
│   ├── 01_gold_parkrun_info.json  # Generated: Basic parkrun information
│   └── current_scores_baseline.csv # Baseline scores for comparison
├── scripts/                        # All processing scripts
│   └── 01_create_parkrun_info.py  # Extracts basic parkrun info
└── README.md                       # This file
```

## Current Files

### Data Files

#### `data/keywords.json`
- **Version:** 3.2
- **Structure:** ✅ VALIDATED
- **Total keywords:** 202
- **Categories:** 12 (surface_types, terrain_features, obstacles, weather_conditions, course_characteristics, positive_indicators, multi_lap_courses, exclusions, special_surfaces, distance_considerations, fatigue_factors, pace_welcome)
- **Mobility types:** 8 (racing_chair, day_chair, off_road_chair, handbike, frame_runner, walking_frame, crutches, walking_stick)
- **Scoring system:** Starting score 50, range -50 to +50 per keyword

#### `data/raw_parkrun_data.json`
- **Source:** Scraped parkrun data
- **Size:** ~40,073 lines
- **Contains:** Raw course information, descriptions, locations, coordinates
- **Format:** GeoJSON with features array

#### `data/01_gold_parkrun_info.json` ⚙️ GENERATING...
- **Purpose:** Clean, structured basic parkrun information
- **Total events:** 2,747 parkruns worldwide
- **Fields:** uid, short_name, long_name, slug, location, coordinates, country, is_junior, course_page_url, postcode, language
- **APIs used:** OpenAI GPT-4o-mini for postcode and language detection
- **Cost:** ~$0.08 (8 cents)
- **Time:** ~30-40 minutes to generate

#### `current_scores_baseline.csv`
- **Purpose:** Comparison baseline for testing new scoring algorithms
- **Date:** 2025-10-22
- **Source:** backend/gold_parkrun_data.json
- **Total parkruns:** 2,747
- **Columns:** id, name, racing_chair, day_chair, off_road_chair, handbike, frame_runner, walking_frame, crutches, walking_stick

### Scripts

#### `scripts/01_create_parkrun_info.py`
- **Purpose:** Extract basic parkrun information from raw data
- **Input:** `../data/raw_parkrun_data.json`
- **Output:** `../data/01_gold_parkrun_info.json`
- **Features:**
  - Extracts: uid, names, slug, location, coordinates, country, is_junior, course URL
  - Uses OpenAI to detect language from course pages
  - Uses OpenAI to get postcodes from coordinates (cheaper than Google Geocoding)
  - Rate limiting: 0.3s between API calls
  - Progress reporting every 100 parkruns
- **Usage:** `cd scripts && python 01_create_parkrun_info.py`

## Baseline Score Statistics

| Mobility Type | With Scores | Zero Scores | Avg (All) | Avg (Non-Zero) | Max |
|--------------|-------------|-------------|-----------|----------------|-----|
| Racing Chair | 1,170 (42.6%) | 1,577 (57.4%) | 18.7 | 43.9 | 100 |
| Day Chair | 1,459 (53.1%) | 1,288 (46.9%) | 21.2 | 40.0 | 100 |
| Off Road Chair | 2,488 (90.6%) | 259 (9.4%) | 54.2 | 59.8 | 100 |
| Handbike | 1,542 (56.1%) | 1,205 (43.9%) | 20.9 | 37.2 | 100 |
| Frame Runner | 1,749 (63.7%) | 998 (36.3%) | 33.9 | 53.2 | 100 |
| Walking Frame | 1,144 (41.6%) | 1,603 (58.4%) | 19.8 | 47.5 | 100 |
| Crutches | 1,949 (71.0%) | 798 (29.0%) | 35.4 | 49.9 | 100 |
| Walking Stick | 2,158 (78.6%) | 589 (21.4%) | 40.2 | 51.2 | 100 |

## Most Accessible Parkruns (Top 5)

1. Aplins Weir parkrun - RC:100, DC:100, WF:100
2. Bay East Garden parkrun - RC:100, DC:100, WF:100
3. Bedford parkrun - RC:100, DC:100, WF:100
4. Berger Stadion parkrun - RC:100, DC:100, WF:100
5. Berkeley Green parkrun - RC:100, DC:100, WF:100

## Next Steps

### Immediate (Week 1)
- [ ] Validate keyword scoring against baseline
- [ ] Test scoring algorithm with sample parkruns
- [ ] Identify discrepancies between current and recalculated scores

### Short Term (Weeks 2-3)
- [ ] Research Google Maps API requirements
- [ ] Design route analysis scoring algorithm
- [ ] Research Google Elevation API

### Long Term
- [ ] Implement modular scoring pipeline
- [ ] Generalize from parkrun to all events
- [ ] Build admin interface for manual event entry

## Planned Modular Data Architecture

### Data Files (Output)
```
data/
├── 01_gold_parkrun_info.json              ✅ COMPLETE (2,747 parkruns)
├── 02_gold_parkrun_descriptions.json      ✅ COMPLETE (2,747 AI summaries)
├── 03_gold_parkrun_maps.json              ⚙️ IN PROGRESS (500/2747 KML+GPX, 18.2%)
├── 04_gold_parkrun_keywords_score.json    ✅ COMPLETE (2,747 scored)
├── 05_gold_parkrun_map_analysis_score.json ✅ COMPLETE (500/2747, 18.2%)
├── 06_gold_parkrun_elevation_score.json   ⚙️ READY (script built, needs run)
├── 07_gold_parkrun_user_submitted_scores.json # Community scores
└── 08_gold_parkrun_final_score.json       # Combined final scores
```

### Processing Scripts (Planned)
```
scripts/
# Data extraction
├── 01_create_parkrun_info.py          ✅ COMPLETE (2,747 parkruns)
├── 02_create_parkrun_descriptions.py  ✅ COMPLETE (AI summaries)
├── 03_create_parkrun_maps.py          ✅ COMPLETE (Stage 1: URLs)
├── 03-5_update_parkrun_maps.py        ⚙️ IN PROGRESS (KML→GPX converter, 18.2%)

# Score calculation
├── 04_calculate_keyword_scores.py     ✅ COMPLETE (keyword matching algorithm)
├── 05_analyze_maps.py                 ✅ COMPLETE (GPX corner analysis)
├── 06_analyze_elevation.py            ✅ COMPLETE (elevation + gradient analysis)
├── 07_fetch_user_scores.py            # Supabase → user submitted scores
└── 08_calculate_final_scores.py       # Combine all → final weighted scores

# Utility workflows
├── 09_upload_to_supabase.py           # Upload final scores to database
├── update_user_scores_workflow.py     # Run 07 + 08 + 09
├── full_recalculation.py              # Run 04-09 (when keywords change)
└── refresh_all_data.py                # Run 01-09 (complete rebuild)
```

### Score Combination Strategy
Final score = weighted average of:
- Keyword-based score (current method)
- Map analysis score (route width, turns, surface detection)
- Elevation score (gradients, hill detection)
- User-submitted scores (community feedback)

Weights will be configurable and can be adjusted based on confidence levels.

## Working Principles

1. **Slow and methodical** - No pressure to rush, site is working
2. **Modular architecture** - Each scoring component independent
3. **Reusable system** - Not just for parkrun, for ALL running events
4. **Comparison testing** - Always validate against baseline before deploying
5. **Stay in scope** - Work ONLY in `data/advanced_data/` folder

## Notes

- Production site is stable and live at wheelchairracer.com
- All experimental work on `feature/advanced-data-analysis` branch
- Main branch protected - no direct changes
- This is R&D work - free to experiment and iterate
