import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';

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
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
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
  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Store form reference before async operations
    const form = e.currentTarget;
    
    // Get email from form
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    
    if (!email || !email.trim()) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
      return;
    }
    
    setNewsletterStatus('loading');
    setNewsletterMessage('');
    
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ 
          email: email.trim().toLowerCase(),
          source: 'footer_form'
        }]);
      
      if (error) {
        // Check if email already exists (unique constraint violation)
        if (error.code === '23505') {
          setNewsletterStatus('success');
          setNewsletterMessage('You\'re already subscribed! 🎉');
          form.reset();
        } else {
          throw error;
        }
      } else {
        setNewsletterStatus('success');
        setNewsletterMessage('Thanks for subscribing! 🎉');
        form.reset();
      }
    } catch (error) {
      logger.error('Newsletter signup error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Please try again.');
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setNewsletterStatus('idle');
      setNewsletterMessage('');
    }, 5000);
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

    logger.info('New Exercise Submitted:', exerciseData);
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
      <footer style={{ backgroundColor: 'var(--color-secondary)' }}>
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-white)' }}>Wheelchair Racer</h3>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Making parkrun accessible for everyone. Find wheelchair-friendly 
                routes, plan your training, and connect with the community.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Links */}
                <a
                  href="https://www.facebook.com/thewheelchairracer"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(255, 255, 255, 0.7)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/wheelchair.racer"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(255, 255, 255, 0.7)', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-white)' }}>Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/routes" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Find Routes
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/accessibility" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Accessibility Guide
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/community" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/training" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Training Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-white)' }}>Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/about" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/help" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/feedback" 
                    className="text-sm"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                  >
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-white)' }}>Stay Updated</h3>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Get accessibility updates and new route announcements.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input-field"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    color: 'var(--color-white)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    padding: '0.5rem'
                  }}
                  disabled={newsletterStatus === 'loading'}
                  required
                />
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={newsletterStatus === 'loading'}
                  style={{
                    opacity: newsletterStatus === 'loading' ? 0.7 : 1,
                    cursor: newsletterStatus === 'loading' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
                
                {/* Status Message */}
                {newsletterMessage && (
                  <p 
                    className="text-sm text-center"
                    style={{ 
                      color: newsletterStatus === 'success' ? '#4ade80' : '#f87171',
                      marginTop: '0.5rem'
                    }}
                  >
                    {newsletterMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              
              {/* Copyright */}
              <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                © {currentYear} Wheelchair Racer. All rights reserved.
              </div>

              {/* Legal Links */}
              <div className="flex space-x-6 text-sm">
                <Link 
                  to="/privacy" 
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms" 
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/cookies" 
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-white)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  Cookie Policy
                </Link>
              </div>

              {/* Custom Exercise Management Button */}
              <button
                onClick={toggleExerciseForm}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ 
                  backgroundColor: 'var(--color-accent)', 
                  color: 'var(--color-white)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = '';
                }}
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
