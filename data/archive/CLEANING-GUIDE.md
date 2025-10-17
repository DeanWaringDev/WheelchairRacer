# Data Cleaning Pipeline

## Overview
This script cleans the scraped parkrun data by:
1. Removing boilerplate text that appears on every parkrun page
2. Fixing incorrect postcodes (TW9 1AE = parkrun HQ)
3. Using reverse geocoding to find real postcodes from coordinates

## Usage

### After scraping completes:

```bash
cd data
python clean_data.py
```

This will:
- Read `parkrun_detail.json` (raw scraped data)
- Remove boilerplate from `boilerplate.txt`
- Fix postcodes using reverse geocoding APIs
- Save to `parkrun_detail_clean.json`

## Postcode Fixing Strategy

The script identifies problematic postcodes:
- **TW9 1AE**: parkrun headquarters (not the actual event location)
- **Missing/None**: No postcode found during scraping

For these cases, it uses reverse geocoding:

### UK Events (using postcodes.io):
```
GET https://api.postcodes.io/postcodes?lon={lng}&lat={lat}&limit=1
```
- ✅ Free, no API key needed
- ✅ Very accurate for UK postcodes
- ✅ Returns proper formatted UK postcodes

### Non-UK Events (using Nominatim/OpenStreetMap):
```
GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json
```
- ✅ Free, no API key needed
- ✅ Worldwide coverage
- ⚠️ Rate limited to 1 request/second

## Expected Results

From the scraping progress (~1700/2747), we expect:
- **Many TW9 1AE postcodes**: Will be replaced with actual postcodes
- **Some missing postcodes**: Will be filled in via reverse geocoding
- **International events**: May have postal codes in different formats

## Output Format

Each event will have:
```json
{
  "uid": 123,
  "name": "Market Harborough parkrun",
  "description": "Three-lap tarmac course...", // Cleaned, boilerplate removed
  "postcode": "LE16 7DP", // Real postcode
  "postcode_source": "reverse_geocoded", // or "scraped" or "not_found"
  "coordinates": { "lat": 52.477, "lng": -0.922 },
  ...
}
```

## Troubleshooting

### Rate Limiting
If you hit rate limits (unlikely for ~2747 events):
- Script automatically waits 1 second between Nominatim requests
- UK postcodes.io has no rate limit

### Missing Postcodes
If reverse geocoding fails:
- `postcode_source` will be set to `"not_found"`
- Coordinates are still available for mapping
- Can manually add postcodes later if needed

### Boilerplate Not Removed
If you find boilerplate text still in descriptions:
- Add the phrase to `boilerplate.txt`
- Re-run the cleaning script

## Next Steps

After cleaning:
1. **Review cleaned data**: Check `parkrun_detail_clean.json`
2. **Run analysis**: Use `analyze_accessibility.py` (to be created)
3. **Generate summaries**: Use AI to create short summaries
4. **Load to database**: Import into Supabase
