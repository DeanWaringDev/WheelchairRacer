import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <main className="bg-white min-h-screen p-8">
      {/* Welcome section */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Wheelchair Racer
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Your hub for wheelchair racing resources. What is coming?
        </h2>
        <p className="text-gray-600 mb-4">
          Your go-to platform for wheelchair racing and Frame running resources, event information, and community support.
        </p>
        <p className="text-gray-600 mb-2">
          Stay tuned for upcoming features and improvements! We will be adding:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-4 ml-4">
          <li>Parkrun route accessibility analysis</li>
          <li>Event route mapping and reviews</li>
          <li>Personalized workout plans</li>
          <li>Community forums and blogs</li>
        </ul>
      </section>
      
      {/* Feature preview cards - Now with proper routing */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {/* Parkrun Analysis Feature - Link to Parkrun page */}
        <Link 
          to="/parkrun" 
          className="bg-blue-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-blue-200"
        >
          <h3 className="font-bold text-blue-800 mb-2">Parkrun Analysis</h3>
          <p className="text-blue-600">Find wheelchair-accessible parkrun routes</p>
        </Link>
        
        {/* Events Feature */}
        <Link 
          to="/events" 
          className="bg-green-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-green-200"
        >
          <h3 className="font-bold text-green-800 mb-2">Racing Events</h3>
          <p className="text-green-600">Discover upcoming wheelchair racing events</p>
        </Link>
        
        {/* Workouts Feature */}
        <Link 
          to="/workouts" 
          className="bg-purple-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-purple-200"
        >
          <h3 className="font-bold text-purple-800 mb-2">Training Plans</h3>
          <p className="text-purple-600">Personalized workout plans and training guides</p>
        </Link>
        
        {/* Blog Feature */}
        <Link 
          to="/blog" 
          className="bg-yellow-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-yellow-200"
        >
          <h3 className="font-bold text-yellow-800 mb-2">Racing Blog</h3>
          <p className="text-yellow-600">Latest news, tips, and racing insights</p>
        </Link>
        
        {/* Forum Feature */}
        <Link 
          to="/forum" 
          className="bg-red-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-red-200"
        >
          <h3 className="font-bold text-red-800 mb-2">Community Forum</h3>
          <p className="text-red-600">Connect with other wheelchair racers</p>
        </Link>
        
        {/* About Feature */}
        <Link 
          to="/about" 
          className="bg-indigo-100 p-6 rounded-lg hover:shadow-md transition-shadow block hover:bg-indigo-200"
        >
          <h3 className="font-bold text-indigo-800 mb-2">About Us</h3>
          <p className="text-indigo-600">Learn more about our mission and team</p>
        </Link>
      </section>
      
      {/* Call to Action Section */}
      <section className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="mb-6 text-lg">
          Join our community of wheelchair racers and discover new opportunities to push your limits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/parkrun" 
            className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors text-center"
          >
            Explore Parkrun Routes
          </Link>
          <Link 
            to="/events" 
            className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-purple-600 transition-colors text-center"
          >
            Find Racing Events
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;