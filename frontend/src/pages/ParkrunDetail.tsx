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

interface BronzeEvent {
  uid: number;
  name: string;
  slug: string;
  shortName: string;
  location: string;
  coordinates: [number, number];
  country: string;
  baseUrl: string;
  junior: boolean;
}

interface ParkrunEvent {
  uid: number;
  name: string;
  slug: string;
  coursePageUrl: string;
  description: string;
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
  // Merged from bronze data
  location?: string;
  coordinates?: [number, number];
  country?: string;
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
        const [accessibilityResponse, bronzeResponse] = await Promise.all([
          fetch('/data/parkrun_accessibility_scores.json'),
          fetch('/data/bronze_data.json')
        ]);
        
        const accessibilityData: ParkrunData = await accessibilityResponse.json();
        const bronzeData: { events: BronzeEvent[] } = await bronzeResponse.json();
        
        const foundEvent = accessibilityData.events.find(e => e.slug === slug);
        const bronzeEvent = bronzeData.events.find(e => e.slug === slug);
        
        if (foundEvent) {
          // Merge bronze data (location, coordinates, country)
          if (bronzeEvent) {
            foundEvent.location = bronzeEvent.location;
            foundEvent.coordinates = bronzeEvent.coordinates;
            foundEvent.country = bronzeEvent.country;
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
      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading parkrun details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error || 'Parkrun not found'}</p>
            <Link to="/parkrun" className="text-blue-600 hover:text-blue-800">
              ← Back to Parkrun List
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Generate OpenStreetMap embed URL with actual coordinates
  const mapUrl = event.coordinates 
    ? (() => {
        const [lng, lat] = event.coordinates;
        // Create a bounding box around the point (about 2km x 2km)
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
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/parkrun" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Parkrun List
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{event.name}</h1>
          {event.location && (
            <p className="text-gray-600 text-lg mb-1">{event.location}</p>
          )}
          {event.country && (
            <p className="text-gray-500 text-md mb-1">{event.country}</p>
          )}
          {event.postcode && (
            <p className="text-gray-600 text-md">{event.postcode}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            <section className="bg-white rounded-lg shadow-md overflow-hidden">
              <h2 className="text-2xl font-semibold text-gray-800 p-6 pb-4">Route Map</h2>
              <div className="aspect-video w-full">
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0"
                  title={`${event.name} route map`}
                />
              </div>
              <div className="p-4 bg-gray-50 text-sm text-gray-600">
                <p>Interactive map showing the parkrun location. Zoom in/out for more detail.</p>
              </div>
            </section>

            {/* Course Description */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Course Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
              </div>
            </section>

            {/* Official Course Page Link */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Official Course Information</h2>
              <p className="text-gray-600 mb-4">
                For the latest updates, event details, and volunteer information, visit the official parkrun course page.
              </p>
              <a
                href={event.coursePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                View Official Course Page →
              </a>
            </section>
          </div>

          {/* Right column - Accessibility scores */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accessibility Scores</h2>
              <p className="text-sm text-gray-600 mb-6">
                Scores are based on course description analysis using {event.accessibility.keyword_matches} keyword matches.
              </p>

              {/* Scores table */}
              <div className="space-y-3">
                {mobilityTypes.map(type => (
                  <div key={type} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 text-sm">
                        {formatMobilityType(type)}
                      </span>
                      <span className={`font-bold text-lg ${getScoreTextColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}>
                        {event.accessibility.scores[type as keyof AccessibilityScores]}/100
                      </span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}
                        style={{ width: `${event.accessibility.scores[type as keyof AccessibilityScores]}%` }}
                      />
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        {getCategoryLabel(event.accessibility.categories[type as keyof AccessibilityCategories])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Score legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Score Guide</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-600">80-100: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-600">60-79: Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-gray-600">40-59: Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-600">20-39: Challenging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-800 rounded"></div>
                    <span className="text-gray-600">0-19: Very Challenging</span>
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
