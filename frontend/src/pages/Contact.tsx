import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('send-contact-email', {
        body: formData,
      });

      if (functionError) {
        console.error('Function error details:', functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error('Resend API error:', data);
        throw new Error(data.details || data.error);
      }

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
          Contact Us
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-body)' }}>
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
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
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-secondary)' }}>Send us a Message</h2>
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
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="press">Press Inquiry</option>
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
                  placeholder="Please provide details about your inquiry..."
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
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>📧</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Email</p>
                  <a href="mailto:contact@wheelchairracer.com" className="text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                    contact@wheelchairracer.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>🌐</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Website</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>www.wheelchairracer.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1" style={{ color: 'var(--color-primary)' }}>📱</div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-secondary)' }}>Social Media</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Follow us for updates</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Response Times */}
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-accent)' }}>Response Times</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>General Inquiries</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>24-48 hours</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Technical Support</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>12-24 hours</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Press Inquiries</span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>24 hours</span>
              </div>
            </div>
          </div>
          
          {/* FAQ Link */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Need Quick Answers?</h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--color-text-body)' }}>
              Check out our frequently asked questions for immediate help with common topics.
            </p>
            <button className="btn-primary w-full py-2 px-4">
              View FAQ
            </button>
          </div>
          
          {/* Office Hours */}
          <div className="card p-6" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Support Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Monday - Friday</span>
                <span style={{ color: 'var(--color-primary)' }}>9:00 AM - 6:00 PM GMT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Saturday</span>
                <span style={{ color: 'var(--color-primary)' }}>10:00 AM - 4:00 PM GMT</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-body)' }}>Sunday</span>
                <span style={{ color: 'var(--color-primary)' }}>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Partnership Section */}
      <section className="mt-12 card-xl p-8" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
        <div className="text-center max-w-3xl mx-auto" style={{ color: 'var(--color-white)' }}>
          <h2 className="text-2xl font-bold mb-4">Interested in Partnering?</h2>
          <p className="mb-6">
            We're always looking to collaborate with organizations, coaches, and individuals 
            who share our passion for wheelchair racing and accessibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h4 className="font-semibold mb-2">Event Organizers</h4>
              <p className="text-sm" style={{ opacity: 0.9 }}>List your events on our platform</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h4 className="font-semibold mb-2">Equipment Manufacturers</h4>
              <p className="text-sm" style={{ opacity: 0.9 }}>Showcase your products to athletes</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              <h4 className="font-semibold mb-2">Coaches & Trainers</h4>
              <p className="text-sm" style={{ opacity: 0.9 }}>Share your expertise with our community</p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Contact;