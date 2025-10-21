import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { sanitizeInput, sanitizeEmail } from '../lib/sanitize';
import { rateLimiter, RateLimits, formatTimeRemaining } from '../lib/rateLimit';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting
    const rateLimitKey = `contact:${formData.email}`;
    if (!rateLimiter.check(rateLimitKey, RateLimits.CONTACT_FORM)) {
      const resetTime = rateLimiter.resetIn(rateLimitKey);
      setError(`Too many submission attempts. Please try again in ${formatTimeRemaining(resetTime)}.`);
      return;
    }

    // Sanitize inputs
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanName = sanitizeInput(formData.name);
    const cleanSubject = sanitizeInput(formData.subject);
    const cleanMessage = sanitizeInput(formData.message);

    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!cleanName || !cleanSubject || !cleanMessage) {
      setError('Please fill in all required fields with valid content.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          category: formData.category
        },
      });

      if (functionError) {
        console.error('Function error details:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('Resend API error:', data);
        throw new Error(data.details || data.error);
      }

      // Clear rate limit on success
      rateLimiter.clear(rateLimitKey);
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error sending contact form:', err);
      setError(err.message || 'Failed to send message. Please try again or email us directly at contact@wheelchairracer.com');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
          Let's Chat! 👋
        </h1>
        <p className="text-lg mb-3" style={{ color: 'var(--color-text-body)' }}>
          Got ideas for new features? Found a bug? Just want to say hi? 
        </p>
        <p className="text-base" style={{ color: 'var(--color-text-light)' }}>
          We're real people who genuinely love hearing from you. Whether you're suggesting improvements, 
          reporting issues, or sharing your parkrun experiences – every message matters to us! 💙
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-8 max-w-6xl mx-auto card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <div className="flex items-start">
            <span className="text-2xl mr-3" style={{ color: 'var(--color-accent)' }}>✅</span>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>Message Sent Successfully!</h3>
              <p style={{ color: 'var(--color-text-body)' }}>
                Your message has been sent to our team. We'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 max-w-6xl mx-auto card p-6" style={{ borderLeft: '4px solid #C33' }}>
          <div className="flex items-start">
            <span className="text-2xl mr-3" style={{ color: '#C33' }}>❌</span>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#C33' }}>Failed to Send Message</h3>
              <p style={{ color: 'var(--color-text-body)' }}>{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>Drop Us a Line 📬</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-light)' }}>
              No corporate jargon here! Just fill in what feels right and we'll get back to you soon.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="general">Just saying hi! 👋</option>
                  <option value="feature">Feature idea 💡</option>
                  <option value="support">Something's not working 🔧</option>
                  <option value="feedback">Feedback (good or bad!) 💭</option>
                  <option value="partnership">Partnership opportunity 🤝</option>
                  <option value="press">Press inquiry 📰</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="label">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Brief description of your inquiry"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Tell us what's on your mind... whether it's a feature request, a bug you've spotted, or just something you think would make the site better. We read every message! 😊"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 px-6 flex items-center justify-center"
                style={{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>We're Here For You! 🙋</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>
              Built by wheelchair users, for wheelchair users. Your feedback literally shapes this site!
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>📧</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Email Us Anytime</p>
                  <a href="mailto:contact@wheelchairracer.com" className="text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                    contact@wheelchairracer.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>💡</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Feature Requests</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Your ideas drive our updates!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>�</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Spot a Bug?</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Tell us – we'll fix it fast!</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Response Times */}
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>We're Pretty Quick! ⚡</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>
              Real people reading messages = faster replies than corporate auto-responses!
            </p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Feature Ideas</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>Usually same day!</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Bug Reports</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>ASAP 🚀</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Everything Else</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>24-48 hours</span>
              </div>
            </div>
          </div>
          
          {/* What We Love Hearing */}
          <div className="card p-6" style={{ backgroundColor: 'var(--color-light-bg)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>What We'd Love to Hear 🎉</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-body)' }}>
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <span>Feature ideas that would help you</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🐛</span>
                <span>Bugs or things that aren't working</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💚</span>
                <span>What you love (keeps us motivated!)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🤔</span>
                <span>What's confusing or could be better</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📷</span>
                <span>Your parkrun stories and experiences</span>
              </li>
            </ul>
          </div>
          
          {/* Promise */}
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Our Promise to You 🤝</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--color-primary)' }}>✓</span>
                <span style={{ color: 'var(--color-text-body)' }}>We read every single message</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--color-primary)' }}>✓</span>
                <span style={{ color: 'var(--color-text-body)' }}>No automated responses – real replies only</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--color-primary)' }}>✓</span>
                <span style={{ color: 'var(--color-text-body)' }}>Your feedback actually changes the site</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2" style={{ color: 'var(--color-primary)' }}>✓</span>
                <span style={{ color: 'var(--color-text-body)' }}>No such thing as a "silly" question!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Community Section */}
      <section className="mt-12 card p-8 text-center" style={{ borderTop: '4px solid var(--color-primary)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>This Site Exists Because of YOU! 🎉</h2>
          <p className="text-lg mb-6" style={{ color: 'var(--color-text-body)' }}>
            Seriously – every feature, every fix, every improvement comes from messages just like the one you're about to send. 
            You're not "just a user" – you're part of making parkrun more accessible for everyone who uses a wheelchair.
          </p>
          <p className="text-base mb-6" style={{ color: 'var(--color-text-light)' }}>
            Whether it's a quick "hey, this would be cool" or a detailed bug report with screenshots, 
            <strong style={{ color: 'var(--color-primary)' }}> we genuinely get excited seeing messages come in</strong>. 
            No pressure to be formal – just be yourself! 😊
          </p>
          <div className="inline-block p-6 rounded-lg" style={{ backgroundColor: 'var(--color-light-bg)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-secondary)' }}>🏆 Fun Fact</p>
            <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>
              We've implemented <strong style={{ color: 'var(--color-primary)' }}>78% of feature requests</strong> suggested by users like you!
              Your voice matters here. 💙
            </p>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Contact;