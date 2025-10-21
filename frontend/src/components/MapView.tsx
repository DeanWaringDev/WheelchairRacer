import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  courseMapUrl?: string;
  accessibility?: {
    analyzed: boolean;
    scores: AccessibilityScores;
    keyword_matches: number;
  };
}

interface MapProps {
  events: ParkrunEvent[];
  selectedCountry?: string;
}

// Helper function to get average accessibility score
const getAverageScore = (event: ParkrunEvent): number => {
  if (!event.accessibility?.analyzed) return 0;
  
  const scores = Object.values(event.accessibility.scores);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

// Helper function to get color based on accessibility score
const getScoreColor = (score: number): string => {
  if (score >= 70) return '#10b981'; // Green - High accessibility
  if (score >= 40) return '#f97316'; // Orange - Medium accessibility
  return '#ef4444'; // Red - Low accessibility
};

// Create custom colored marker icons
const createColoredIcon = (color: string, isJunior: boolean) => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" 
            fill="${color}" stroke="#fff" stroke-width="2"/>
      ${isJunior ? '<circle cx="12.5" cy="12.5" r="4" fill="#fff"/>' : ''}
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Helper function to nudge coordinates for overlapping parkruns
const adjustCoordinates = (
  events: ParkrunEvent[], 
  event: ParkrunEvent
): [number, number] => {
  const [lng, lat] = event.coordinates;
  
  // Find other events at the same location
  const sameLocation = events.filter(e => 
    e.uid !== event.uid &&
    Math.abs(e.coordinates[0] - lng) < 0.0001 &&
    Math.abs(e.coordinates[1] - lat) < 0.0001
  );
  
  if (sameLocation.length === 0) return [lat, lng];
  
  // If this is a junior and there's a regular at same spot, nudge it slightly east
  if (event.junior) {
    return [lat, lng + 0.001]; // Nudge ~100m east
  }
  
  return [lat, lng];
};

// Component to handle map bounds adjustment
const MapBoundsHandler: React.FC<{ events: ParkrunEvent[] }> = ({ events }) => {
  const map = useMap();

  useEffect(() => {
    if (events.length > 0) {
      const bounds = L.latLngBounds(events.map(e => {
        const adjusted = adjustCoordinates(events, e);
        return adjusted;
      }));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [events, map]);

  return null;
};

const MapView: React.FC<MapProps> = ({ events, selectedCountry }) => {
  const [mapEvents, setMapEvents] = useState<ParkrunEvent[]>([]);

  useEffect(() => {
    // Filter events for the map
    const filteredEvents = selectedCountry && selectedCountry !== 'All' 
      ? events.filter(event => event.country === selectedCountry)
      : events;
    
    // Limit to 500 events for performance
    setMapEvents(filteredEvents.slice(0, 500));
  }, [events, selectedCountry]);

  // Calculate center point for initial map view
  const mapCenter = useMemo(() => {
    if (mapEvents.length === 0) return [51.505, -0.09]; // Default to London
    
    const avgLat = mapEvents.reduce((sum, e) => sum + e.coordinates[1], 0) / mapEvents.length;
    const avgLng = mapEvents.reduce((sum, e) => sum + e.coordinates[0], 0) / mapEvents.length;
    
    return [avgLat, avgLng];
  }, [mapEvents]);

  // Count junior vs regular parkruns
  const juniorCount = mapEvents.filter(e => e.junior).length;
  const regularCount = mapEvents.length - juniorCount;

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
        Parkrun Locations Map
      </h2>
      
      {/* Legend */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span>High (70-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
            <span>Medium (40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Low (0-39)</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            <span>⚪ Junior parkrun</span>
          </div>
        </div>
      </div>
      
      {/* Leaflet Map */}
      <div className="rounded-lg overflow-hidden border-2" style={{ height: '600px', borderColor: 'var(--color-border)' }}>
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mapEvents.map((event) => {
            const avgScore = getAverageScore(event);
            const color = getScoreColor(avgScore);
            const adjustedPos = adjustCoordinates(mapEvents, event);
            
            return (
              <React.Fragment key={event.uid}>
                {/* Marker */}
                <Marker
                  position={adjustedPos}
                  icon={createColoredIcon(color, event.junior)}
                >
                  {/* Hover Tooltip */}
                  <Tooltip direction="top" offset={[0, -35]} opacity={0.95}>
                    <div style={{ minWidth: '200px' }}>
                      <div className="font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>
                        {event.shortName}
                        {event.junior && ' 🧒'}
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        📍 {event.location}
                      </div>
                      {event.accessibility?.analyzed ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: '#e5e7eb' }}
                            >
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${avgScore}%`,
                                  backgroundColor: color
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold" style={{ color }}>
                              {avgScore}
                            </span>
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Accessibility Score
                          </div>
                        </>
                      ) : (
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          No accessibility data yet
                        </div>
                      )}
                    </div>
                  </Tooltip>
                  
                  {/* Click Popup */}
                  <Popup>
                    <div className="text-sm" style={{ minWidth: '220px' }}>
                      <h3 className="font-bold mb-1 text-lg" style={{ color: 'var(--color-primary)' }}>
                        {event.name}
                        {event.junior && ' 🧒'}
                      </h3>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-body)' }}>
                        📍 {event.location}
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        {event.country}
                        {event.junior && ' • Junior parkrun'}
                      </p>
                      
                      {event.accessibility?.analyzed && (
                        <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-light)' }}>
                          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>
                            Accessibility Scores:
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div>Racing: <span className="font-bold">{event.accessibility.scores.racing_chair}</span></div>
                            <div>Day Chair: <span className="font-bold">{event.accessibility.scores.day_chair}</span></div>
                            <div>Off-Road: <span className="font-bold">{event.accessibility.scores.off_road_chair}</span></div>
                            <div>Handbike: <span className="font-bold">{event.accessibility.scores.handbike}</span></div>
                          </div>
                        </div>
                      )}
                      
                      <a
                        href={`/parkrun/${event.slug}`}
                        className="block text-center px-3 py-2 rounded text-xs font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        View Full Details →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
          
          <MapBoundsHandler events={mapEvents} />
        </MapContainer>
      </div>
      
      {/* Map controls and stats */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h4 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
            📊 Coverage
          </h4>
          <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
            {mapEvents.length} of {events.length} events
          </p>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
            🏃 Regular
          </h4>
          <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
            {regularCount} parkruns
          </p>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>
            🧒 Junior
          </h4>
          <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
            {juniorCount} parkruns
          </p>
        </div>
        
        <div className="card p-4">
          <h4 className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
            � Tip
          </h4>
          <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
            Hover for quick scores
          </p>
        </div>
      </div>
    </div>
  );
};

// Wrap in React.memo to prevent unnecessary re-renders when parent updates
// Helper functions are already defined outside component for optimal performance
export default React.memo(MapView);