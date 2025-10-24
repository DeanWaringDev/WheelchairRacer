import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MapView from './MapView';
import { supabase } from '../lib/supabase';

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
  const [data, setData] = useState<BronzeData>({ metadata: { total_events: 0 }, events: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('United Kingdom');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [countries, setCountries] = useState<string[]>([]);
  const [mobilityFilter, setMobilityFilter] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [debouncedMinScore, setDebouncedMinScore] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [displayLimit, setDisplayLimit] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term to avoid excessive queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing (reduced from 500ms for better UX)
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce minScore slider to avoid excessive queries while dragging
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinScore(minScore);
    }, 150); // Wait 150ms after user stops moving slider
    
    return () => clearTimeout(timer);
  }, [minScore]);

  // Load countries list on mount
  useEffect(() => {
    const loadCountries = async () => {
      const { data: parkruns } = await supabase
        .from('parkruns')
        .select('country');
      
      if (parkruns) {
        const uniqueCountries = [...new Set(parkruns.map((p: any) => p.country))].sort() as string[];
        setCountries(uniqueCountries);
      }
    };
    loadCountries();
  }, []);

  // Load parkruns based on filters - smart loading strategy
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('parkruns')
          .select('*', { count: 'exact' });

        // Apply country filter
        if (selectedCountry !== 'All') {
          query = query.eq('country', selectedCountry);
        }

        // If user is searching or filtering, search all parkruns
        if (debouncedSearchTerm.trim()) {
          // Search in name and location
          query = query
            .or(`long_name.ilike.%${debouncedSearchTerm}%,location.ilike.%${debouncedSearchTerm}%`)
            .order('long_name')
            .limit(50); // Return top 50 matching results
        } else if (mobilityFilter !== 'all' || debouncedMinScore > 0) {
          // User has selected filters - need to load more to filter client-side
          query = query.order('long_name').limit(200);
        } else {
          // Default: show top 50 most accessible parkruns for racing chairs
          query = query
            .order('accessibility->racing_chair->final_score', { ascending: false })
            .limit(50);
        }
        
        const { data: parkruns, error: queryError, count } = await query;
        
        if (queryError) {
          console.error('Error loading parkruns from Supabase:', queryError);
          setError('Failed to load parkrun data. Please refresh the page.');
          setLoading(false);
          return;
        }
        
        // Store total count
        setTotalCount(count || 0);
        
        // Transform Supabase data to match expected format
        const transformedEvents = parkruns?.map((parkrun: any) => ({
          uid: parkrun.uid,
          name: parkrun.long_name,
          slug: parkrun.slug,
          shortName: parkrun.short_name,
          location: parkrun.location,
          coordinates: parkrun.coordinates,
          country: parkrun.country,
          baseUrl: `https://www.parkrun.org.uk/${parkrun.slug}`,
          junior: parkrun.is_junior,
          coursePageUrl: parkrun.course_page_url,
          courseMapUrl: parkrun.google_maps_url,
          accessibility: {
            analyzed: true,
            scores: {
              racing_chair: parkrun.accessibility.racing_chair.final_score,
              day_chair: parkrun.accessibility.day_chair.final_score,
              off_road_chair: parkrun.accessibility.off_road_chair.final_score,
              handbike: parkrun.accessibility.handbike.final_score,
              frame_runner: parkrun.accessibility.frame_runner.final_score,
              walking_frame: parkrun.accessibility.walking_frame.final_score,
              crutches: parkrun.accessibility.crutches.final_score,
              walking_stick: parkrun.accessibility.walking_stick.final_score
            },
            keyword_matches: parkrun.keywords.count
          }
        })) || [];
        
        setData({
          metadata: {
            total_events: count || 0
          },
          events: transformedEvents
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An unexpected error occurred. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCountry, debouncedSearchTerm, mobilityFilter, debouncedMinScore]); // Reload when filters change

  // Handle loading more events
  const handleLoadMore = useCallback(() => {
    setDisplayLimit(prev => prev + 50);
  }, []);

  // Memoized helper function to get score color
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow/Orange
    if (score >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  }, []);

  // Memoized helper function to format mobility aid name
  const formatMobilityName = useCallback((key: string): string => {
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

  // Memoized client-side filter (now handles all filtering for instant results)
  const filteredEvents = useMemo(() => {
    if (!data || !data.events) return [];
    
    return data.events.filter(event => {
      // Search filter (name or location)
      if (debouncedSearchTerm.trim()) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesName = event.name.toLowerCase().includes(searchLower);
        const matchesLocation = event.location.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesLocation) return false;
      }
      
      // Mobility filter with minimum score
      if (mobilityFilter !== 'all' && event.accessibility?.analyzed) {
        const score = event.accessibility.scores[mobilityFilter as keyof AccessibilityScores];
        return score >= debouncedMinScore;
      }
      
      return true;
    });
  }, [data, debouncedSearchTerm, mobilityFilter, debouncedMinScore]);

  // Show error message if loading failed
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

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
            <option value="United Kingdom">United Kingdom</option>
            {countries.filter(c => c !== 'United Kingdom').map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Handbike Safety Alert */}
      {mobilityFilter === 'handbike' && (
        <div className="mb-6 p-4 rounded-lg border-l-4 bg-yellow-50 border-yellow-400">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 mb-1">Important Notice</p>
              <p className="text-sm text-yellow-700">
                Parkrun does not allow the use of handbikes at their events due to safety of all participants. 
                The Handbike analysis is just here as a guide if you wanted to attempt the route outside of Parkrun.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="mb-4 text-gray-600">
        Showing {filteredEvents.length} of {totalCount} events
        {loading && <span className="ml-2 text-blue-600">⟳ Loading...</span>}
      </div>

      {/* Conditional rendering: List or Map view */}
      {viewMode === 'list' ? (
        <>
          {/* Events grid with pagination */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ opacity: loading ? 0.5 : 1 }}>
            {filteredEvents.slice(0, displayLimit).map(event => {
                      // Get top 3 scores for display
                      const topScores = event.accessibility?.analyzed 
                        ? Object.entries(event.accessibility.scores)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                        : [];

                      return (
                        <div key={event.uid} className="card hover:shadow-lg transition-shadow p-4">
                          {/* Header with title and junior badge */}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-sm">{event.name}</h3>
                            {event.junior && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">
                                Junior
                              </span>
                            )}
                          </div>

                          {/* Location */}
                          <p className="text-gray-600 text-xs mb-2">{event.location}, {event.country}</p>

                          {/* Parkrun Route Map */}
                          {event.courseMapUrl ? (
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                              <iframe
                                src={event.courseMapUrl}
                                width="100%"
                                height="140"
                                style={{ border: 0 }}
                                loading="lazy"
                                title={`Route map for ${event.name}`}
                              />
                            </div>
                          ) : (
                            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-[140px] flex items-center justify-center">
                              <p className="text-xs text-gray-500">Route map not available</p>
                            </div>
                          )}

                          {/* Accessibility Scores */}
                          {event.accessibility?.analyzed ? (
                            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                              <h4 className="text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                Top Accessibility Scores
                              </h4>
                              <div className="space-y-1.5">
                                {topScores.map(([key, score]) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 w-20 flex-shrink-0">
                                      {formatMobilityName(key)}
                                    </span>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full transition-all"
                                        style={{
                                          width: `${score}%`,
                                          backgroundColor: getScoreColor(score)
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 w-7 text-right">
                                      {score}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2 p-2 bg-gray-50 rounded-lg text-center">
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
          
          {filteredEvents.length > displayLimit && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                className="btn-primary px-6 py-3"
              >
                Load More Events ({filteredEvents.length - displayLimit} remaining)
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center text-gray-500 text-sm">
            Showing {Math.min(displayLimit, filteredEvents.length)} of {filteredEvents.length} events
          </div>
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

// Wrap in React.memo to prevent unnecessary re-renders when parent updates
export default React.memo(ParkrunBrowser);