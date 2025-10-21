import React, { useState } from 'react';
import ParkrunBrowser from '../components/ParkrunBrowser';

const Parkrun: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    // Check if user has dismissed the disclaimer before
    const dismissed = localStorage.getItem('parkrun-disclaimer-dismissed');
    return dismissed !== 'true';
  });

  const handleDismissDisclaimer = () => {
    localStorage.setItem('parkrun-disclaimer-dismissed', 'true');
    setShowDisclaimer(false);
  };

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Disclaimer Alert */}
      {showDisclaimer && (
        <div className="mb-6 p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400 relative">
          <button
            onClick={handleDismissDisclaimer}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-blue-100 transition-colors"
            aria-label="Dismiss disclaimer"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-start gap-3 pr-8">
            <span className="text-2xl flex-shrink-0">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-800 mb-1">Accessibility Information Disclaimer</p>
              <p className="text-sm text-blue-700">
                Course accessibility scores are provided for informational purposes based on route analysis. 
                Conditions may vary. Always check the official Parkrun event page and contact event organizers 
                if you have specific accessibility questions. Wheelchair Racer is not affiliated with Parkrun Global Ltd. 
                Parkrun® is a registered trademark of Parkrun Global Ltd.
              </p>
            </div>
          </div>
        </div>
      )}
      
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