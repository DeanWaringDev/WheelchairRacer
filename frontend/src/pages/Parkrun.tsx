import React from 'react';
import ParkrunBrowser from '../components/ParkrunBrowser';

const Parkrun: React.FC = () => {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Parkrun Accessibility Analysis
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Discover wheelchair-accessible parkrun routes and explore detailed course information.
        </p>
        <p className="text-gray-500">
          Browse {/* This will be updated when silver data is complete */} parkrun events worldwide with enhanced accessibility data.
        </p>
      </div>
      
      {/* Parkrun Browser Component */}
      <ParkrunBrowser />
      
      {/* Additional Information Section */}
      <section className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">About Parkrun Accessibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">What We Analyze</h3>
            <ul className="text-blue-600 space-y-1 text-sm">
              <li>• Surface types and conditions</li>
              <li>• Route gradient and elevation changes</li>
              <li>• Accessible parking availability</li>
              <li>• Toilet and changing facilities</li>
              <li>• Path width and barriers</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Coming Soon</h3>
            <ul className="text-blue-600 space-y-1 text-sm">
              <li>• Community accessibility ratings</li>
              <li>• Photo documentation of routes</li>
              <li>• Weather impact assessments</li>
              <li>• Equipment recommendations</li>
              <li>• Local accessibility contacts</li>
            </ul>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Parkrun;