"""
Generate AI-written summaries of parkrun course descriptions.

This script reads the full course descriptions from parkrun_accessibility_scores.json,
generates concise, friendly summaries (~250 words) to avoid copyright issues,
and adds them as a new 'summary' field to each event.

The original descriptions are kept for analysis purposes but only summaries are displayed.
"""

import json
import os
from datetime import datetime
from openai import OpenAI

# Initialize OpenAI client (requires OPENAI_API_KEY environment variable)
client = OpenAI()

def generate_summary(course_name: str, description: str, location: str = "") -> str:
    """
    Generate a friendly, concise summary of a parkrun course description.
    
    Args:
        course_name: Name of the parkrun event
        description: Full course description text
        location: Location of the parkrun
        
    Returns:
        AI-generated summary (~250 words)
    """
    if not description or len(description.strip()) < 50:
        return "Course description coming soon. Check back later for detailed information about this parkrun route."
    
    prompt = f"""You are a friendly parkrun course guide. Write a concise, welcoming summary of this parkrun course.

Course: {course_name}
Location: {location}

Original Description:
{description}

Instructions:
- Write approximately 250 words
- Friendly but concise tone
- Focus on: route overview, surface types, terrain, accessibility features, parking, facilities
- Do NOT copy text verbatim - rewrite in your own words
- Start with an engaging opening about the location/setting
- Mention key accessibility features (paved paths, gradients, surfaces)
- End with practical info (parking, facilities)
- Use second person ("you'll run/walk through...")
- Be encouraging and welcoming

Write the summary:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective model
            messages=[
                {"role": "system", "content": "You are a helpful parkrun course guide who writes friendly, accessible course descriptions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,  # ~250-300 words
            temperature=0.7
        )
        
        summary = response.choices[0].message.content.strip()
        return summary
        
    except Exception as e:
        print(f"Error generating summary for {course_name}: {e}")
        return "Course description coming soon. Check back later for detailed information about this parkrun route."


def main():
    """Main function to process all parkrun events and generate summaries."""
    
    # File paths
    input_file = os.path.join('data', 'parkrun_accessibility_scores.json')
    output_file = os.path.join('data', 'parkrun_accessibility_scores_with_summaries.json')
    
    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("ERROR: OPENAI_API_KEY environment variable not set!")
        print("Please set your OpenAI API key:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        return
    
    # Load data
    print(f"Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total_events = len(data['events'])
    print(f"Found {total_events} events to process")
    
    # Process events
    processed = 0
    skipped = 0
    errors = 0
    
    for i, event in enumerate(data['events'], 1):
        slug = event.get('slug', 'unknown')
        name = event.get('name', 'Unknown Parkrun')
        description = event.get('description', '')
        
        # Skip if already has summary
        if 'summary' in event and event['summary']:
            print(f"[{i}/{total_events}] Skipping {name} - already has summary")
            skipped += 1
            continue
        
        print(f"[{i}/{total_events}] Generating summary for {name}...")
        
        try:
            # Get location from event data if available
            location = event.get('location', '')
            
            # Generate summary
            summary = generate_summary(name, description, location)
            
            # Add to event
            event['summary'] = summary
            event['summary_generated_at'] = datetime.now().isoformat()
            
            processed += 1
            
            # Save progress every 50 events
            if processed % 50 == 0:
                print(f"  Saving progress... ({processed} summaries generated)")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            
        except Exception as e:
            print(f"  ERROR: {e}")
            errors += 1
            event['summary'] = "Course description coming soon."
            event['summary_error'] = str(e)
    
    # Update metadata
    data['metadata']['summary_generation'] = {
        'generated_at': datetime.now().isoformat(),
        'total_events': total_events,
        'summaries_generated': processed,
        'already_existed': skipped,
        'errors': errors,
        'model': 'gpt-4o-mini',
        'target_length': '~250 words'
    }
    
    # Save final output
    print(f"\nSaving final output to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Complete!")
    print(f"  Processed: {processed}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {errors}")
    print(f"  Output: {output_file}")
    
    # Also copy to frontend public folder
    frontend_output = os.path.join('frontend', 'public', 'data', 'parkrun_accessibility_scores.json')
    print(f"\nCopying to frontend: {frontend_output}")
    with open(frontend_output, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✅ Ready for use in frontend!")


if __name__ == '__main__':
    main()
