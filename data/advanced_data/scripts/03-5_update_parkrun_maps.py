"""
Script: 03-5_update_parkrun_maps.py
Purpose: Convert KML files to GPX and update the maps JSON
Stage: 3 of 3 (KML→GPX conversion)

This script:
1. Loads existing 03_gold_parkrun_maps.json
2. For each parkrun, checks if data/parkrun_kml/{slug}.kml exists
3. Converts KML → GPX using gpxpy library
4. Saves GPX as data/parkrun_gpx/{slug}.gpx
5. Updates JSON with file paths and flags

Prerequisites:
- pip install gpxpy

Usage:
- python 03-5_update_parkrun_maps.py
"""

import json
from pathlib import Path
import xml.etree.ElementTree as ET

def load_maps_data():
    """Load existing maps JSON"""
    maps_file = Path(__file__).parent.parent / 'data' / '03_gold_parkrun_maps.json'
    with open(maps_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_maps_data(data):
    """Save updated maps JSON"""
    maps_file = Path(__file__).parent.parent / 'data' / '03_gold_parkrun_maps.json'
    with open(maps_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def kml_to_gpx(kml_file, gpx_file):
    """
    Convert KML file to GPX format
    
    Args:
        kml_file: Path to input KML file
        gpx_file: Path to output GPX file
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Parse KML file
        tree = ET.parse(kml_file)
        root = tree.getroot()
        
        # KML namespace
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Find all coordinates in the KML
        coordinates_elements = root.findall('.//kml:coordinates', ns)
        
        if not coordinates_elements:
            print(f"      No coordinates found in KML")
            return False
        
        # Extract coordinates (KML format: lon,lat,alt)
        all_coords = []
        for coords_elem in coordinates_elements:
            coords_text = coords_elem.text.strip()
            for coord_str in coords_text.split():
                parts = coord_str.strip().split(',')
                if len(parts) >= 2:
                    lon, lat = parts[0], parts[1]
                    ele = parts[2] if len(parts) > 2 else '0'
                    all_coords.append((lat, lon, ele))
        
        if not all_coords:
            print(f"      No valid coordinates found")
            return False
        
        # Create GPX XML
        gpx_root = ET.Element('gpx', {
            'version': '1.1',
            'creator': 'WheelchairRacer KML→GPX Converter',
            'xmlns': 'http://www.topografix.com/GPX/1/1'
        })
        
        # Create track
        trk = ET.SubElement(gpx_root, 'trk')
        trk_name = ET.SubElement(trk, 'name')
        trk_name.text = 'Parkrun Course'
        
        # Create track segment
        trkseg = ET.SubElement(trk, 'trkseg')
        
        # Add track points
        for lat, lon, ele in all_coords:
            trkpt = ET.SubElement(trkseg, 'trkpt', {
                'lat': lat,
                'lon': lon
            })
            ele_elem = ET.SubElement(trkpt, 'ele')
            ele_elem.text = ele
        
        # Write GPX file
        tree = ET.ElementTree(gpx_root)
        ET.indent(tree, space='  ')
        tree.write(gpx_file, encoding='utf-8', xml_declaration=True)
        
        return True
        
    except Exception as e:
        print(f"      Error converting: {str(e)}")
        return False

def update_parkrun_maps():
    """
    Main function to update parkrun maps with KML/GPX files
    """
    print("=" * 60)
    print("Updating Parkrun Maps - Stage 3: KML→GPX Conversion")
    print("=" * 60)
    print()
    
    # Setup directories
    data_dir = Path(__file__).parent.parent / 'data'
    kml_dir = data_dir / 'parkrun_kml'
    gpx_dir = data_dir / 'parkrun_gpx'
    
    # Create GPX directory if it doesn't exist
    gpx_dir.mkdir(exist_ok=True)
    
    print("1. Loading data...")
    maps_data = load_maps_data()
    print(f"✓ Loaded {len(maps_data)} parkruns")
    print()
    
    # Check for KML files
    print("2. Scanning for KML files...")
    kml_count = 0
    if kml_dir.exists():
        kml_files = list(kml_dir.glob('*.kml'))
        kml_count = len(kml_files)
        print(f"✓ Found {kml_count} KML files in {kml_dir}")
    else:
        print(f"⚠️  KML directory not found: {kml_dir}")
        print("   Please download KML files first!")
        return
    
    print()
    print(f"3. Converting KML → GPX for {kml_count} parkruns...")
    print()
    
    # Process each parkrun
    converted_count = 0
    skipped_count = 0
    failed_count = 0
    
    for i, parkrun in enumerate(maps_data, 1):
        slug = parkrun['slug']
        kml_file = kml_dir / f'{slug}.kml'
        gpx_file = gpx_dir / f'{slug}.gpx'
        
        # Check if KML file exists
        if kml_file.exists():
            print(f"[{i}/{len(maps_data)}] {slug}...", end=" ", flush=True)
            
            # Convert KML to GPX
            if kml_to_gpx(kml_file, gpx_file):
                # Update JSON entry
                parkrun['kml_file'] = f'parkrun_kml/{slug}.kml'
                parkrun['gpx_file'] = f'parkrun_gpx/{slug}.gpx'
                parkrun['has_kml'] = True
                parkrun['has_gpx'] = True
                
                print("✓ Converted")
                converted_count += 1
            else:
                print("✗ Failed")
                failed_count += 1
        else:
            skipped_count += 1
    
    print()
    print("4. Saving updated JSON...")
    save_maps_data(maps_data)
    print(f"✓ Saved to 03_gold_parkrun_maps.json")
    print()
    
    print("=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)
    print()
    print("STATISTICS:")
    print(f"  Total parkruns: {len(maps_data)}")
    print(f"  KML files found: {kml_count}")
    print(f"  Successfully converted: {converted_count}")
    print(f"  Conversion failed: {failed_count}")
    print(f"  Skipped (no KML): {skipped_count}")
    print()
    print(f"  Completion: {converted_count}/{len(maps_data)} ({converted_count/len(maps_data)*100:.1f}%)")
    print()

if __name__ == "__main__":
    update_parkrun_maps()
