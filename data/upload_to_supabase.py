"""
Upload gold parkrun data to Supabase
"""
import json
import os
from supabase import create_client, Client

# Supabase credentials - you'll need to provide these
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")  # Use service key for bulk insert

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
    print("\nUsage:")
    print('  export SUPABASE_URL="https://your-project.supabase.co"')
    print('  export SUPABASE_SERVICE_KEY="your-service-role-key"')
    print("  python upload_to_supabase.py")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("🏃 Uploading Gold Parkrun Data to Supabase...")
print("=" * 60)

# Load gold data
print("\n📂 Loading gold_parkrun_data.json...")
with open("gold_parkrun_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

events = data["events"]
total = len(events)
print(f"✅ Loaded {total} parkrun events")

# Upload in batches for better performance
BATCH_SIZE = 100
successful = 0
failed = 0

print(f"\n💾 Uploading in batches of {BATCH_SIZE}...")

for i in range(0, total, BATCH_SIZE):
    batch = events[i:i + BATCH_SIZE]
    batch_num = (i // BATCH_SIZE) + 1
    total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    
    try:
        # Insert batch
        result = supabase.table("parkruns").upsert(batch).execute()
        successful += len(batch)
        print(f"   ✅ Batch {batch_num}/{total_batches}: {len(batch)} events ({successful}/{total})")
    except Exception as e:
        failed += len(batch)
        print(f"   ❌ Batch {batch_num}/{total_batches} failed: {str(e)}")
        # Continue with next batch

print("\n" + "=" * 60)
print("✅ Upload Complete!")
print(f"📊 Successful: {successful}/{total}")
if failed > 0:
    print(f"⚠️  Failed: {failed}/{total}")
print("=" * 60)
