import React from 'react';

const Events: React.FC = () => {
  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
          Wheelchair Racing Events
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-body)' }}>
          Discover and participate in wheelchair racing events around the world.
        </p>
        <p style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
          From local 5Ks to international marathons - find your next racing challenge.
        </p>
      </div>
      
      {/* Filter Section */}
      <section className="card mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Find Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Location</label>
            <select className="input-field">
              <option>All Locations</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Australia</option>
              <option>Canada</option>
            </select>
          </div>
          <div>
            <label className="label">Distance</label>
            <select className="input-field">
              <option>All Distances</option>
              <option>5K</option>
              <option>10K</option>
              <option>Half Marathon</option>
              <option>Marathon</option>
              <option>Ultra Marathon</option>
            </select>
          </div>
          <div>
            <label className="label">Event Type</label>
            <select className="input-field">
              <option>All Types</option>
              <option>Road Race</option>
              <option>Track Event</option>
              <option>Cross Country</option>
              <option>Triathlon</option>
            </select>
          </div>
        </div>
      </section>
      
      {/* Featured Events */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-secondary)' }}>Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Event Cards */}
          {[1, 2, 3].map((event) => (
            <div key={event} className="card p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--color-secondary)' }}>London Marathon 2026</h3>
                <span 
                  className="text-xs px-2 py-1 rounded" 
                  style={{ backgroundColor: 'rgba(0, 137, 123, 0.1)', color: 'var(--color-accent)' }}
                >
                  Open
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-body)' }}>London, United Kingdom</p>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>April 26, 2026 • 26.2 miles</p>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-text-body)', opacity: 0.7 }}>£65 entry fee</span>
                <button className="btn-primary text-sm px-4 py-2">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Coming Soon Notice */}
      <section className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>🚧 Under Development</h3>
        <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>
          We're building a comprehensive event database with real-time registration links, 
          accessibility information, and community reviews.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-primary)' }}>Coming Features:</h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-body)' }}>
              <li>• Live event calendar integration</li>
              <li>• Registration reminders</li>
              <li>• Training plan recommendations</li>
              <li>• Course accessibility ratings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-accent)' }}>Get Involved:</h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-body)' }}>
              <li>• Submit event information</li>
              <li>• Share accessibility reviews</li>
              <li>• Connect with event organizers</li>
              <li>• Join our testing community</li>
            </ul>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Events;