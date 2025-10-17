# Accessibility Keywords System

## Overview

This document explains the accessibility keywords system used to analyze parkrun course suitability for wheelchair users. The keywords are organized by categories and include impact ratings for different wheelchair types.

## Wheelchair Types

### 1. Racing Chair
- **Characteristics**: Narrow wheels, low profile, aerodynamic design
- **Best Surface**: Smooth tarmac, asphalt, concrete
- **Challenges**: Grass, gravel, roots, mud, hills
- **Typical Use**: Fast 5K times, competitive running

### 2. Day Chair
- **Characteristics**: Standard wheelchair for daily use
- **Best Surface**: Smooth to moderately rough surfaces
- **Challenges**: Loose gravel, steep hills, steps, mud
- **Typical Use**: General mobility, social parkruns

### 3. Off-Road/Sports Chair
- **Characteristics**: Wider tires, better suspension, rugged build
- **Best Surface**: Can handle most terrain including trails
- **Challenges**: Steps, very steep hills, deep mud
- **Typical Use**: Outdoor activities, rough terrain parkruns

### 4. Handbike
- **Characteristics**: Three-wheeled hand-powered cycle
- **Best Surface**: Smooth surfaces, wide paths
- **Challenges**: Narrow paths, tight turns, steps
- **Typical Use**: Long-distance, speed, cycling-style events

## Keyword Categories

### Surface Types

#### Smooth Surfaces (★★★★★ for all)
- **Keywords**: tarmac, asphalt, paved, concrete, smooth path
- **Best for**: Racing chairs, speed, PB attempts
- **Notes**: Ideal conditions for all wheelchair types

#### Packed Surfaces (★★★★ most types)
- **Keywords**: hard packed, hoggin, compacted gravel, crushed stone
- **Best for**: Off-road chairs, day chairs
- **Notes**: Good compromise between smooth and natural terrain

#### Loose Surfaces (★ to ★★★)
- **Keywords**: gravel, loose gravel, shingle, loose stone
- **Racing chairs**: ★ (Unsuitable)
- **Day chairs**: ★★ (Difficult)
- **Off-road chairs**: ★★★ (Moderate)
- **Notes**: Varies greatly by how loose the surface is

#### Grass Surfaces (★ to ★★★★)
- **Keywords**: grass, lawn, meadow, field, turf
- **Condition-dependent**: Dry grass much easier than wet
- **Racing chairs**: ★ (Very difficult, especially when wet)
- **Day chairs**: ★★★ (Manageable when dry)
- **Off-road chairs**: ★★★★ (Good)

#### Trail Surfaces (★ to ★★★★)
- **Keywords**: woodland track, dirt path, earth path, natural surface
- **Highly variable**: Depends on maintenance and weather
- **Best for**: Off-road chairs
- **Worst for**: Racing chairs

### Terrain Features

#### Hills & Elevation
- **Keywords**: hill, steep, incline, gradient, undulating, slope
- **Impact**: Negative for all wheelchair types
- **Severity**: 
  - "Slight incline" = Moderate difficulty
  - "Steep hill" = Major difficulty
  - "Undulating" = Multiple moderate challenges

#### Flat Terrain
- **Keywords**: flat, level, even, pancake flat
- **Impact**: Positive for all wheelchair types
- **Benefit**: Allows for consistent pace and speed

### Obstacles

#### Physical Barriers (★ Major Issue)
- **Keywords**: steps, stairs, gates, kissing gate, stile, turnstile
- **Impact**: May make course IMPOSSIBLE without assistance
- **Action**: These should be flagged as critical barriers

#### Surface Hazards
- **Keywords**: roots, tree roots, rocks, uneven, rough, potholes
- **Racing chairs**: Major problem (low ground clearance)
- **Day chairs**: Moderate problem
- **Off-road chairs**: Minor problem (designed for this)

### Weather Conditions

#### Wet Conditions
- **Keywords**: mud, muddy, puddles, wet, waterlogged, slippery
- **Impact**: Dramatically reduces accessibility
- **Racing chairs**: Course may become impossible
- **Note**: "May accumulate mud after rain" = conditional accessibility

#### Seasonal Factors
- **Keywords**: leaves, autumn leaves, snow, ice
- **Impact**: Temporary but significant
- **Note**: Affects course differently at different times of year

### Positive Indicators

#### Accessibility Features
- **Keywords**: wheelchair accessible, accessible parking, ramped access
- **Impact**: Strong positive signal
- **Note**: Explicit mentions suggest course designers considered accessibility

#### Good Conditions
- **Keywords**: fast course, smooth, PB course, well-maintained
- **Impact**: Suggests good surface quality
- **Note**: Descriptions mentioning speed usually indicate smooth surfaces

## Scoring System

### Suitability Scale (1-5)
- **5 - Excellent**: Ideal conditions, highly recommended
- **4 - Good**: Suitable with good experience expected
- **3 - Moderate**: Doable but challenging, may be slow
- **2 - Difficult**: Very challenging, not recommended for beginners
- **1 - Unsuitable**: Not recommended, may be impossible

### Impact Modifiers
- **Positive (+)**: Improves suitability score
- **Negative (-)**: Reduces suitability score
- **Magnitude**: 
  - 0 = Neutral
  - ±1 = Minor impact
  - ±2 = Moderate impact
  - ±3 = Major impact
  - ±5 = Critical (makes/breaks accessibility)

## Usage in Analysis

### Step 1: Extract Keywords from Description
Search the course description for all keywords from the JSON file.

### Step 2: Calculate Base Suitability Score
- Start with base score for primary surface type
- Example: "tarmac" = 5 for racing chairs

### Step 3: Apply Impact Modifiers
- Add/subtract points based on terrain features
- Example: "undulating" = -2 for racing chairs
- Final score: 5 - 2 = 3 (Moderate)

### Step 4: Check for Critical Barriers
- Steps, gates, explicit barriers = may override score
- Example: Great surface but has steps = Unsuitable

### Step 5: Consider Conditional Factors
- Weather: "May be muddy after rain"
- Seasonal: "Leaves in autumn"
- Note these as conditions affecting accessibility

## Example Analysis

### Example 1: Bushy parkrun
**Description excerpt**: "A fast, flat course... variety of surfaces, including grass and paths. Some sections may accumulate mud, leaves and puddles after rain."

**Keywords found**:
- "fast" (positive indicator) = +2
- "flat" (terrain) = +2
- "grass" (surface) = base score varies
- "paths" (likely good surface) = +1
- "mud, leaves, puddles after rain" (wet conditions) = -2 (conditional)

**Analysis**:
- Racing chair: 3/5 (Moderate - grass sections problematic, conditional on weather)
- Day chair: 4/5 (Good - manageable except in wet conditions)
- Off-road chair: 5/5 (Excellent - can handle all surfaces)

### Example 2: Hypothetical "Steep Hill Trail parkrun"
**Description**: "Undulating woodland track with exposed tree roots, steep ascent to finish. Surface is loose gravel. Not recommended for wheelchairs."

**Keywords found**:
- "undulating" (terrain) = -2
- "woodland track" (trail surface) = base 1-4 depending on chair
- "exposed tree roots" (hazard) = -2
- "steep" (terrain) = -2
- "loose gravel" (surface) = base 1-3 depending on chair
- "not recommended for wheelchairs" (explicit barrier) = -5

**Analysis**:
- Racing chair: 1/5 (Unsuitable - multiple major barriers)
- Day chair: 1/5 (Unsuitable - too many challenges)
- Off-road chair: 2/5 (Difficult - possible but very challenging)

## Implementation Notes

### For Database Storage
```sql
CREATE TABLE parkrun_accessibility (
    event_id INT,
    wheelchair_type VARCHAR(20),
    suitability_score INT, -- 1-5
    keywords_found JSON,
    positive_factors TEXT[],
    negative_factors TEXT[],
    critical_barriers TEXT[],
    conditional_notes TEXT,
    weather_dependent BOOLEAN
);
```

### For Analysis Script
```python
def calculate_accessibility_score(description, wheelchair_type):
    score = 3  # Start with neutral base
    keywords_found = []
    
    # Search for keywords in description
    for category, data in keywords.items():
        for keyword in data['keywords']:
            if keyword.lower() in description.lower():
                keywords_found.append(keyword)
                score += data['impact'][wheelchair_type]
    
    # Clamp score to 1-5 range
    score = max(1, min(5, score))
    
    return score, keywords_found
```

## Future Enhancements

1. **Context-Aware Scoring**: Consider keyword combinations
   - "grass" + "well maintained" = better than just "grass"
   
2. **Regional Variations**: British "tarmac" vs American "asphalt"

3. **Distance from Facilities**: Parking, toilets proximity

4. **Community Reports**: User-submitted accessibility ratings

5. **Photo Analysis**: ML analysis of course photos

6. **Weather Integration**: Real-time weather impact on scores

## Contributing

To add new keywords:
1. Identify the keyword category
2. Determine impact scores for each wheelchair type
3. Add notes explaining the impact
4. Update this documentation
5. Test against real parkrun descriptions

## References

- Parkrun course descriptions (2,747 events)
- Wheelchair user feedback
- Accessibility guidelines
- Surface engineering standards
