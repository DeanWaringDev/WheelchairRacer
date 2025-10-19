import React, { useState } from 'react';

const Workouts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const workoutCategories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Racing Specific', 'Recovery'];

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
          Training & Workouts
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-body)' }}>
          Personalized training plans and workout routines for wheelchair racers.
        </p>
        <p style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
          From beginner-friendly sessions to elite racing preparation.
        </p>
      </div>
      
      {/* Category Filter */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2">
          {workoutCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'btn-primary' : 'btn-secondary'}
              style={selectedCategory === category ? {} : { fontSize: '0.875rem' }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      
      {/* Workout Plans Grid */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-secondary)' }}>Training Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Workout Cards */}
          {[
            { name: '5K Training Plan', level: 'Beginner', duration: '8 weeks', focus: 'Endurance Building', color: 'var(--color-accent)' },
            { name: 'Marathon Prep', level: 'Advanced', duration: '16 weeks', focus: 'Long Distance', color: '#C33' },
            { name: 'Speed Development', level: 'Intermediate', duration: '6 weeks', focus: 'Sprint Training', color: '#FB3' },
            { name: 'Recovery Sessions', level: 'All Levels', duration: 'Ongoing', focus: 'Active Recovery', color: 'var(--color-primary)' }
          ].map((workout, index) => (
            <div key={index} className="card p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--color-secondary)' }}>{workout.name}</h3>
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: `${workout.color}20`, color: workout.color }}
                >
                  {workout.level}
                </span>
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-body)' }}>{workout.focus}</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>{workout.duration} program</p>
              <button className="btn-primary w-full text-sm">
                View Plan
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Quick Workouts */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-secondary)' }}>Quick Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>15-Minute Power Session</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
              <li>• 3 min warm-up (easy pace)</li>
              <li>• 4 x 2 min intervals (hard effort)</li>
              <li>• 1 min recovery between intervals</li>
              <li>• 3 min cool-down</li>
            </ul>
            <button className="btn-accent mt-4 text-sm px-4 py-2">
              Start Workout
            </button>
          </div>
          
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>Strength & Mobility</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
              <li>• Shoulder strengthening exercises</li>
              <li>• Core stability work</li>
              <li>• Wrist and forearm stretches</li>
              <li>• Upper body mobility routine</li>
            </ul>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors">
              Start Routine
            </button>
          </div>
        </div>
      </section>
      
      {/* Coming Soon Notice */}
      <section className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🏃‍♂️ Personalized Training Coming Soon</h3>
        <p className="text-blue-700 mb-4">
          We're developing AI-powered training plans that adapt to your goals, fitness level, and racing schedule.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Planned Features:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Personalized workout generation</li>
              <li>• Progress tracking and analytics</li>
              <li>• Integration with fitness devices</li>
              <li>• Coach recommendations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Get Ready:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Join our beta testing program</li>
              <li>• Share your training preferences</li>
              <li>• Connect with training partners</li>
              <li>• Access expert coaching tips</li>
            </ul>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Workouts;