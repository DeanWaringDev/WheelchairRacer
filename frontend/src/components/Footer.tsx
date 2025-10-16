import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * 
 * A comprehensive footer containing standard footer elements plus a custom
 * exercise management feature for personal use.
 * 
 * Features:
 * - Standard footer links (About, Privacy, Terms, etc.)
 * - Social media links
 * - Newsletter signup
 * - Copyright information
 * - Custom + symbol linking to exercise form for database management
 * 
 * @returns {JSX.Element} Footer component
 */
const Footer: React.FC = () => {
  const [isExerciseFormOpen, setIsExerciseFormOpen] = useState(false);
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

  const currentYear = new Date().getFullYear();

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

  /**
   * Toggle the exercise form modal
   */
  const toggleExerciseForm = () => {
    setIsExerciseFormOpen(!isExerciseFormOpen);
  };

  /**
   * Handle newsletter signup submission
   */
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup submitted');
  };

  // Exercise form handlers
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
    setIsExerciseFormOpen(false);
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Wheelchair Racer</h3>
              <p className="text-gray-400 text-sm">
                Making parkrun accessible for everyone. Find wheelchair-friendly 
                routes, plan your training, and connect with the community.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Links */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-2.458 0-4.467-2.009-4.467-4.467s2.009-4.467 4.467-4.467c2.458 0 4.467 2.009 4.467 4.467s-2.009 4.467-4.467 4.467zm7.119 0c-2.458 0-4.467-2.009-4.467-4.467s2.009-4.467 4.467-4.467c2.458 0 4.467 2.009 4.467 4.467s-2.009 4.467-4.467 4.467z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/routes" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Find Routes
                  </Link>
                </li>
                <li>
                  <Link to="/accessibility" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Accessibility Guide
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/training" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Training Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get accessibility updates and new route announcements.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              {/* Copyright */}
              <div className="text-gray-400 text-sm">
                © {currentYear} Wheelchair Racer. All rights reserved.
              </div>

              {/* Legal Links */}
              <div className="flex space-x-6 text-sm">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </div>

              {/* Custom Exercise Management Button */}
              <button
                onClick={toggleExerciseForm}
                className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="Add Exercise"
                title="Add Exercise to Database"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Comprehensive Exercise Form Modal */}
      {isExerciseFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Exercise</h2>
                <button
                  onClick={() => setIsExerciseFormOpen(false)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          className="rounded text-green-500 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          className="rounded text-green-500 focus:ring-green-500"
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
                          className="rounded text-green-500 focus:ring-green-500"
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
                          className="rounded text-green-500 focus:ring-green-500"
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
                            className="rounded text-green-500 focus:ring-green-500"
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
                            className="text-green-500 focus:ring-green-500"
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
                            className="text-green-500 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe how this exercise can be adapted for different abilities, equipment alternatives, easier/harder variations, etc."
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsExerciseFormOpen(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitExercise}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold"
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
