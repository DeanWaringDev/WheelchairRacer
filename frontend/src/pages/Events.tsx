import React from 'react';

const Events: React.FC = () => {
  return (
    <main className="bg-white min-h-screen p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Wheelchair Racing Events
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Discover and participate in wheelchair racing events around the world.
        </p>
        <p className="text-gray-500">
          From local 5Ks to international marathons - find your next racing challenge.
        </p>
      </div>
      
      {/* Filter Section */}
      <section className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Locations</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>Australia</option>
              <option>Canada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Distances</option>
              <option>5K</option>
              <option>10K</option>
              <option>Half Marathon</option>
              <option>Marathon</option>
              <option>Ultra Marathon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Event Cards */}
          {[1, 2, 3].map((event) => (
            <div key={event} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">London Marathon 2026</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Open
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">London, United Kingdom</p>
              <p className="text-gray-500 text-sm mb-3">April 26, 2026 • 26.2 miles</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">£65 entry fee</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Coming Soon Notice */}
      <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🚧 Under Development</h3>
        <p className="text-yellow-700 mb-4">
          We're building a comprehensive event database with real-time registration links, 
          accessibility information, and community reviews.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Coming Features:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Live event calendar integration</li>
              <li>• Registration reminders</li>
              <li>• Training plan recommendations</li>
              <li>• Course accessibility ratings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Get Involved:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Submit event information</li>
              <li>• Share accessibility reviews</li>
              <li>• Connect with event organizers</li>
              <li>• Join our testing community</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Events;