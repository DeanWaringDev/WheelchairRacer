import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapView from './MapView';

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

interface ParkrunEvent {
  uid: number;
  name: string;
  slug: string;
  shortName: string;
  location: string;
  coordinates: [number, number];
  country: string;
  baseUrl: string;
  junior: boolean;
  coursePageUrl?: string;
  courseMapUrl?: string;
  accessibility?: {
    analyzed: boolean;
    scores: AccessibilityScores;
    keyword_matches: number;
  };
}

interface BronzeData {
  metadata: {
    total_events: number;
  };
  events: ParkrunEvent[];
}

const ParkrunBrowser: React.FC = () => {
  const [data, setData] = useState<BronzeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('United Kingdom');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [countries, setCountries] = useState<string[]>([]);
  const [mobilityFilter, setMobilityFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);

  useEffect(() => {
    // Load both silver data (includes courseMapUrl) and accessibility scores
    const loadData = async () => {
      try {
        const [silverResponse, accessibilityResponse] = await Promise.all([
          fetch('/data/silver_data.json'),
          fetch('/data/parkrun_accessibility_scores.json')
        ]);
        
        const silverData = await silverResponse.json();
        const accessibilityData = await accessibilityResponse.json();
        
        // Merge accessibility scores into silver data (which already has courseMapUrl)
        const mergedEvents = silverData.events.map((silverEvent: ParkrunEvent) => {
          const accessibilityEvent = accessibilityData.events.find(
            (e: any) => e.slug === silverEvent.slug
          );
          
          if (accessibilityEvent) {
            return {
              ...silverEvent,
              accessibility: accessibilityEvent.accessibility
            };
          }
          return silverEvent;
        });
        
        setData({
          ...silverData,
          events: mergedEvents
        });
        
        // Generate unique countries list from events
        if (mergedEvents) {
          const uniqueCountries = [...new Set(mergedEvents.map((event: ParkrunEvent) => event.country))].sort() as string[];
          setCountries(uniqueCountries);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading parkrun events...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Error loading data</div>
      </div>
    );
  }

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow/Orange
    if (score >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  // Helper function to format mobility aid name
  const formatMobilityName = (key: string): string => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Filter events based on country, search term, and mobility scores
  const filteredEvents = data.events.filter(event => {
    const matchesCountry = selectedCountry === 'All' || event.country === selectedCountry;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mobility filter logic
    let matchesMobility = true;
    if (mobilityFilter !== 'all' && event.accessibility?.analyzed) {
      const score = event.accessibility.scores[mobilityFilter as keyof AccessibilityScores];
      matchesMobility = score >= minScore;
    }
    
    return matchesCountry && matchesSearch && matchesMobility;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Browse Parkrun Events</h2>
        
        {/* View toggle */}
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Map View
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="search" className="label">
            Search Events
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or location..."
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="mobility" className="label">
            Mobility Aid Type
          </label>
          <select
            id="mobility"
            value={mobilityFilter}
            onChange={(e) => setMobilityFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Mobility Aids</option>
            <option value="racing_chair">Racing Chair</option>
            <option value="day_chair">Day Chair</option>
            <option value="off_road_chair">Off-Road Chair</option>
            <option value="handbike">Handbike</option>
            <option value="frame_runner">Frame Runner</option>
            <option value="walking_frame">Walking Frame</option>
            <option value="crutches">Crutches</option>
            <option value="walking_stick">Walking Stick</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="minScore" className="label">
            Minimum Score: {minScore}
          </label>
          <input
            type="range"
            id="minScore"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            disabled={mobilityFilter === 'all'}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: mobilityFilter !== 'all' 
                ? `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${minScore}%, #e5e7eb ${minScore}%, #e5e7eb 100%)`
                : undefined
            }}
          />
          <div className="text-xs text-gray-500 mt-1">
            {mobilityFilter === 'all' ? 'Select a mobility aid to filter by score' : `Show parkruns with score ≥ ${minScore}`}
          </div>
        </div>
        
        <div>
          <label htmlFor="country" className="label">
            Country
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input-field"
          >
            <option value="All">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4 text-gray-600">
        Showing {filteredEvents.length} of {data.metadata.total_events} events
      </div>

      {/* Conditional rendering: List or Map view */}
      {viewMode === 'list' ? (
        <>
          {/* Events grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
            {filteredEvents.slice(0, 50).map(event => {
              // Get top 3 scores for display
              const topScores = event.accessibility?.analyzed 
                ? Object.entries(event.accessibility.scores)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                : [];

              return (
                <div key={event.uid} className="card hover:shadow-lg transition-shadow">
                  {/* Header with title and junior badge */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-base">{event.name}</h3>
                    {event.junior && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                        Junior
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <p className="text-gray-600 text-sm mb-3">{event.location}, {event.country}</p>

                  {/* Parkrun Route Map */}
                  {event.courseMapUrl ? (
                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        src={event.courseMapUrl}
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        title={`Route map for ${event.name}`}
                      />
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-[200px] flex items-center justify-center">
                      <p className="text-sm text-gray-500">Route map not available</p>
                    </div>
                  )}

                  {/* Accessibility Scores */}
                  {event.accessibility?.analyzed ? (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Top Accessibility Scores
                      </h4>
                      <div className="space-y-2">
                        {topScores.map(([key, score]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-24 flex-shrink-0">
                              {formatMobilityName(key)}
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${score}%`,
                                  backgroundColor: getScoreColor(score)
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                              {score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Accessibility data not yet available</p>
                    </div>
                  )}

                  {/* View Details Link */}
                  <Link 
                    to={`/parkrun/${event.slug}`}
                    className="btn-primary w-full text-center"
                  >
                    View Full Details →
                  </Link>
                </div>
              );
            })}
          </div>
          
          {filteredEvents.length > 50 && (
            <div className="mt-4 text-center text-gray-500 text-sm">
              Showing first 50 results. Use filters to narrow your search.
            </div>
          )}
        </>
      ) : (
        /* Map view */
        <div className="-mx-6 -mb-6">
          <MapView events={filteredEvents} selectedCountry={selectedCountry} />
        </div>
      )}
    </div>
  );
};

export default ParkrunBrowser;