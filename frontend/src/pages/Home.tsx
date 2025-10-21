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
          .limit(1);

        if (!error && data && data.length > 0) {
          setLatestPost(data[0]);
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
    <main style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--color-secondary)' }}>
            Find Your Perfect
            <span style={{ color: 'var(--color-primary)' }}> Accessible</span> Parkrun
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: 'var(--color-text-body)' }}>
            Over 2,000 parkrun routes analyzed for accessibility across 8 mobility types
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/parkrun" 
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Explore Parkruns
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-white)', 
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Learn More
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 card">
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                2,000+
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                Parkrun Routes Analyzed
              </div>
            </div>
            <div className="p-6 card">
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                8
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                Mobility Types Supported
              </div>
            </div>
            <div className="p-6 card">
              <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                100%
              </div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-body)' }}>
                Free Forever
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--color-secondary)' }}>
            What Our Community Says
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="card p-8">
              <div className="mb-4">
                <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="mb-6" style={{ color: 'var(--color-text-body)' }}>
                "I went from knowing only two accessible parkruns to finding 6 within travelling distance."
              </p>
              <div className="font-semibold" style={{ color: 'var(--color-secondary)' }}>
                Dean
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                Racing Chair User
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card p-8">
              <div className="mb-4">
                <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="mb-6" style={{ color: 'var(--color-text-body)' }}>
                "I love being able to see more detailed information on chair types. I like a challenging parkrun but it's nice when I know what to expect."
              </p>
              <div className="font-semibold" style={{ color: 'var(--color-secondary)' }}>
                Sarah M.
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                Day Chair User
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card p-8">
              <div className="mb-4">
                <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="mb-6" style={{ color: 'var(--color-text-body)' }}>
                "Finally, a platform that understands accessibility isn't one-size-fits-all. The detailed scoring for different mobility types is game-changing."
              </p>
              <div className="font-semibold" style={{ color: 'var(--color-secondary)' }}>
                Marcus T.
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                Handbike Athlete
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Post Section */}
      {!loadingPost && latestPost && (
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-secondary)' }}>Latest from the Blog</h2>
              <Link 
                to="/blog" 
                className="font-semibold text-sm transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                View All Posts →
              </Link>
            </div>
            
            <article className="card p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <span className="rounded-full px-3 py-1 font-medium" style={{ 
                backgroundColor: 'rgba(245, 124, 0, 0.1)', 
                color: 'var(--color-primary)' 
              }}>
                {latestPost.category || "Uncategorized"}
              </span>
              <span style={{ color: 'var(--color-text-body)' }}>{formatDate(latestPost.created_at)}</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
              {latestPost.title}
            </h3>
            
            <p className="mb-4 whitespace-pre-line" style={{ color: 'var(--color-text-body)' }}>
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
            
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                {latestPost.author_name ? `By ${latestPost.author_name}` : "By Admin"}
              </span>
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm hover:shadow-md"
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Read Full Post
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
          </div>
        </section>
      )}
      
      {/* Feature preview cards */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-secondary)' }}>
            Explore Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Parkrun Analysis Feature */}
            <Link 
              to="/parkrun" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 124, 0, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>Parkrun Analysis</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Find wheelchair-accessible parkrun routes with detailed accessibility scores</p>
            </Link>
            
            {/* Events Feature */}
            <Link 
              to="/events" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 137, 123, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>Racing Events</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Discover upcoming wheelchair racing events near you</p>
            </Link>
            
            {/* Workouts Feature */}
            <Link 
              to="/workouts" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 124, 0, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>Training Plans</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Personalized workout plans and training guides</p>
            </Link>
            
            {/* Blog Feature */}
            <Link 
              to="/blog" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 137, 123, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>Racing Blog</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Latest news, tips, and racing insights</p>
            </Link>
            
            {/* Forum Feature */}
            <Link 
              to="/forum" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 124, 0, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>Community Forum</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Connect with other wheelchair racers</p>
            </Link>
            
            {/* About Feature */}
            <Link 
              to="/about" 
              className="card p-8 block transition-all"
            >
              <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 137, 123, 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-secondary)' }}>About Us</h3>
              <p style={{ color: 'var(--color-text-body)' }}>Learn more about our mission and team</p>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center card p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl mb-8" style={{ color: 'var(--color-text-body)' }}>
            Join our community of wheelchair racers and discover new opportunities to push your limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/parkrun" 
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Explore Parkrun Routes
            </Link>
            <Link 
              to="/events" 
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--color-white)', 
                color: 'var(--color-secondary)',
                border: '2px solid var(--color-secondary)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              Find Racing Events
            </Link>
          </div>
        </div>
      </section>

      {/* Sign Up CTA Section */}
      <section className="py-16 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 md:p-12 text-center" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
              Ready to Join the Community? 🎉
            </h2>
            <p className="text-lg md:text-xl mb-6" style={{ color: 'var(--color-text-body)' }}>
              Create your free account to unlock all features, like and comment on posts, 
              share your feedback, and connect with other wheelchair athletes!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                <span className="text-3xl mb-2 block">�</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-secondary)' }}>
                  Like posts, leave comments, and share your training experiences
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                <span className="text-3xl mb-2 block">�</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-secondary)' }}>
                  Provide feedback on parkrun accessibility scores
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-light-bg)' }}>
                <span className="text-3xl mb-2 block">🤝</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-secondary)' }}>
                  Connect with the wheelchair racing community
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signin" 
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-white)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Create Free Account
              </Link>
              <Link 
                to="/signin" 
                className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--color-white)', 
                  color: 'var(--color-secondary)',
                  border: '2px solid var(--color-secondary)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                Already Have an Account?
              </Link>
            </div>
            <p className="text-sm mt-6" style={{ color: 'var(--color-text-light)' }}>
              No credit card required • Takes less than 30 seconds
            </p>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Home;