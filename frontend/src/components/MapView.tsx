import React, { useState, useEffect } from 'react';

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

interface MapProps {
  events: ParkrunEvent[];
  selectedCountry?: string;
}

const MapView: React.FC<MapProps> = ({ events, selectedCountry }) => {
  const [mapEvents, setMapEvents] = useState<ParkrunEvent[]>([]);

  useEffect(() => {
    // Filter events for the map
    const filteredEvents = selectedCountry && selectedCountry !== 'All' 
      ? events.filter(event => event.country === selectedCountry)
      : events;
    
    // Limit to first 100 events for performance
    setMapEvents(filteredEvents.slice(0, 100));
  }, [events, selectedCountry]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Parkrun Locations Map</h2>
      
      {/* Map placeholder - In a real implementation, you'd use a map library like Leaflet or Google Maps */}
      <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            {mapEvents.length} events ready to display
            {selectedCountry && selectedCountry !== 'All' && (
              <span> in {selectedCountry}</span>
            )}
          </p>
          
          {/* Sample coordinates display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {mapEvents.slice(0, 8).map((event) => (
              <div key={event.uid} className="bg-white bg-opacity-75 rounded p-2 text-xs">
                <div className="font-semibold text-blue-800">{event.shortName}</div>
                <div className="text-gray-600">
                  {event.coordinates[1].toFixed(2)}, {event.coordinates[0].toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          {mapEvents.length > 8 && (
            <div className="mt-3 text-sm text-gray-500">
              And {mapEvents.length - 8} more locations...
            </div>
          )}
        </div>
      </div>
      
      {/* Map controls and stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Coverage Stats</h4>
          <p className="text-blue-600 text-sm">
            Showing {mapEvents.length} of {events.length} events
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Accessibility</h4>
          <p className="text-green-600 text-sm">
            Route analysis coming soon
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Features</h4>
          <p className="text-purple-600 text-sm">
            Interactive mapping in development
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;