import React, { useState, useEffect } from 'react';
import MapView from './MapView';

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
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    // Load the bronze data
    const loadData = async () => {
      try {
        const response = await fetch('/data/bronze_data.json');
        const bronzeData = await response.json();
        setData(bronzeData);
        
        // Generate unique countries list from events
        if (bronzeData.events) {
          const uniqueCountries = [...new Set(bronzeData.events.map((event: ParkrunEvent) => event.country))].sort() as string[];
          setCountries(uniqueCountries);
        }
      } catch (error) {
        console.error('Error loading bronze data:', error);
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

  // Filter events based on country and search term
  const filteredEvents = data.events.filter(event => {
    const matchesCountry = selectedCountry === 'All' || event.country === selectedCountry;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Events
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or location..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredEvents.slice(0, 50).map(event => (
              <div key={event.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{event.name}</h3>
                  {event.junior && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Junior
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{event.location}</p>
                <p className="text-gray-500 text-xs mb-2">{event.country}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {event.coordinates[1].toFixed(3)}, {event.coordinates[0].toFixed(3)}
                  </span>
                  <a 
                    href={`https://${event.baseUrl}/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
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