import React from 'react';
import ParkrunBrowser from '../components/ParkrunBrowser';

const Parkrun: React.FC = () => {
  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
          Parkrun Accessibility Analysis
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-body)' }}>
          Discover wheelchair-accessible parkrun routes and explore detailed course information.
        </p>
        <p style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
          Browse {/* This will be updated when silver data is complete */} parkrun events worldwide with enhanced accessibility data.
        </p>
      </div>
      
      {/* Parkrun Browser Component */}
      <ParkrunBrowser />
      
      {/* Additional Information Section */}
      <section className="card-xl mt-12 p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>About Parkrun Accessibility</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>What We Analyze</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-body)' }}>
              <li>• Surface types and conditions</li>
              <li>• Route gradient and elevation changes</li>
              <li>• Accessible parking availability</li>
              <li>• Toilet and changing facilities</li>
              <li>• Path width and barriers</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>Coming Soon</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-body)' }}>
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