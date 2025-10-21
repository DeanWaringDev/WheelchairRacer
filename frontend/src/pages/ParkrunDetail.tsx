import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AccessibilityScores {
  racing_chair: number;
  day_chair: number;
  off_road_chair: number;
  handbike: number;
  frame_runner: number;
  walking_frame: number;
  crutches: number;
  walking_stick: number;
}

interface AccessibilityCategories {
  racing_chair: string;
  day_chair: string;
  off_road_chair: string;
  handbike: string;
  frame_runner: string;
  walking_frame: string;
  crutches: string;
  walking_stick: string;
}

interface KeywordImpact {
  keyword: string;
  category: string;
  impact: number;
}

interface DetailedScore {
  score: number;
  keyword_count: number;
  impacts: KeywordImpact[];
}

interface ParkrunEvent {
  uid: number;
  name: string;
  slug: string;
  coursePageUrl: string;
  description: string;
  summary?: string;  // AI-generated summary for display
  postcode?: string;
  scrapingStatus: string;
  accessibility: {
    analyzed: boolean;
    scores: AccessibilityScores;
    categories: AccessibilityCategories;
    keyword_matches: number;
    detailed_scores: {
      [key: string]: DetailedScore;
    };
  };
  // Merged from silver data
  location?: string;
  coordinates?: [number, number];
  country?: string;
  courseMapUrl?: string;  // Google Maps embed URL for route
}

const ParkrunDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<ParkrunEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    mobilityType: '',
    scoreAdjustment: '',
    suggestedScore: '',
    reason: '',
    additionalDetails: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Helper function to convert score to category
  const getCategoryFromScore = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'difficult';
    return 'not_suitable';
  };

  useEffect(() => {
    const loadEventData = async () => {
      try {
        // Load from Supabase
        const { data: parkrun, error } = await supabase
          .from('parkruns')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error || !parkrun) {
          setError('Parkrun event not found');
          return;
        }
        
        // Transform to expected format
        const transformedEvent: ParkrunEvent = {
          uid: parkrun.uid,
          name: parkrun.long_name,
          slug: parkrun.slug,
          location: parkrun.location,
          coordinates: parkrun.coordinates,
          country: parkrun.country,
          coursePageUrl: parkrun.course_page_url,
          courseMapUrl: parkrun.google_maps_url,
          postcode: parkrun.postcode,
          description: parkrun.descriptions?.cleaned || parkrun.descriptions?.full || '',
          summary: parkrun.descriptions?.summary || '',
          scrapingStatus: 'complete', // All gold data is complete
          accessibility: {
            analyzed: true,
            scores: {
              racing_chair: parkrun.accessibility.racing_chair.final_score,
              day_chair: parkrun.accessibility.day_chair.final_score,
              off_road_chair: parkrun.accessibility.off_road_chair.final_score,
              handbike: parkrun.accessibility.handbike.final_score,
              frame_runner: parkrun.accessibility.frame_runner.final_score,
              walking_frame: parkrun.accessibility.walking_frame.final_score,
              crutches: parkrun.accessibility.crutches.final_score,
              walking_stick: parkrun.accessibility.walking_stick.final_score
            },
            categories: {
              racing_chair: getCategoryFromScore(parkrun.accessibility.racing_chair.final_score),
              day_chair: getCategoryFromScore(parkrun.accessibility.day_chair.final_score),
              off_road_chair: getCategoryFromScore(parkrun.accessibility.off_road_chair.final_score),
              handbike: getCategoryFromScore(parkrun.accessibility.handbike.final_score),
              frame_runner: getCategoryFromScore(parkrun.accessibility.frame_runner.final_score),
              walking_frame: getCategoryFromScore(parkrun.accessibility.walking_frame.final_score),
              crutches: getCategoryFromScore(parkrun.accessibility.crutches.final_score),
              walking_stick: getCategoryFromScore(parkrun.accessibility.walking_stick.final_score)
            },
            keyword_matches: parkrun.keywords?.count || 0,
            detailed_scores: {
              racing_chair: {
                score: parkrun.accessibility.racing_chair.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.racing_chair.breakdown || []
              },
              day_chair: {
                score: parkrun.accessibility.day_chair.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.day_chair.breakdown || []
              },
              off_road_chair: {
                score: parkrun.accessibility.off_road_chair.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.off_road_chair.breakdown || []
              },
              handbike: {
                score: parkrun.accessibility.handbike.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.handbike.breakdown || []
              },
              frame_runner: {
                score: parkrun.accessibility.frame_runner.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.frame_runner.breakdown || []
              },
              walking_frame: {
                score: parkrun.accessibility.walking_frame.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.walking_frame.breakdown || []
              },
              crutches: {
                score: parkrun.accessibility.crutches.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.crutches.breakdown || []
              },
              walking_stick: {
                score: parkrun.accessibility.walking_stick.final_score,
                keyword_count: parkrun.keywords?.count || 0,
                impacts: parkrun.accessibility.walking_stick.breakdown || []
              }
            }
          }
        };
        
        setEvent(transformedEvent);
      } catch (err) {
        setError('Failed to load parkrun data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [slug]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    if (score >= 20) return 'bg-red-500';
    return 'bg-gray-800';
  };

  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    if (score >= 40) return 'text-orange-700';
    if (score >= 20) return 'text-red-700';
    return 'text-gray-700';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      'excellent': 'Excellent',
      'good': 'Good',
      'moderate': 'Moderate',
      'challenging': 'Challenging',
      'very_challenging': 'Very Challenging'
    };
    return labels[category] || category;
  };

  const formatMobilityType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFeedbackError('Please sign in to submit feedback');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const { error: submitError } = await supabase
        .from('parkrun_score_feedback')
        .insert([{
          parkrun_slug: slug,
          parkrun_name: event?.name,
          user_id: user.id,
          user_name: user.user_metadata?.username || 'Anonymous',
          mobility_type: feedbackForm.mobilityType,
          score_adjustment: feedbackForm.scoreAdjustment,
          suggested_score: feedbackForm.suggestedScore ? parseInt(feedbackForm.suggestedScore) : null,
          reason: feedbackForm.reason,
          additional_details: feedbackForm.additionalDetails,
          created_at: new Date().toISOString()
        }]);

      if (submitError) throw submitError;

      setFeedbackSuccess(true);
      setFeedbackForm({
        mobilityType: '',
        scoreAdjustment: '',
        suggestedScore: '',
        reason: '',
        additionalDetails: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setFeedbackError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Share functionality
  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = `${event?.name} - Parkrun Accessibility`;
    const text = `Check out the accessibility information for ${event?.name} parkrun!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
    }
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12" style={{ borderBottom: '2px solid var(--color-primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--color-text-body)' }}>Loading parkrun details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="page-container">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#C33' }}>Error</h1>
            <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>{error || 'Parkrun not found'}</p>
            <Link to="/parkrun" className="hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
              ← Back to Parkrun List
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Use Google Maps route embed if available, otherwise fallback to OpenStreetMap
  const mapUrl = event.courseMapUrl 
    ? event.courseMapUrl
    : event.coordinates 
      ? (() => {
          const [lng, lat] = event.coordinates;
          const offset = 0.015;
          const minLng = lng - offset;
          const maxLng = lng + offset;
          const minLat = lat - offset;
          const maxLat = lat + offset;
          return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;
        })()
      : 'https://www.openstreetmap.org/export/embed.html?bbox=-0.3,51.4,-0.1,51.5&layer=mapnik';

  const mobilityTypes = [
    'racing_chair',
    'day_chair',
    'off_road_chair',
    'handbike',
    'frame_runner',
    'walking_frame',
    'crutches',
    'walking_stick'
  ];

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/parkrun" className="mb-4 inline-block hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
          ← Back to Parkrun List
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-secondary)' }}>{event.name}</h1>
          {event.location && (
            <p className="text-lg" style={{ color: 'var(--color-text-body)' }}>{event.location}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            <section className="card overflow-hidden">
              <h2 className="text-2xl font-semibold p-6 pb-4" style={{ color: 'var(--color-secondary)' }}>Route Map</h2>
              <div className="aspect-video w-full">
                <iframe
                  src={mapUrl}
                  className="w-full h-full border-0"
                  title={`${event.name} route map`}
                />
              </div>
              <div className="p-4 text-sm" style={{ backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--color-text-body)' }}>
                <p>Interactive map showing the parkrun location. Zoom in/out for more detail.</p>
              </div>
            </section>

            {/* Course Description */}
            <section className="card p-6">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Course Overview</h2>
              <div className="prose max-w-none">
                {event.summary ? (
                  <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
                    {event.summary}
                  </p>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--color-text-body)' }}>
                    {event.description}
                  </p>
                )}
              </div>
              {event.summary && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <em>Note: This course overview is AI-generated from the official parkrun course description for easier readability.</em>
                  </p>
                </div>
              )}
            </section>

            {/* Official Course Page Link */}
            <section className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
              <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>Official Course Information</h2>
              <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>
                For the latest updates, event details, and volunteer information, visit the official parkrun course page.
              </p>
              <a
                href={event.coursePageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-block px-6 py-3"
              >
                View Official Course Page →
              </a>
            </section>
          </div>

          {/* Right column - Accessibility scores */}
          <div className="lg:col-span-1">
            {/* Disclaimer Notice */}
            <div className="mb-6 p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">ℹ️</span>
                <div>
                  <p className="font-semibold text-blue-800 text-sm mb-1">Accessibility Information Disclaimer</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Course accessibility scores are provided for informational purposes based on route analysis. 
                    Conditions may vary. Always check the official Parkrun event page and contact event organizers 
                    if you have specific accessibility questions. Wheelchair Racer is not affiliated with Parkrun Global Ltd. 
                    Parkrun® is a registered trademark of Parkrun Global Ltd.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card p-6 sticky top-4">
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Accessibility Scores</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-body)' }}>
                Scores are based on course description analysis using {event.accessibility.keyword_matches} keyword matches.
              </p>

              {/* Scores table */}
              <div className="space-y-3">
                {mobilityTypes.map(type => (
                  <div key={type} className="pb-3 last:border-b-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm" style={{ color: 'var(--color-secondary)' }}>
                        {formatMobilityType(type)}
                      </span>
                      <span className={`font-bold text-lg ${getScoreTextColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}>
                        {event.accessibility.scores[type as keyof AccessibilityScores]}/100
                      </span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      <div
                        className={`h-2 rounded-full ${getScoreColor(event.accessibility.scores[type as keyof AccessibilityScores])}`}
                        style={{ width: `${event.accessibility.scores[type as keyof AccessibilityScores]}%` }}
                      />
                    </div>
                    <div className="mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
                        {getCategoryLabel(event.accessibility.categories[type as keyof AccessibilityCategories])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Score legend */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>Score Guide</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>80-100: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FB3' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>60-79: Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>40-59: Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#C33' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>20-39: Challenging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
                    <span style={{ color: 'var(--color-text-body)' }}>0-19: Very Challenging</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Note:</strong> Scores are automatically generated from course descriptions. 
                  Always check the official course page and contact the event team for specific accessibility questions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Buttons Section */}
        <section className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>
              Share This Parkrun 🎉
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-body)' }}>
              Found a great route? Share it with others in the wheelchair racing community!
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#1877F2', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#25D366', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </section>

        {/* Score Feedback Form */}
        <section className="mt-8">
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>
                Help Us Improve! 🤝
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                Have you experienced this parkrun? Your real-world insights help us provide more accurate 
                accessibility information for everyone. Every piece of feedback makes a difference!
              </p>
            </div>

            {feedbackSuccess && (
              <div className="mb-6 p-4 rounded-lg border-l-4 bg-green-50 border-green-400">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-800">Thank you!</p>
                    <p className="text-sm text-green-700">
                      Your feedback has been submitted and will help improve our accessibility scores.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {feedbackError && (
              <div className="mb-6 p-4 rounded-lg border-l-4 bg-red-50 border-red-400">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700">{feedbackError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              {/* Mobility Type Selection */}
              <div>
                <label className="label">Which mobility aid are you providing feedback for? *</label>
                <select
                  value={feedbackForm.mobilityType}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, mobilityType: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select mobility type...</option>
                  <option value="racing_chair">Racing Chair</option>
                  <option value="day_chair">Day Chair</option>
                  <option value="off_road_chair">Off-Road Chair</option>
                  <option value="handbike">Handbike</option>
                  <option value="frame_runner">Frame Runner</option>
                  <option value="walking_frame">Walking Frame</option>
                  <option value="crutches">Crutches</option>
                  <option value="walking_stick">Walking Stick</option>
                </select>
              </div>

              {/* Score Adjustment */}
              <div>
                <label className="label">Is the current score accurate? *</label>
                <select
                  value={feedbackForm.scoreAdjustment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, scoreAdjustment: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select option...</option>
                  <option value="too_high">Score is too high (course is less accessible)</option>
                  <option value="too_low">Score is too low (course is more accessible)</option>
                  <option value="accurate">Score is accurate</option>
                </select>
              </div>

              {/* Suggested Score */}
              <div>
                <label className="label">What score would you suggest? (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={feedbackForm.suggestedScore}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestedScore: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 75"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="label">What's the main reason for your feedback? *</label>
                <select
                  value={feedbackForm.reason}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, reason: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select reason...</option>
                  <option value="surface_quality">Surface quality (smoother/rougher than expected)</option>
                  <option value="gradient">Gradient/hills (steeper/flatter than indicated)</option>
                  <option value="path_width">Path width (narrower/wider than expected)</option>
                  <option value="obstacles">Obstacles or barriers not mentioned</option>
                  <option value="facilities">Accessible facilities (parking, toilets)</option>
                  <option value="terrain_change">Terrain has changed since analysis</option>
                  <option value="weather_impact">Weather impact on accessibility</option>
                  <option value="crowd_density">Crowd density affects accessibility</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              {/* Additional Details */}
              <div>
                <label className="label">Tell us more (optional but super helpful!) 💬</label>
                <textarea
                  value={feedbackForm.additionalDetails}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, additionalDetails: e.target.value })}
                  rows={4}
                  className="input-field"
                  placeholder="Share any specific details about your experience - surface types, challenging sections, helpful facilities, or anything else that would help others..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingFeedback}
                className="btn-primary w-full py-3"
                style={{ opacity: submittingFeedback ? 0.5 : 1 }}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback 🚀'}
              </button>

              <p className="text-xs text-center" style={{ color: 'var(--color-text-light)' }}>
                {user ? 'Your feedback is anonymous but linked to your account for quality purposes.' : 'Please sign in to submit feedback.'}
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ParkrunDetail;
