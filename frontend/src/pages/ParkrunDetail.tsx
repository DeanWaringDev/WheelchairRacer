import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface AccessibilityScores {
  racing_chair: number;
  day_chair: number;
  off_road_chair: number;
  handbike: number;
  frame_runner: number;
  walking_frame: number;
  crutches: number;
  walking_stick: number;
}

interface AccessibilityCategories {
  racing_chair: string;
  day_chair: string;
  off_road_chair: string;
  handbike: string;
  frame_runner: string;
  walking_frame: string;
  crutches: string;
  walking_stick: string;
}

interface KeywordImpact {
  keyword: string;
  category: string;
  impact: number;
}

interface DetailedScore {
  score: number;
  keyword_count: number;
  impacts: KeywordImpact[];
}

interface ParkrunEvent {
  uid: number;
  name: string;
  slug: string;
  coursePageUrl: string;
  description: string;
  summary?: string;  // AI-generated summary for display
  postcode?: string;
  scrapingStatus: string;
  accessibility: {
    analyzed: boolean;
    scores: AccessibilityScores;
    categories: AccessibilityCategories;
    keyword_matches: number;
    detailed_scores: {
      [key: string]: DetailedScore;
    };
  };
  // Merged from silver data
  location?: string;
  coordinates?: [number, number];
  country?: string;
  courseMapUrl?: string;  // Google Maps embed URL for route
}

interface ParkrunData {
  metadata: {
    total_events: number;
  };
  events: ParkrunEvent[];
}

const ParkrunDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<ParkrunEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        // Load both datasets
        const [accessibilityResponse, silverResponse] = await Promise.all([
          fetch('/data/parkrun_accessibility_scores.json'),
          fetch('/data/silver_data.json')
        ]);
        
        const accessibilityData: ParkrunData = await accessibilityResponse.json();
        const silverData: { events: any[] } = await silverResponse.json();
        
        const foundEvent = accessibilityData.events.find(e => e.slug === slug);
        const silverEvent = silverData.events.find((e: any) => e.slug === slug);
        
        if (foundEvent) {
          // Merge silver data (location, coordinates, country, courseMapUrl)
          if (silverEvent) {
            foundEvent.location = silverEvent.location;
            foundEvent.coordinates = silverEvent.coordinates;
            foundEvent.country = silverEvent.country;
            foundEvent.courseMapUrl = silverEvent.courseMapUrl;
          }
          setEvent(foundEvent);
        } else {
          setError('Parkrun event not found');
        }
      } catch (err) {
        setError('Failed to load parkrun data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [slug]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    if (score >= 20) return 'bg-red-500';
    return 'bg-gray-800';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    if (score >= 40) return 'text-orange-700';
    if (score >= 20) return 'text-red-700';
    return 'text-gray-700';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      'excellent': 'Excellent',
      'good': 'Good',
      'moderate': 'Moderate',
      'challenging': 'Challenging',
      'very_challenging': 'Very Challenging'
    };
    return labels[category] || category;
  };

  const formatMobilityType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12" style={{ borderBottom: '2px solid var(--color-primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--color-text-body)' }}>Loading parkrun details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#C33' }}>Error</h1>
            <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>{error || 'Parkrun not found'}</p>
            <Link to="/parkrun" className="hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
              ← Back to Parkrun List
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Use Google Maps route embed if available, otherwise fallback to OpenStreetMap
  const mapUrl = event.courseMapUrl 
    ? event.courseMapUrl
    : event.coordinates 
      ? (() => {
          const [lng, lat] = event.coordinates;
          const offset = 0.015;
          const minLng = lng - offset;
          const maxLng = lng + offset;
          const minLat = lat - offset;
          const maxLat = lat + offset;
          return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;
        })()
      : 'https://www.openstreetmap.org/export/embed.html?bbox=-0.3,51.4,-0.1,51.5&layer=mapnik';

  const mobilityTypes = [
    'racing_chair',
    'day_chair',
    'off_road_chair',
    'handbike',
    'frame_runner',
    'walking_frame',
    'crutches',
    'walking_stick'
  ];

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/parkrun" className="mb-4 inline-block hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
          ← Back to Parkrun List
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>{event.name}</h1>
          {event.location && (
            <p className="text-lg mb-1" style={{ color: 'var(--color-text-body)' }}>{event.location}</p>
          )}
          {event.country && (
            <p className="text-md mb-1" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>{event.country}</p>
          )}
          {event.postcode && (
            <p className="text-md" style={{ color: 'var(--color-text-body)' }}>{event.postcode}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            <section className="card overflow-hidden">
              <h2 className="text-2xl font-semibold p-6 pb-4" style={{ color: 'var(--color-secondary)' }}>Route Map</h2>
              <div className="aspect-video w-full">
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0"
                  title={`${event.name} route map`}
                />
              </div>
              <div className="p-4 text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--color-text-body)' }}>
                <p>Interactive map showing the parkrun location. Zoom in/out for more detail.</p>
              </div>
            </section>

            {/* Course Description */}
            <section className="card p-6">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Course Overview</h2>
              <div className="prose max-w-none">
                {event.summary ? (
                  <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
                    {event.summary}
                  </p>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
                    {event.description}
                  </p>
                )}
              </div>
              {event.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <em>Note: This course overview is AI-generated from the official parkrun course description for easier readability.</em>
                  </p>
                </div>
              )}
            </section>

            {/* Official Course Page Link */}
            <section className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>Official Course Information</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>
                For the latest updates, event details, and volunteer information, visit the official parkrun course page.
              </p>
              <a
                href={event.coursePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-block px-6 py-3"
              >
                View Official Course Page →
              </a>
            </section>
          </div>

          {/* Right column - Accessibility scores */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Accessibility Scores</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-body)' }}>
                Scores are based on course description analysis using {event.accessibility.keyword_matches} keyword matches.
              </p>

              {/* Scores table */}
              <div className="space-y-3">
                {mobilityTypes.map(type => (
                  <div key={type} className="pb-3 last:border-b-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--color-secondary)' }}>
                        {formatMobilityType(type)}
                      </span>
                      <span className={`font-bold text-lg ${getScoreTextColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}>
                        {event.accessibility.scores[type as keyof AccessibilityScores]}/100
                      </span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div
                        className={`h-2 rounded-full ${getScoreColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}
                        style={{ width: `${event.accessibility.scores[type as keyof AccessibilityScores]}%` }}
                      />
                    </div>
                    <div className="mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
                        {getCategoryLabel(event.accessibility.categories[type as keyof AccessibilityCategories])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Score legend */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>Score Guide</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>80-100: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FB3' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>60-79: Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>40-59: Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C33' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>20-39: Challenging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>0-19: Very Challenging</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Note:</strong> Scores are automatically generated from course descriptions. 
                  Always check the official course page and contact the event team for specific accessibility questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ParkrunDetail;
