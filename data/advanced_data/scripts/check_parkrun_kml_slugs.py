"""
Script: check_parkrun_kml_slugs.py
Purpose: Validate that all KML files have matching parkrun slugs

This script:
1. Loads the list of valid slugs from 03_gold_parkrun_maps.json
2. Scans the parkrun_kml folder for .kml files
3. Checks each filename against valid slugs
4. Reports matches, mismatches, and duplicates
"""

import json
from pathlib import Path

def load_valid_slugs():
    """Load all valid parkrun slugs from the maps JSON"""
    maps_file = Path(__file__).parent.parent / 'data' / '03_gold_parkrun_maps.json'
    
    with open(maps_file, 'r', encoding='utf-8') as f:
        maps_data = json.load(f)
    
    return {parkrun['slug'] for parkrun in maps_data}

def check_kml_files():
    """Check all KML files against valid slugs"""
    
    print("=" * 60)
    print("Checking KML Files Against Valid Slugs")
    print("=" * 60)
    print()
    
    # Load valid slugs
    print("1. Loading valid parkrun slugs...")
    valid_slugs = load_valid_slugs()
    print(f"✓ Loaded {len(valid_slugs)} valid slugs")
    print()
    
    # Find KML files
    print("2. Scanning for KML files...")
    kml_dir = Path(__file__).parent.parent / 'data' / 'parkrun_kml'
    
    if not kml_dir.exists():
        print(f"✗ KML directory not found: {kml_dir}")
        return
    
    kml_files = list(kml_dir.glob('*.kml'))
    print(f"✓ Found {len(kml_files)} KML files")
    print()
    
    # Check each file
    print("3. Validating filenames...")
    print()
    
    matched = []
    mismatched = []
    seen_slugs = set()
    duplicates = []
    
    for kml_file in sorted(kml_files):
        # Extract slug from filename (remove .kml extension)
        filename_slug = kml_file.stem
        
        # Check if slug is valid
        if filename_slug in valid_slugs:
            matched.append(filename_slug)
            
            # Check for duplicates
            if filename_slug in seen_slugs:
                duplicates.append(filename_slug)
            else:
                seen_slugs.add(filename_slug)
        else:
            mismatched.append({
                'filename': kml_file.name,
                'slug': filename_slug
            })
    
    # Report results
    print("=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)
    print()
    print(f"Files checked:    {len(kml_files)}")
    print(f"Slugs matched:    {len(matched)} ✓")
    print(f"Slugs mismatched: {len(mismatched)} {'✗' if mismatched else '✓'}")
    print(f"Duplicates found: {len(duplicates)} {'⚠️' if duplicates else '✓'}")
    print()
    
    # Show details if there are issues
    if mismatched:
        print("MISMATCHED FILES (not valid parkrun slugs):")
        print("-" * 60)
        for item in mismatched[:20]:  # Show first 20
            print(f"  ✗ {item['filename']} → slug: '{item['slug']}'")
        if len(mismatched) > 20:
            print(f"  ... and {len(mismatched) - 20} more")
        print()
    
    if duplicates:
        print("DUPLICATE FILES (same slug, multiple KML files):")
        print("-" * 60)
        for slug in duplicates:
            print(f"  ⚠️  {slug}.kml (appears multiple times)")
        print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print()
    
    if len(matched) == len(kml_files) and not duplicates:
        print("✅ ALL FILES VALID!")
        print(f"   {len(matched)} KML files correctly named")
        print()
        print(f"Progress: {len(matched)}/2747 parkruns downloaded ({len(matched)/2747*100:.1f}%)")
    else:
        print("⚠️  ISSUES FOUND!")
        if mismatched:
            print(f"   - {len(mismatched)} files with invalid slugs")
        if duplicates:
            print(f"   - {len(duplicates)} duplicate slugs")
        print()
        print("Please fix the issues above before continuing.")
    
    print()
    
    # Show which slugs are missing (if user wants to see progress)
    if len(matched) < len(valid_slugs):
        missing_count = len(valid_slugs) - len(matched)
        print(f"Still need to download: {missing_count} parkruns")
    
    return {
        'total_files': len(kml_files),
        'matched': len(matched),
        'mismatched': len(mismatched),
        'duplicates': len(duplicates),
        'valid': len(matched) == len(kml_files) and not duplicates
    }

if __name__ == "__main__":
    check_kml_files()
