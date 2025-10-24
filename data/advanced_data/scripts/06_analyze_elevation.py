"""
06_analyze_elevation.py

Analyzes GPX route files to calculate elevation-based accessibility scores using:
- Total elevation gain/loss
- Maximum gradient percentage
- Steep section detection (>5% grade)
- Hill climb difficulty

Uses Open-Elevation API to fetch real elevation data for GPS coordinates.
Free tier: 1,000 requests/month
API: https://api.open-elevation.com/api/v1/lookup

Input:
- ../data/parkrun_gpx/*.gpx (GPX route files)
- ../data/03_gold_parkrun_maps.json (to match slugs to UIDs)

Output:
- ../data/06_gold_parkrun_elevation_score.json

Schema:
{
    "uid": int,
    "slug": str,
    "has_elevation_data": bool,
    
    # Raw elevation metrics
    "total_distance_km": float,
    "total_points": int,
    "min_elevation_m": float,
    "max_elevation_m": float,
    "total_elevation_gain_m": float,
    "total_elevation_loss_m": float,
    "average_gradient_percent": float,
    "max_gradient_percent": float,
    "max_250m_gain_m": float,  # Max elevation gain in any 250m segment
    "max_250m_gradient_percent": float,  # Gradient of the segment with max gain
    "steep_sections_count": int,  # Sections >5% grade
    "total_steep_distance_m": float,  # Total distance of steep sections
    
    # Elevation accessibility scores (0-100)
    "racing_chair_elevation": int,
    "day_chair_elevation": int,
    "off_road_chair_elevation": int,
    "handbike_elevation": int,
    "frame_runner_elevation": int,
    "walking_frame_elevation": int,
    "crutches_elevation": int,
    "walking_stick_elevation": int
}

Methodology:
1. Parse GPX files to extract (lat, lon) coordinates
2. Batch fetch elevation data from Open-Elevation API
3. Calculate gradients between consecutive points
4. Detect steep sections (>5% grade)
5. Apply mobility-specific penalties based on elevation gain and gradients

Gradient Calculation:
- gradient% = (elevation_change / horizontal_distance) × 100
- Steep: >5% sustained grade
- Moderate: 3-5% grade
- Gentle: <3% grade
"""

import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import time
import requests

# Configuration
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
GPX_DIR = DATA_DIR / 'parkrun_gpx'
MAPS_FILE = DATA_DIR / '03_gold_parkrun_maps.json'
OUTPUT_FILE = DATA_DIR / '06_gold_parkrun_elevation_score.json'

# Open-Elevation API
ELEVATION_API = "https://api.open-elevation.com/api/v1/lookup"
MAX_LOCATIONS_PER_REQUEST = 100  # API limit
REQUEST_DELAY = 1.0  # Seconds between requests (be nice to free API)

# Gradient thresholds (percentage)
STEEP_GRADIENT_THRESHOLD = 5.0  # >5% is steep
MODERATE_GRADIENT_THRESHOLD = 3.0  # 3-5% is moderate
GENTLE_GRADIENT_THRESHOLD = 1.0  # <1% is flat
MAX_REALISTIC_GRADIENT = 30.0  # Ignore gradients >30% (likely GPS/elevation errors)
MIN_SEGMENT_DISTANCE = 5.0  # Ignore segments shorter than 5 meters (noise)

# Gradient thresholds for 250m segment penalties (percentage)
# Only apply LOCALIZED_GAIN_PENALTIES if 250m segment gradient exceeds these thresholds
# This distinguishes gentle gradual climbs (OK) from steep concentrated climbs (BAD)
GRADIENT_THRESHOLD_FOR_250M_PENALTY = {
    'racing_chair': 5.0,       # Struggles with >5% sustained gradient
    'day_chair': 7.0,          # Can handle gentle slopes up to 7%
    'off_road_chair': 9.0,     # Better on inclines, can handle 9%
    'handbike': 7.0,           # Upper body power helps, threshold 7%
    'frame_runner': 8.0,       # Can manage moderate slopes up to 8%
    'walking_frame': 10.0,     # Can handle gentle slopes up to 10%
    'crutches': 9.0,           # Can manage moderate gradients to 9%
    'walking_stick': 10.0      # Can handle gentle slopes up to 10%
}

# Elevation gain penalties per meter of LOCALIZED gain (250m segments)
# Starting score: 100
# Penalties reduce score toward 0
# ONLY APPLIED if segment gradient exceeds GRADIENT_THRESHOLD_FOR_250M_PENALTY
LOCALIZED_GAIN_PENALTIES = {
    'racing_chair': -4.0,      # Very sensitive to steep hills
    'day_chair': -2.5,         # Difficult with hills
    'off_road_chair': -1.5,    # Better on inclines than day chair
    'handbike': -2.0,          # Upper body strength helps but still hard
    'frame_runner': -3.0,      # Difficult with hills
    'walking_frame': -5.0,     # Most affected by elevation (but only if steep!)
    'crutches': -4.5,          # Very difficult on hills
    'walking_stick': -3.5      # Significant difficulty
}

# Steep gradient penalties per 100m of steep section
# These are additional penalties on top of elevation gain
STEEP_SECTION_PENALTIES = {
    'racing_chair': -5,        # Major issue
    'day_chair': -3,           # Challenging
    'off_road_chair': -2,      # Less affected
    'handbike': -4,            # Challenging climbs
    'frame_runner': -4,        # Very difficult
    'walking_frame': -8,       # Extremely difficult
    'crutches': -7,            # Extremely difficult
    'walking_stick': -6        # Very difficult
}

# Maximum gradient penalties (scaled by severity)
# These are BIG penalties because one steep hill can make route impossible
MAX_GRADIENT_PENALTY_SCALE = {
    # Penalties at different gradient thresholds
    '5-10%': {
        'racing_chair': -10,
        'day_chair': -8,
        'off_road_chair': -5,
        'handbike': -8,
        'frame_runner': -10,
        'walking_frame': -15,
        'crutches': -12,
        'walking_stick': -10
    },
    '10-15%': {
        'racing_chair': -25,
        'day_chair': -20,
        'off_road_chair': -12,
        'handbike': -20,
        'frame_runner': -25,
        'walking_frame': -35,
        'crutches': -30,
        'walking_stick': -25
    },
    '15%+': {
        'racing_chair': -50,       # Basically impossible
        'day_chair': -40,          # Extremely difficult
        'off_road_chair': -25,     # Very challenging
        'handbike': -40,           # Extremely difficult
        'frame_runner': -50,       # Basically impossible
        'walking_frame': -60,      # Impossible
        'crutches': -55,           # Impossible
        'walking_stick': -50       # Basically impossible
    }
}

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


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate horizontal distance between two GPS coordinates in meters using Haversine formula.
    """
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def parse_gpx_file(gpx_path: Path) -> Optional[List[Tuple[float, float]]]:
    """
    Parse GPX file and extract list of (lat, lon) coordinates.
    Filters out duplicate/near-duplicate points.
    Returns None if file doesn't exist or parsing fails.
    """
    if not gpx_path.exists():
        return None
    
    try:
        tree = ET.parse(gpx_path)
        root = tree.getroot()
        
        # Handle GPX namespace
        ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
        
        coords = []
        last_coord = None
        
        for trkpt in root.findall('.//gpx:trkpt', ns):
            lat = float(trkpt.get('lat'))
            lon = float(trkpt.get('lon'))
            
            # Skip duplicate or near-duplicate points (within 1 meter)
            if last_coord is not None:
                dist = haversine_distance(last_coord[0], last_coord[1], lat, lon)
                if dist < 1.0:  # Less than 1 meter away
                    continue
            
            coords.append((lat, lon))
            last_coord = (lat, lon)
        
        return coords if len(coords) > 2 else None
        
    except Exception as e:
        print(f"  ⚠️  Error parsing {gpx_path.name}: {e}")
        return None


def fetch_elevations_batch(coords: List[Tuple[float, float]]) -> Optional[List[float]]:
    """
    Fetch elevation data for a batch of coordinates from Open-Elevation API.
    Returns list of elevations in meters, or None if request fails.
    
    API format: locations=lat1,lon1|lat2,lon2|lat3,lon3
    """
    if not coords or len(coords) == 0:
        return None
    
    # Format coordinates for API: "lat,lon|lat,lon|lat,lon"
    locations = "|".join([f"{lat},{lon}" for lat, lon in coords])
    
    try:
        response = requests.get(
            ELEVATION_API,
            params={'locations': locations},
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        elevations = [result['elevation'] for result in data['results']]
        
        return elevations
        
    except Exception as e:
        print(f"  ⚠️  API error: {e}")
        return None


def fetch_all_elevations(coords: List[Tuple[float, float]]) -> Optional[List[float]]:
    """
    Fetch elevations for all coordinates, batching requests to stay within API limits.
    """
    if not coords:
        return None
    
    all_elevations = []
    
    # Process in batches
    for i in range(0, len(coords), MAX_LOCATIONS_PER_REQUEST):
        batch = coords[i:i + MAX_LOCATIONS_PER_REQUEST]
        
        elevations = fetch_elevations_batch(batch)
        
        if elevations is None:
            return None
        
        all_elevations.extend(elevations)
        
        # Rate limiting - be nice to free API
        if i + MAX_LOCATIONS_PER_REQUEST < len(coords):
            time.sleep(REQUEST_DELAY)
    
    return all_elevations


def calculate_gradient(distance_m: float, elevation_change_m: float) -> float:
    """
    Calculate gradient percentage.
    gradient% = (elevation_change / horizontal_distance) × 100
    """
    if distance_m < 0.1:  # Avoid division by very small numbers
        return 0.0
    
    gradient = (elevation_change_m / distance_m) * 100
    return gradient


def analyze_elevation_profile(
    coords: List[Tuple[float, float]], 
    elevations: List[float]
) -> Dict:
    """
    Analyze elevation profile to calculate metrics like total gain, max gradient, steep sections.
    Now includes localized elevation gain analysis (per 250m segments).
    """
    if len(coords) != len(elevations) or len(coords) < 2:
        return None
    
    total_distance = 0.0
    total_gain = 0.0
    total_loss = 0.0
    min_elevation = min(elevations)
    max_elevation = max(elevations)
    
    gradients = []
    steep_sections = []  # List of (start_idx, end_idx, distance_m, avg_gradient)
    current_steep_start = None
    current_steep_distance = 0.0
    
    # Track elevation gain in 250m segments for localized steepness
    segment_length = 250.0  # meters
    segment_distances = []  # List of distances for each point
    segment_gains = []  # List of (gain_m, distance_m) tuples for each 250m segment
    current_segment_distance = 0.0
    current_segment_gain = 0.0
    current_segment_actual_distance = 0.0  # Actual distance covered (may be <250m)
    segment_start_idx = 0
    
    # Calculate gradients between consecutive points
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i + 1]
        ele1 = elevations[i]
        ele2 = elevations[i + 1]
        
        distance = haversine_distance(lat1, lon1, lat2, lon2)
        elevation_change = ele2 - ele1
        
        # Skip very short segments (likely GPS noise)
        if distance < MIN_SEGMENT_DISTANCE:
            continue
        
        gradient = calculate_gradient(distance, elevation_change)
        
        # Filter out unrealistic gradients (likely elevation API errors)
        if abs(gradient) > MAX_REALISTIC_GRADIENT:
            # Still count distance but ignore gradient
            total_distance += distance
            continue
        
        total_distance += distance
        gradients.append(abs(gradient))
        
        # Track elevation gain/loss
        if elevation_change > 0:
            total_gain += elevation_change
            current_segment_gain += elevation_change
        else:
            total_loss += abs(elevation_change)
        
        # Track 250m segments for localized elevation gain
        current_segment_distance += distance
        current_segment_actual_distance += distance
        segment_distances.append(total_distance)
        
        if current_segment_distance >= segment_length:
            # Store gain and actual distance covered in this segment
            segment_gains.append((current_segment_gain, current_segment_actual_distance))
            current_segment_distance = 0.0
            current_segment_gain = 0.0
            current_segment_actual_distance = 0.0
        
        # Detect steep sections (>5% grade)
        if abs(gradient) > STEEP_GRADIENT_THRESHOLD:
            if current_steep_start is None:
                current_steep_start = i
                current_steep_distance = distance
            else:
                current_steep_distance += distance
        else:
            # End of steep section
            if current_steep_start is not None and current_steep_distance > 10:  # At least 10m
                steep_sections.append({
                    'start_idx': current_steep_start,
                    'end_idx': i,
                    'distance_m': current_steep_distance
                })
            current_steep_start = None
            current_steep_distance = 0.0
    
    # Handle steep section that goes to end of route
    if current_steep_start is not None and current_steep_distance > 10:
        steep_sections.append({
            'start_idx': current_steep_start,
            'end_idx': len(coords) - 1,
            'distance_m': current_steep_distance
        })
    
    # Handle last partial segment
    if current_segment_distance > 0 and current_segment_gain > 0:
        segment_gains.append((current_segment_gain, current_segment_actual_distance))
    
    total_steep_distance = sum(section['distance_m'] for section in steep_sections)
    avg_gradient = sum(gradients) / len(gradients) if gradients else 0.0
    max_gradient = max(gradients) if gradients else 0.0
    
    # Calculate max localized elevation gain in any 250m segment
    # Also calculate the gradient of that segment
    max_250m_gain = 0.0
    max_250m_gradient = 0.0
    
    if segment_gains:
        # Find segment with max gain
        max_segment = max(segment_gains, key=lambda x: x[0])
        max_250m_gain = max_segment[0]
        segment_distance = max_segment[1]
        
        # Calculate gradient of this segment (gain / distance × 100)
        if segment_distance > 0:
            max_250m_gradient = (max_250m_gain / segment_distance) * 100
    
    return {
        'total_distance_km': round(total_distance / 1000, 3),
        'total_points': len(coords),
        'min_elevation_m': round(min_elevation, 1),
        'max_elevation_m': round(max_elevation, 1),
        'total_elevation_gain_m': round(total_gain, 1),
        'total_elevation_loss_m': round(total_loss, 1),
        'average_gradient_percent': round(avg_gradient, 2),
        'max_gradient_percent': round(max_gradient, 2),
        'max_250m_gain_m': round(max_250m_gain, 1),
        'max_250m_gradient_percent': round(max_250m_gradient, 2),  # NEW: gradient of worst segment
        'steep_sections_count': len(steep_sections),
        'total_steep_distance_m': round(total_steep_distance, 1)
    }


def calculate_elevation_scores(metrics: Dict) -> Dict[str, int]:
    """
    Calculate mobility-specific elevation accessibility scores (0-100).
    
    UPDATED APPROACH - Focus on:
    1. Max gradient (single steep hill matters most) - HEAVILY WEIGHTED
    2. Max localized elevation gain in 250m segment - ONLY if gradient is steep enough
       (distinguishes gentle gradual climbs from steep concentrated climbs)
    3. Steep sections (sustained difficult terrain)
    """
    scores = {}
    
    for mobility_type in MOBILITY_TYPES:
        score = 100  # Start at perfect
        
        # Penalty 1: MAX GRADIENT (scaled by how much of course is steep)
        # If only a brief section is steep, penalty should be proportional
        # Example: 10% gradient over 15% of course = apply 15% of penalty
        max_grad = metrics['max_gradient_percent']
        total_distance_m = metrics['total_distance_km'] * 1000
        steep_distance_m = metrics['total_steep_distance_m']
        
        # Calculate what proportion of route is steep (>5% grade)
        steep_proportion = steep_distance_m / total_distance_m if total_distance_m > 0 else 0
        
        # Base penalty for gradient
        base_penalty = 0
        if max_grad >= 15.0:
            base_penalty = MAX_GRADIENT_PENALTY_SCALE['15%+'][mobility_type]
        elif max_grad >= 10.0:
            base_penalty = MAX_GRADIENT_PENALTY_SCALE['10-15%'][mobility_type]
        elif max_grad >= 5.0:
            base_penalty = MAX_GRADIENT_PENALTY_SCALE['5-10%'][mobility_type]
        
        # Scale penalty by steep proportion, with minimum of 20% penalty if ANY steep section exists
        # (even brief steep sections matter, but not as much as sustained steep climbs)
        if base_penalty < 0 and steep_proportion > 0:
            scaled_penalty = base_penalty * max(steep_proportion, 0.2)
            score += scaled_penalty
        
        # Penalty 2: Localized elevation gain (worst 250m segment)
        # ONLY APPLY if the segment gradient exceeds the mobility type's threshold
        # This prevents penalizing gentle gradual climbs (e.g., 15m over 250m at 6% = gentle)
        # while still penalizing steep concentrated climbs (e.g., 15m over 250m at 15% = steep)
        max_250m_gradient = metrics.get('max_250m_gradient_percent', 0)
        gradient_threshold = GRADIENT_THRESHOLD_FOR_250M_PENALTY[mobility_type]
        
        if max_250m_gradient > gradient_threshold:
            # Segment is steep enough to matter - apply penalty
            localized_gain_penalty = metrics['max_250m_gain_m'] * LOCALIZED_GAIN_PENALTIES[mobility_type]
            score += localized_gain_penalty
        # else: Segment is gentle/gradual - no penalty needed
        
        # Penalty 3: Steep sections (sustained difficulty)
        steep_distance_100m = metrics['total_steep_distance_m'] / 100
        steep_penalty = steep_distance_100m * STEEP_SECTION_PENALTIES[mobility_type]
        score += steep_penalty
        
        # Clamp to 0-100 range
        score = max(0, min(100, int(round(score))))
        scores[f"{mobility_type}_elevation"] = score
    
    return scores


def process_all_parkruns():
    """
    Process all parkrun GPX files and generate elevation scores.
    """
    print("=" * 60)
    print("06_analyze_elevation.py - Elevation Profile Analysis")
    print("=" * 60)
    print()
    
    # Load parkrun maps data to get slug→UID mapping
    print("Loading parkrun maps data...")
    with open(MAPS_FILE, 'r', encoding='utf-8') as f:
        maps_data = json.load(f)
    
    slug_to_uid = {item['slug']: item['uid'] for item in maps_data}
    print(f"  ✓ Loaded {len(slug_to_uid)} parkrun mappings")
    print()
    
    # Process all GPX files
    print("Processing GPX files for elevation analysis...")
    print("(This will take time due to API rate limiting)")
    print()
    
    results = []
    processed_count = 0
    skipped_count = 0
    api_count = 0
    
    # Get all GPX files
    gpx_files = sorted(GPX_DIR.glob('*.gpx'))
    
    # TEST MODE: Process only Dean's local parkruns for validation
    # TODO: Remove this filter for full run
    test_parkruns = ['kettering', 'marketharborough', 'northampton', 'corby', 'rutlandwater']
    gpx_files = [f for f in gpx_files if f.stem in test_parkruns]
    
    total_files = len(gpx_files)
    
    for idx, gpx_file in enumerate(gpx_files, 1):
        slug = gpx_file.stem
        uid = slug_to_uid.get(slug)
        
        if uid is None:
            print(f"  ⚠️  [{idx}/{total_files}] {slug}: No UID mapping found")
            skipped_count += 1
            continue
        
        # Parse GPX coordinates
        coords = parse_gpx_file(gpx_file)
        
        if coords is None:
            # No GPX data - create placeholder entry
            results.append({
                'uid': uid,
                'slug': slug,
                'has_elevation_data': False,
                'total_distance_km': None,
                'total_points': None,
                'min_elevation_m': None,
                'max_elevation_m': None,
                'total_elevation_gain_m': None,
                'total_elevation_loss_m': None,
                'average_gradient_percent': None,
                'max_gradient_percent': None,
                'max_250m_gain_m': None,
                'max_250m_gradient_percent': None,
                'steep_sections_count': None,
                'total_steep_distance_m': None,
                'racing_chair_elevation': None,
                'day_chair_elevation': None,
                'off_road_chair_elevation': None,
                'handbike_elevation': None,
                'frame_runner_elevation': None,
                'walking_frame_elevation': None,
                'crutches_elevation': None,
                'walking_stick_elevation': None
            })
            skipped_count += 1
            continue
        
        # Fetch elevation data from API
        print(f"  [{idx}/{total_files}] {slug}: Fetching elevation for {len(coords)} points...")
        elevations = fetch_all_elevations(coords)
        
        if elevations is None:
            print(f"    ⚠️  API request failed, skipping")
            # Create placeholder
            results.append({
                'uid': uid,
                'slug': slug,
                'has_elevation_data': False,
                'total_distance_km': None,
                'total_points': None,
                'min_elevation_m': None,
                'max_elevation_m': None,
                'total_elevation_gain_m': None,
                'total_elevation_loss_m': None,
                'average_gradient_percent': None,
                'max_gradient_percent': None,
                'max_250m_gain_m': None,
                'max_250m_gradient_percent': None,
                'steep_sections_count': None,
                'total_steep_distance_m': None,
                'racing_chair_elevation': None,
                'day_chair_elevation': None,
                'off_road_chair_elevation': None,
                'handbike_elevation': None,
                'frame_runner_elevation': None,
                'walking_frame_elevation': None,
                'crutches_elevation': None,
                'walking_stick_elevation': None
            })
            skipped_count += 1
            continue
        
        api_count += 1
        
        # Analyze elevation profile
        metrics = analyze_elevation_profile(coords, elevations)
        
        if metrics is None:
            print(f"    ⚠️  Analysis failed")
            skipped_count += 1
            continue
        
        # Calculate mobility scores
        scores = calculate_elevation_scores(metrics)
        
        # Create result entry
        result = {
            'uid': uid,
            'slug': slug,
            'has_elevation_data': True,
            **metrics,
            **scores
        }
        
        results.append(result)
        processed_count += 1
        
        print(f"    ✓ Gain: {metrics['total_elevation_gain_m']}m, "
              f"Max grade: {metrics['max_gradient_percent']}%, "
              f"Steep sections: {metrics['steep_sections_count']}")
        print(f"    → Racing: {scores['racing_chair_elevation']}, "
              f"Walking frame: {scores['walking_frame_elevation']}")
    
    # Add placeholder entries for parkruns without GPX files
    print()
    print("Adding placeholders for parkruns without GPX data...")
    
    processed_slugs = {item['slug'] for item in results}
    
    for slug, uid in slug_to_uid.items():
        if slug not in processed_slugs:
            results.append({
                'uid': uid,
                'slug': slug,
                'has_elevation_data': False,
                'total_distance_km': None,
                'total_points': None,
                'min_elevation_m': None,
                'max_elevation_m': None,
                'total_elevation_gain_m': None,
                'total_elevation_loss_m': None,
                'average_gradient_percent': None,
                'max_gradient_percent': None,
                'max_250m_gain_m': None,
                'max_250m_gradient_percent': None,
                'steep_sections_count': None,
                'total_steep_distance_m': None,
                'racing_chair_elevation': None,
                'day_chair_elevation': None,
                'off_road_chair_elevation': None,
                'handbike_elevation': None,
                'frame_runner_elevation': None,
                'walking_frame_elevation': None,
                'crutches_elevation': None,
                'walking_stick_elevation': None
            })
    
    # Sort by UID
    results.sort(key=lambda x: x['uid'])
    
    # Save results
    print()
    print("Saving results...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"  ✓ Saved to {OUTPUT_FILE.name}")
    print()
    
    # Statistics
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total parkruns: {len(results)}")
    print(f"Analyzed with elevation data: {processed_count}")
    print(f"Skipped (no GPX/API failure): {skipped_count}")
    print(f"No GPX data (yet): {len(results) - processed_count - skipped_count}")
    print(f"API requests made: {api_count}")
    print(f"Coverage: {processed_count / len(results) * 100:.1f}%")
    print()
    
    # Calculate average scores for analyzed parkruns
    if processed_count > 0:
        print("Average Elevation Scores (analyzed parkruns only):")
        for mobility_type in MOBILITY_TYPES:
            key = f"{mobility_type}_elevation"
            scores = [r[key] for r in results if r['has_elevation_data'] and r[key] is not None]
            if scores:
                avg = sum(scores) / len(scores)
                min_score = min(scores)
                max_score = max(scores)
                print(f"  {mobility_type.replace('_', ' ').title()}: "
                      f"{avg:.1f} (range {min_score}-{max_score})")
        
        print()
        print("Elevation Statistics:")
        
        gains = [r['total_elevation_gain_m'] for r in results if r['has_elevation_data']]
        if gains:
            print(f"  Average elevation gain: {sum(gains) / len(gains):.1f}m")
            print(f"  Max elevation gain: {max(gains):.1f}m")
        
        gradients = [r['max_gradient_percent'] for r in results if r['has_elevation_data']]
        if gradients:
            print(f"  Average max gradient: {sum(gradients) / len(gradients):.1f}%")
            print(f"  Steepest gradient: {max(gradients):.1f}%")
        
        steep_counts = [r['steep_sections_count'] for r in results if r['has_elevation_data']]
        if steep_counts:
            print(f"  Average steep sections: {sum(steep_counts) / len(steep_counts):.1f}")
            routes_with_steep = sum(1 for s in steep_counts if s > 0)
            print(f"  Routes with steep sections: {routes_with_steep} ({routes_with_steep / len(steep_counts) * 100:.1f}%)")
    
    print()
    print("✓ Elevation analysis complete!")


if __name__ == '__main__':
    process_all_parkruns()
