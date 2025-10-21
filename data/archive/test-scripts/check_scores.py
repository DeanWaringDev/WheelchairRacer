import os
from supabase import create_client
import json

# Initialize Supabase client
url = 'https://uezmndcoqfpfccmrksvt.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlem1uZGNvcWZwZmNjbXJrc3Z0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU5NjMwNCwiZXhwIjoyMDc2MTcyMzA0fQ.-MH_QOaifGDLpwZ4YuuEe1asVwe34ETPorxawuIzOpk'
supabase = create_client(url, key)

# Fetch the three parkruns
parkruns = ['rutlandwater', 'northampton', 'kettering']

for slug in parkruns:
    response = supabase.table('parkruns').select('*').eq('slug', slug).execute()
    
    if response.data:
        parkrun = response.data[0]
        print('\n' + '='*80)
        print(f'PARKRUN: {parkrun["long_name"]} ({parkrun["slug"]})')
        print('='*80)
        
        # Racing chair score details
        racing_chair = parkrun['accessibility']['racing_chair']
        print(f'\nRACING CHAIR SCORE: {racing_chair["final_score"]}')
        print(f'   Starting Score: {racing_chair["starting_score"]}')
        print(f'   Keyword Adjustment: {racing_chair["keyword_adjustment"]}')
        print(f'   Final Score: {racing_chair["final_score"]}')
        
        # Keywords matched
        if 'keywords' in parkrun and parkrun['keywords']:
            print(f'\nMATCHED KEYWORDS ({parkrun["keywords"]["count"]} total):')
            print('_'*80)
            print(f'{"Keyword":<40} {"Impact":>10}')
            print('_'*80)
            
            # Use 'details' which has the full keyword objects with impact
            keywords = parkrun['keywords'].get('details', [])
            
            # Sort by impact (most negative first)
            for kw in sorted(keywords, key=lambda x: x.get('impact', 0)):
                keyword_text = kw.get('keyword', 'Unknown')
                impact = kw.get('impact', 0)
                print(f'{keyword_text:<40} {impact:>+10}')
        
        print('\n')
    else:
        print(f'NOT FOUND: {slug}')
