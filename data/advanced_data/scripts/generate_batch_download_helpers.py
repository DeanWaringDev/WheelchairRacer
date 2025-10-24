"""
Generate separate HTML files for each batch of 250 parkruns
Makes it easy to divide work between multiple people
"""

import json
from pathlib import Path

# Load the maps data
maps_file = Path(__file__).parent.parent / 'data' / '03_gold_parkrun_maps.json'

with open(maps_file, 'r', encoding='utf-8') as f:
    maps_data = json.load(f)

# Split into batches of 250
batch_size = 250
total_batches = (len(maps_data) + batch_size - 1) // batch_size  # Ceiling division

output_dir = Path(__file__).parent.parent / 'data'

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(maps_data))
    batch_data = maps_data[start_idx:end_idx]
    
    start_number = start_idx + 1
    end_number = end_idx
    
    # Generate HTML for this batch
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Parkrun Maps {start_number}-{end_number} - KML Download Helper</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .stats {{
            background-color: #fff;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .parkrun-list {{
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .parkrun-item {{
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }}
        .parkrun-item:hover {{
            background-color: #f9f9f9;
        }}
        .parkrun-number {{
            color: #666;
            font-size: 0.9em;
            min-width: 80px;
            font-weight: bold;
        }}
        .parkrun-slug {{
            font-weight: bold;
            min-width: 250px;
            color: #333;
        }}
        .parkrun-link a {{
            color: #4CAF50;
            text-decoration: none;
        }}
        .parkrun-link a:hover {{
            text-decoration: underline;
        }}
        .instructions {{
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }}
        .instructions h3 {{
            margin-top: 0;
        }}
        .batch-info {{
            background-color: #d1ecf1;
            border-left: 4px solid #0c5460;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 1.1em;
        }}
    </style>
</head>
<body>
    <h1>🗺️ Parkrun Maps {start_number}-{end_number}</h1>
    
    <div class="batch-info">
        <strong>📦 Batch {batch_num + 1} of {total_batches}</strong><br>
        Parkruns: {start_number} to {end_number} ({len(batch_data)} total)
    </div>
    
    <div class="stats">
        <strong>Range:</strong> {start_number}-{end_number}<br>
        <strong>Count:</strong> {len(batch_data)} parkruns<br>
        <strong>Save files as:</strong> <code>data/parkrun_kml/{{{{slug}}}}.kml</code>
    </div>
    
    <div class="instructions">
        <h3>📋 Instructions:</h3>
        <ol>
            <li>Click on a Google Maps link below</li>
            <li>Click the <strong>fullscreen</strong> icon on the right side</li>
            <li>Click the <strong>⋮</strong> (three dots) menu</li>
            <li>Select <strong>"Export to KML/KMZ"</strong></li>
            <li>Choose <strong>KML</strong> format (not KMZ)</li>
            <li>Save and rename to: <code>{{{{slug}}}}.kml</code></li>
            <li>Move to: <code>data/parkrun_kml/</code> folder</li>
        </ol>
    </div>
    
    <div class="parkrun-list">
        <h2>Parkruns {start_number}-{end_number}</h2>
"""
    
    # Add each parkrun in this batch
    for i, parkrun in enumerate(batch_data):
        global_number = start_idx + i + 1
        slug = parkrun['slug']
        url = parkrun['google_maps_url']
        
        if url:
            html += f"""
        <div class="parkrun-item">
            <span class="parkrun-number">{global_number}.</span>
            <span class="parkrun-slug">{slug}</span>
            <span class="parkrun-link"><a href="{url}" target="_blank">Open Google Maps →</a></span>
        </div>
"""
        else:
            html += f"""
        <div class="parkrun-item">
            <span class="parkrun-number">{global_number}.</span>
            <span class="parkrun-slug">{slug}</span>
            <span class="parkrun-link" style="color: #999;">No URL available</span>
        </div>
"""
    
    html += """
    </div>
</body>
</html>
"""
    
    # Save HTML file
    filename = f'parkrun_maps_batch_{batch_num + 1:02d}_{start_number:04d}-{end_number:04d}.html'
    output_file = output_dir / filename
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✓ Generated: {filename}")

print()
print("=" * 60)
print("✅ ALL BATCH FILES GENERATED!")
print("=" * 60)
print()
print(f"Total batches: {total_batches}")
print(f"Files per batch: ~{batch_size}")
print()
print("DISTRIBUTION SUGGESTION:")
print("  Person 1: Batches 1-4  (parkruns 1-1000)")
print("  Person 2: Batches 5-8  (parkruns 1001-2000)")
print("  Person 3: Batches 9-11 (parkruns 2001-2747)")
print()
print("Each person opens their batch files and works through them!")
