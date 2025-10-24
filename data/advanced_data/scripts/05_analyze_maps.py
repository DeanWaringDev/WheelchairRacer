"""
05_analyze_maps.py

Analyzes GPX route files to calculate maneuverability scores based on:
- Sharp turns and corner counting
- Path complexity
- Route geometry

Input:
- ../data/parkrun_gpx/*.gpx (GPX route files)
- ../data/03_gold_parkrun_maps.json (to match slugs to UIDs)

Output:
- ../data/05_gold_parkrun_map_analysis_score.json

Schema:
{
    "uid": int,
    "slug": str,
    "has_gpx_data": bool,
    "total_distance_km": float,
    "total_points": int,
    "total_turns_detected": int,
    "sharp_turns_90deg_plus": int,
    "moderate_turns_45_90deg": int,
    "gentle_turns_under_45deg": int,
    "average_turn_angle": float,
    "max_turn_angle": float,
    "has_narrow_path_cluster": bool,
    "longest_straight_meters": float,
    
    "racing_chair_maneuverability": int (0-100),
    "day_chair_maneuverability": int (0-100),
    "off_road_chair_maneuverability": int (0-100),
    "handbike_maneuverability": int (0-100),
    "frame_runner_maneuverability": int (0-100),
    "walking_frame_maneuverability": int (0-100),
    "crutches_maneuverability": int (0-100),
    "walking_stick_maneuverability": int (0-100)
}

Methodology:
1. Parse GPX files to extract track points (lat, lon)
2. Calculate bearing/heading between consecutive points
3. Detect turns by measuring heading changes
4. Categorize turns: sharp (>90°), moderate (45-90°), gentle (<45°)
5. Detect narrow path clusters (3+ sharp turns within 100m)
6. Apply mobility-specific penalties
"""

import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
GPX_DIR = DATA_DIR / 'parkrun_gpx'
MAPS_JSON = DATA_DIR / '03_gold_parkrun_maps.json'
OUTPUT_FILE = DATA_DIR / '05_gold_parkrun_map_analysis_score.json'

# Turn detection thresholds (degrees)
SHARP_TURN_THRESHOLD = 90
MODERATE_TURN_THRESHOLD = 45
GENTLE_TURN_THRESHOLD = 15  # Minimum angle to count as a turn

# Narrow path cluster detection
CLUSTER_TURN_COUNT = 3  # 3+ sharp turns
CLUSTER_DISTANCE_METERS = 100  # Within 100 meters

# Turn penalties per sharp 90°+ turn
SHARP_TURN_PENALTIES = {
    'racing_chair': -15,      # Major penalty - wide turning radius
    'frame_runner': -12,      # Significant penalty - limited maneuverability
    'handbike': -12,          # Similar to frame runner (pending user feedback)
    'walking_frame': 0,       # NO PENALTY - unaffected by angles
    'day_chair': 0,           # NO PENALTY - turns on spot
    'off_road_chair': 0,      # NO PENALTY - turns on spot
    'crutches': 0,            # NO PENALTY - agile
    'walking_stick': 0        # NO PENALTY - agile
}

# Narrow path cluster penalty (3+ sharp turns within 100m)
NARROW_PATH_CLUSTER_PENALTIES = {
    'racing_chair': -25,      # Basically impossible
    'frame_runner': -20,      # Very difficult
    'handbike': -20,          # Very difficult (similar to frame runner)
    'walking_frame': 0,       # NO PENALTY - unaffected
    'day_chair': 0,           # NO PENALTY
    'off_road_chair': 0,      # NO PENALTY
    'crutches': 0,            # NO PENALTY
    'walking_stick': 0        # NO PENALTY
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
    Calculate distance between two GPS coordinates in meters using Haversine formula.
    """
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate bearing (direction) between two GPS coordinates in degrees (0-360).
    """
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    
    x = math.sin(dlon) * math.cos(lat2_rad)
    y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(dlon)
    
    bearing = math.atan2(x, y)
    bearing = math.degrees(bearing)
    bearing = (bearing + 360) % 360  # Normalize to 0-360
    
    return bearing


def angle_difference(bearing1: float, bearing2: float) -> float:
    """
    Calculate the smallest angle difference between two bearings (0-180 degrees).
    """
    diff = abs(bearing2 - bearing1)
    if diff > 180:
        diff = 360 - diff
    return diff


def parse_gpx_file(gpx_path: Path) -> Optional[List[Tuple[float, float]]]:
    """
    Parse GPX file and extract list of (lat, lon) coordinates.
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
        for trkpt in root.findall('.//gpx:trkpt', ns):
            lat = float(trkpt.get('lat'))
            lon = float(trkpt.get('lon'))
            coords.append((lat, lon))
        
        return coords if len(coords) > 2 else None
        
    except Exception as e:
        print(f"  ⚠️  Error parsing {gpx_path.name}: {e}")
        return None


def analyze_route_geometry(coords: List[Tuple[float, float]]) -> Dict:
    """
    Analyze route geometry to detect turns, calculate distances, etc.
    """
    if len(coords) < 3:
        return None
    
    # Calculate bearings between consecutive points
    bearings = []
    distances = []
    
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i + 1]
        
        bearing = calculate_bearing(lat1, lon1, lat2, lon2)
        distance = haversine_distance(lat1, lon1, lat2, lon2)
        
        bearings.append(bearing)
        distances.append(distance)
    
    # Detect turns by comparing consecutive bearings
    turns = []
    turn_locations = []  # Track cumulative distance at each turn
    
    cumulative_distance = 0
    for i in range(len(bearings) - 1):
        cumulative_distance += distances[i]
        
        angle_change = angle_difference(bearings[i], bearings[i + 1])
        
        # Only count as turn if angle change is significant
        if angle_change >= GENTLE_TURN_THRESHOLD:
            turns.append(angle_change)
            turn_locations.append(cumulative_distance)
    
    # Categorize turns
    sharp_turns = [t for t in turns if t >= SHARP_TURN_THRESHOLD]
    moderate_turns = [t for t in turns if MODERATE_TURN_THRESHOLD <= t < SHARP_TURN_THRESHOLD]
    gentle_turns = [t for t in turns if GENTLE_TURN_THRESHOLD <= t < MODERATE_TURN_THRESHOLD]
    
    # Detect narrow path clusters (3+ sharp turns within 100m)
    has_cluster = False
    sharp_turn_indices = [i for i, t in enumerate(turns) if t >= SHARP_TURN_THRESHOLD]
    
    for i in range(len(sharp_turn_indices) - CLUSTER_TURN_COUNT + 1):
        first_idx = sharp_turn_indices[i]
        last_idx = sharp_turn_indices[i + CLUSTER_TURN_COUNT - 1]
        
        distance_between = turn_locations[last_idx] - turn_locations[first_idx]
        
        if distance_between <= CLUSTER_DISTANCE_METERS:
            has_cluster = True
            break
    
    # Calculate longest straight (distance without significant turns)
    longest_straight = 0
    current_straight = 0
    
    for i, turn_angle in enumerate(turns):
        if turn_angle < MODERATE_TURN_THRESHOLD:  # Not a significant turn
            current_straight += distances[i]
        else:
            longest_straight = max(longest_straight, current_straight)
            current_straight = 0
    
    longest_straight = max(longest_straight, current_straight)  # Check final segment
    
    # Total distance
    total_distance_m = sum(distances)
    total_distance_km = total_distance_m / 1000
    
    return {
        'total_distance_km': round(total_distance_km, 2),
        'total_points': len(coords),
        'total_turns_detected': len(turns),
        'sharp_turns_90deg_plus': len(sharp_turns),
        'moderate_turns_45_90deg': len(moderate_turns),
        'gentle_turns_under_45deg': len(gentle_turns),
        'average_turn_angle': round(sum(turns) / len(turns), 1) if turns else 0,
        'max_turn_angle': round(max(turns), 1) if turns else 0,
        'has_narrow_path_cluster': has_cluster,
        'longest_straight_meters': round(longest_straight, 1)
    }


def calculate_maneuverability_scores(geometry: Dict) -> Dict[str, int]:
    """
    Calculate maneuverability scores for each mobility type based on route geometry.
    """
    scores = {}
    
    sharp_turn_count = geometry['sharp_turns_90deg_plus']
    has_cluster = geometry['has_narrow_path_cluster']
    
    for mobility_type in MOBILITY_TYPES:
        base_score = 100
        
        # Apply sharp turn penalties
        sharp_penalty = sharp_turn_count * SHARP_TURN_PENALTIES[mobility_type]
        
        # Apply narrow path cluster penalty
        cluster_penalty = NARROW_PATH_CLUSTER_PENALTIES[mobility_type] if has_cluster else 0
        
        # Calculate final score (clamped to 0-100)
        final_score = base_score + sharp_penalty + cluster_penalty
        final_score = max(0, min(100, final_score))
        
        scores[f'{mobility_type}_maneuverability'] = final_score
    
    return scores


def load_maps_json() -> Dict:
    """Load 03_gold_parkrun_maps.json to match slugs to UIDs"""
    with open(MAPS_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)


def main():
    """Main execution function"""
    print("=" * 60)
    print("05 - ANALYZE MAPS (GPX ROUTE GEOMETRY)")
    print("=" * 60)
    print()
    
    # Load maps JSON for slug→UID mapping
    print("Loading parkrun maps data...")
    maps_data = load_maps_json()
    print(f"✓ Loaded {len(maps_data)} parkrun entries")
    print()
    
    # Get list of GPX files
    gpx_files = list(GPX_DIR.glob('*.gpx'))
    print(f"Found {len(gpx_files)} GPX files to analyze")
    print()
    
    results = []
    processed = 0
    skipped = 0
    
    print("Analyzing route geometry...")
    
    for maps_entry in maps_data:
        uid = maps_entry['uid']
        slug = maps_entry['slug']
        
        gpx_path = GPX_DIR / f"{slug}.gpx"
        
        # Check if GPX file exists
        if not gpx_path.exists():
            # No GPX data yet - create placeholder entry
            result = {
                'uid': uid,
                'slug': slug,
                'has_gpx_data': False,
                'total_distance_km': None,
                'total_points': None,
                'total_turns_detected': None,
                'sharp_turns_90deg_plus': None,
                'moderate_turns_45_90deg': None,
                'gentle_turns_under_45deg': None,
                'average_turn_angle': None,
                'max_turn_angle': None,
                'has_narrow_path_cluster': None,
                'longest_straight_meters': None,
                'racing_chair_maneuverability': None,
                'day_chair_maneuverability': None,
                'off_road_chair_maneuverability': None,
                'handbike_maneuverability': None,
                'frame_runner_maneuverability': None,
                'walking_frame_maneuverability': None,
                'crutches_maneuverability': None,
                'walking_stick_maneuverability': None
            }
            results.append(result)
            skipped += 1
            continue
        
        # Parse GPX file
        coords = parse_gpx_file(gpx_path)
        
        if coords is None or len(coords) < 3:
            # Failed to parse or insufficient data
            result = {
                'uid': uid,
                'slug': slug,
                'has_gpx_data': False,
                'total_distance_km': None,
                'total_points': None,
                'total_turns_detected': None,
                'sharp_turns_90deg_plus': None,
                'moderate_turns_45_90deg': None,
                'gentle_turns_under_45deg': None,
                'average_turn_angle': None,
                'max_turn_angle': None,
                'has_narrow_path_cluster': None,
                'longest_straight_meters': None,
                'racing_chair_maneuverability': None,
                'day_chair_maneuverability': None,
                'off_road_chair_maneuverability': None,
                'handbike_maneuverability': None,
                'frame_runner_maneuverability': None,
                'walking_frame_maneuverability': None,
                'crutches_maneuverability': None,
                'walking_stick_maneuverability': None
            }
            results.append(result)
            skipped += 1
            continue
        
        # Analyze route geometry
        geometry = analyze_route_geometry(coords)
        
        if geometry is None:
            skipped += 1
            continue
        
        # Calculate maneuverability scores
        maneuverability_scores = calculate_maneuverability_scores(geometry)
        
        # Build result
        result = {
            'uid': uid,
            'slug': slug,
            'has_gpx_data': True,
            **geometry,
            **maneuverability_scores
        }
        
        results.append(result)
        processed += 1
        
        # Progress reporting
        if processed % 50 == 0:
            print(f"  Processed {processed} GPX files...")
    
    print(f"✓ Completed analysis")
    print()
    
    # Statistics
    print("=" * 60)
    print("ANALYSIS STATISTICS")
    print("=" * 60)
    print()
    print(f"Total parkruns: {len(maps_data)}")
    print(f"Analyzed with GPX data: {processed}")
    print(f"No GPX data (yet): {skipped}")
    print(f"Coverage: {processed/len(maps_data)*100:.1f}%")
    print()
    
    # Maneuverability score statistics (only for entries with data)
    entries_with_data = [r for r in results if r['has_gpx_data']]
    
    if entries_with_data:
        print("Average Maneuverability Scores (entries with GPX data):")
        for mobility_type in MOBILITY_TYPES:
            score_key = f"{mobility_type}_maneuverability"
            scores = [r[score_key] for r in entries_with_data if r[score_key] is not None]
            if scores:
                avg = sum(scores) / len(scores)
                min_score = min(scores)
                max_score = max(scores)
                print(f"  {mobility_type.replace('_', ' ').title()}: {avg:.1f} (range: {min_score}-{max_score})")
        print()
        
        # Turn statistics
        total_turns = [r['total_turns_detected'] for r in entries_with_data if r['total_turns_detected'] is not None]
        sharp_turns = [r['sharp_turns_90deg_plus'] for r in entries_with_data if r['sharp_turns_90deg_plus'] is not None]
        clusters = sum(1 for r in entries_with_data if r['has_narrow_path_cluster'])
        
        print("Turn Statistics:")
        print(f"  Average total turns per route: {sum(total_turns)/len(total_turns):.1f}")
        print(f"  Average sharp turns (>90°): {sum(sharp_turns)/len(sharp_turns):.1f}")
        print(f"  Routes with narrow path clusters: {clusters} ({clusters/len(entries_with_data)*100:.1f}%)")
        print()
    
    # Save results
    print("Saving results to JSON...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved to {OUTPUT_FILE}")
    print()
    print("=" * 60)
    print("MAP ANALYSIS COMPLETE!")
    print("=" * 60)
    print()
    print("Note: Entries without GPX data have null values.")
    print("Re-run this script after downloading more KML/GPX files.")


if __name__ == '__main__':
    main()
