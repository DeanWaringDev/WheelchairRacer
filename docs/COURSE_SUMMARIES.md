# Course Description Summaries

## Copyright & Legal Compliance

**Problem:** Displaying scraped parkrun course descriptions verbatim could raise copyright concerns.

**Solution:** Use AI to generate original, rewritten summaries (~250 words each) of the course descriptions. The original descriptions are kept for accessibility analysis but only AI-generated summaries are displayed to users.

## How It Works

1. **Original descriptions** are scraped and stored in `parkrun_accessibility_scores.json`
2. **AI summaries** are generated using OpenAI's GPT-4o-mini model
3. **Analysis uses** the full original description for keyword extraction and scoring
4. **Frontend displays** only the AI-generated summary to users

## Generating Summaries

### Prerequisites

1. **OpenAI API Key** - You need an active OpenAI account with API access
2. **Python packages** - Install required dependencies:
   ```bash
   pip install openai
   ```

### Running the Script

```bash
# Set your OpenAI API key
export OPENAI_API_KEY='your-api-key-here'

# Run the summary generation script
cd WheelchairRacer
python scripts/generate_course_summaries.py
```

### What Happens

The script will:
1. Load all parkrun events from `data/parkrun_accessibility_scores.json`
2. For each event without a summary:
   - Send the course description to OpenAI GPT-4o-mini
   - Generate a friendly, concise ~250 word summary
   - Add the summary to the event data
3. Save progress every 50 events (in case of interruption)
4. Output the updated data to:
   - `data/parkrun_accessibility_scores_with_summaries.json`
   - `frontend/public/data/parkrun_accessibility_scores.json` (for the frontend)

### Cost Estimate

- **Model:** GPT-4o-mini (very cost-effective)
- **Cost:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Per event:** ~500 input tokens + ~300 output tokens = ~$0.00026 per event
- **Total (2,747 events):** Approximately **$0.70 - $1.00** for all summaries

### Re-running

The script is smart:
- **Skips events** that already have summaries
- **Only processes** new events or events with failed summaries
- **Saves progress** frequently so you can stop and restart

## Summary Quality

Each summary:
- ✅ ~250 words (friendly but concise)
- ✅ Completely rewritten (not copied text)
- ✅ Focuses on key info: route, surfaces, accessibility, facilities
- ✅ Welcoming tone ("you'll run/walk through...")
- ✅ Mentions accessibility features (paved paths, gradients, etc.)
- ✅ Includes practical info (parking, facilities)

## Frontend Implementation

The frontend automatically:
1. **Displays summary** if available (`event.summary`)
2. **Falls back** to original description if no summary yet
3. **Shows note** that summary is AI-generated for transparency
4. **Uses original** description for analysis (not shown to users)

## Example

**Original (from parkrun.org):**
> "The course is two and a half laps of the park, starting near the cafe and finishing at the same point. The route is on tarmac paths throughout, with two short but sharp hills on each lap..."

**AI Summary:**
> "Welcome to Richmond parkrun, set in the stunning Richmond Park! You'll complete two and a half scenic laps of this historic royal park, starting and finishing near the welcoming café area. The entire route follows well-maintained tarmac paths, making it accessible for various mobility aids. Be prepared for two short but noticeable climbs on each lap – these add character to the course and reward you with beautiful views. The park's paved surfaces are ideal for racing chairs and day chairs..."

## Legal Notes

- ✅ AI summaries are transformative and original
- ✅ Descriptions are rewritten, not copied
- ✅ Complies with fair use for analysis purposes
- ✅ Transparent about AI generation to users
- ✅ Original sources are credited (parkrun course pages linked)

## Future Updates

To regenerate summaries (e.g., after parkrun updates their courses):

1. Delete the `summary` field from events you want to regenerate
2. Run the script again - it will only process events without summaries
3. Review the new summaries for quality
4. Deploy the updated JSON file

## Questions?

- **Do we need to regenerate often?** No - parkrun course descriptions rarely change
- **What if summaries are poor quality?** You can manually edit the `summary` field in the JSON
- **Can we use a different AI model?** Yes - edit the `model` parameter in the script
- **Is this legally safe?** Yes - AI-generated summaries are original content
