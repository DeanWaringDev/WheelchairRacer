import React, { useState } from 'react';

const Workouts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const workoutCategories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Racing Specific', 'Recovery'];

  return (
    <main className="bg-white min-h-screen p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Training & Workouts
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Personalized training plans and workout routines for wheelchair racers.
        </p>
        <p className="text-gray-500">
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      
      {/* Workout Plans Grid */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Training Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Workout Cards */}
          {[
            { name: '5K Training Plan', level: 'Beginner', duration: '8 weeks', focus: 'Endurance Building' },
            { name: 'Marathon Prep', level: 'Advanced', duration: '16 weeks', focus: 'Long Distance' },
            { name: 'Speed Development', level: 'Intermediate', duration: '6 weeks', focus: 'Sprint Training' },
            { name: 'Recovery Sessions', level: 'All Levels', duration: 'Ongoing', focus: 'Active Recovery' }
          ].map((workout, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">{workout.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  workout.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  workout.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  workout.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {workout.level}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{workout.focus}</p>
              <p className="text-gray-500 text-sm mb-4">{workout.duration} program</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                View Plan
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Quick Workouts */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">15-Minute Power Session</h3>
            <ul className="text-green-700 space-y-2 text-sm">
              <li>• 3 min warm-up (easy pace)</li>
              <li>• 4 x 2 min intervals (hard effort)</li>
              <li>• 1 min recovery between intervals</li>
              <li>• 3 min cool-down</li>
            </ul>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
              Start Workout
            </button>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Strength & Mobility</h3>
            <ul className="text-purple-700 space-y-2 text-sm">
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
    </main>
  );
};

export default Workouts;