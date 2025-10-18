import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  author_name?: string | null;
  created_at?: string;
};

const Home: React.FC = () => {
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setLatestPost(data);
        }
      } catch (err) {
        console.error("Error fetching latest post:", err);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchLatestPost();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "Unknown date";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "Unknown date";
    return parsed.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
      
      {/* Latest Blog Post Section */}
      {!loadingPost && latestPost && (
        <section className="mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 shadow-md border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Latest from the Blog</h2>
            <Link 
              to="/blog" 
              className="text-yellow-700 hover:text-yellow-900 font-semibold text-sm transition-colors"
            >
              View All Posts →
            </Link>
          </div>
          
          <article className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800 font-medium">
                {latestPost.category || "Uncategorized"}
              </span>
              <span>{formatDate(latestPost.created_at)}</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {latestPost.title}
            </h3>
            
            <p className="text-gray-700 mb-4 whitespace-pre-line">
              {truncateContent(latestPost.content)}
            </p>
            
            {/* Display images if available */}
            {latestPost.image_urls && latestPost.image_urls.length > 0 ? (
              <div className={`mb-4 grid gap-2 ${
                latestPost.image_urls.length === 1 ? 'grid-cols-1' :
                latestPost.image_urls.length === 2 ? 'grid-cols-2' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {latestPost.image_urls.slice(0, 3).map((url, index) => (
                  <img
                    key={index}
                    alt={`${latestPost.title} - Image ${index + 1}`}
                    className="h-32 w-full rounded-md object-cover"
                    src={url}
                  />
                ))}
              </div>
            ) : latestPost.image_url ? (
              <img
                alt={latestPost.title}
                className="mb-4 h-48 w-full rounded-md object-cover"
                src={latestPost.image_url}
              />
            ) : null}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {latestPost.author_name ? `By ${latestPost.author_name}` : "By Admin"}
              </span>
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors font-medium text-sm"
              >
                Read Full Post
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        </section>
      )}
      
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
      </div>
    </main>
  );
};

export default Home;