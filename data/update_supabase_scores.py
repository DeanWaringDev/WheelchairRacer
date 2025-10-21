"""
Update existing Supabase records with recalculated scores
"""

import os
import json
from supabase import create_client

# Get credentials
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_KEY')

if not url or not key:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
    exit(1)

supabase = create_client(url, key)

print("🔄 Updating Parkrun Scores in Supabase...")
print("="*80)

# Load updated gold data
print("📂 Loading gold_parkrun_data.json...")
with open('gold_parkrun_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

parkruns = data['events']
print(f"✅ Loaded {len(parkruns)} parkruns\n")

# Update in batches
batch_size = 10  # Smaller batches for updates
total = len(parkruns)
updated = 0
errors = 0

for i in range(0, total, batch_size):
    batch = parkruns[i:i+batch_size]
    
    # Update each record individually
    for parkrun in batch:
        try:
            # Update only the fields that changed
            update_data = {
                'keywords': parkrun['keywords'],
                'accessibility': parkrun['accessibility']
            }
            
            result = supabase.table('parkruns').update(update_data).eq('uid', parkrun['uid']).execute()
            updated += 1
            
        except Exception as e:
            print(f"   ❌ Error updating uid {parkrun['uid']}: {e}")
            errors += 1
    
    # Progress update
    if (i + batch_size) % 100 == 0:
        print(f"   Updated {min(i + batch_size, total)}/{total} parkruns...")

print(f"\n✅ Successfully updated {updated} parkrun records!")
if errors > 0:
    print(f"⚠️  {errors} errors occurred")

# Verify a sample
print("\n" + "="*80)
print("VERIFICATION: Checking Rutland Water...")
print("="*80)

result = supabase.table('parkruns').select('*').eq('slug', 'rutlandwater').execute()
if result.data:
    parkrun = result.data[0]
    racing_chair = parkrun['accessibility']['racing_chair']
    print(f"✅ Rutland Water Racing Chair Score: {racing_chair['final_score']}")
    print(f"   Keyword Adjustment: {racing_chair['keyword_adjustment']}")
    print(f"   Keywords matched: {parkrun['keywords']['count']}")
