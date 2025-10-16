import React, { useState } from 'react';

const Workouts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    exerciseName: '',
    equipment: [] as string[],
    description: '',
    gifFile: null as File | null,
    primaryMuscles: [] as string[],
    secondaryMuscles: [] as string[],
    exerciseTypes: [] as string[],
    mobilityRequirements: [] as string[],
    impact: '',
    difficulty: '',
    modifications: ''
  });

  const workoutCategories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Racing Specific', 'Recovery'];

  // Exercise form options
  const equipmentOptions = [
    'None', 'Barbell', 'Dumbbells', 'Kettlebell', 'Resistance Bands', 
    'Bench', 'Pull Up Bar', 'Exercise Ball', 'Chair', 'Cable Pull Down',
    'Yoga Mat', 'Foam Roller', 'Suspension Trainer (TRX)', 'Medicine Ball',
    'Stability Ball', 'Resistance Loops', 'Ankle Weights', 'Theraband'
  ];

  const muscleGroups = [
    'Shoulders', 'Chest', 'Back', 'Biceps', 'Triceps', 'Forearms',
    'Core/Abs', 'Obliques', 'Lower Back', 'Glutes', 'Quadriceps', 
    'Hamstrings', 'Calves', 'Hip Flexors', 'Wrists', 'Neck'
  ];

  const exerciseTypeOptions = [
    'Range of Motion', 'Strength', 'Cardio', 'Flexibility', 'Balance',
    'Coordination', 'Endurance', 'Power', 'Functional Movement', 'Rehabilitation'
  ];

  const mobilityRequirements = [
    'Requires Standing', 'Requires Balance', 'Requires Both Legs', 
    'Requires Both Arms', 'Single Leg', 'Single Arm', 'Seated Only',
    'Wheelchair Accessible', 'Requires Transfer', 'Floor Exercise',
    'Requires Fine Motor Control', 'Requires Grip Strength'
  ];

  const impactLevels = ['Low', 'Medium', 'High'];
  const difficultyLevels = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];

  // Form handlers
  const handleCheckboxChange = (field: 'equipment' | 'primaryMuscles' | 'secondaryMuscles' | 'exerciseTypes' | 'mobilityRequirements', value: string) => {
    setExerciseForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field: 'exerciseName' | 'description' | 'impact' | 'difficulty' | 'modifications', value: string) => {
    setExerciseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (file: File | null) => {
    setExerciseForm(prev => ({
      ...prev,
      gifFile: file
    }));
  };

  const handleSubmitExercise = () => {
    // Generate exercise ID (in a real app, this would be handled by the backend)
    const exerciseId = `EX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const exerciseData = {
      exerciseId,
      ...exerciseForm,
      createdAt: new Date().toISOString()
    };

    console.log('New Exercise Submitted:', exerciseData);
    alert('Exercise submitted successfully! (Check console for details)');
    
    // Reset form and close modal
    setExerciseForm({
      exerciseName: '',
      equipment: [],
      description: '',
      gifFile: null,
      primaryMuscles: [],
      secondaryMuscles: [],
      exerciseTypes: [],
      mobilityRequirements: [],
      impact: '',
      difficulty: '',
      modifications: ''
    });
    setShowAddExerciseModal(false);
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
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
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="mt-4 sm:mt-0 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Exercise
        </button>
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
      </div>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Exercise</h2>
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Exercise Form */}
              <form className="space-y-6">
                {/* Exercise Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.exerciseName}
                    onChange={(e) => handleInputChange('exerciseName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter exercise name"
                    required
                  />
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Needed
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <label key={equipment} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exerciseForm.equipment.includes(equipment)}
                          onChange={() => handleCheckboxChange('equipment', equipment)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={exerciseForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Describe how to perform the exercise, including form cues and safety tips"
                    required
                  />
                </div>

                {/* GIF Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Demo (GIF)
                  </label>
                  <input
                    type="file"
                    accept=".gif"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a GIF demonstrating proper exercise form</p>
                </div>

                {/* Primary Muscles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Muscles Worked *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {muscleGroups.map((muscle) => (
                      <label key={muscle} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exerciseForm.primaryMuscles.includes(muscle)}
                          onChange={() => handleCheckboxChange('primaryMuscles', muscle)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{muscle}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Secondary Muscles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Muscles Worked
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {muscleGroups.map((muscle) => (
                      <label key={muscle} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exerciseForm.secondaryMuscles.includes(muscle)}
                          onChange={() => handleCheckboxChange('secondaryMuscles', muscle)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{muscle}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Exercise Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {exerciseTypeOptions.map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exerciseForm.exerciseTypes.includes(type)}
                          onChange={() => handleCheckboxChange('exerciseTypes', type)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobility Details Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobility & Accessibility Details</h3>
                  
                  {/* Mobility Requirements */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobility Requirements
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mobilityRequirements.map((requirement) => (
                        <label key={requirement} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={exerciseForm.mobilityRequirements.includes(requirement)}
                            onChange={() => handleCheckboxChange('mobilityRequirements', requirement)}
                            className="rounded text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Impact Level */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impact Level *
                    </label>
                    <div className="flex gap-4">
                      {impactLevels.map((level) => (
                        <label key={level} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="impact"
                            value={level}
                            checked={exerciseForm.impact === level}
                            onChange={(e) => handleInputChange('impact', e.target.value)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {difficultyLevels.map((level) => (
                        <label key={level} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="difficulty"
                            value={level}
                            checked={exerciseForm.difficulty === level}
                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Modifications/Adaptations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modifications & Adaptations
                    </label>
                    <textarea
                      value={exerciseForm.modifications}
                      onChange={(e) => handleInputChange('modifications', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Describe how this exercise can be adapted for different abilities, equipment alternatives, easier/harder variations, etc."
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddExerciseModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitExercise}
                    className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-semibold"
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Workouts;