import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                  <option value="press">Press Inquiry</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your inquiry"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-1">📧</div>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600 text-sm">hello@wheelchairracer.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-1">🌐</div>
                <div>
                  <p className="font-medium text-gray-800">Website</p>
                  <p className="text-gray-600 text-sm">www.wheelchairracer.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-1">📱</div>
                <div>
                  <p className="font-medium text-gray-800">Social Media</p>
                  <p className="text-gray-600 text-sm">Follow us for updates</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Response Times */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Response Times</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">General Inquiries</span>
                <span className="text-green-600 font-medium">24-48 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Technical Support</span>
                <span className="text-green-600 font-medium">12-24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Press Inquiries</span>
                <span className="text-green-600 font-medium">24 hours</span>
              </div>
            </div>
          </div>
          
          {/* FAQ Link */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Need Quick Answers?</h3>
            <p className="text-blue-700 mb-4 text-sm">
              Check out our frequently asked questions for immediate help with common topics.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors">
              View FAQ
            </button>
          </div>
          
          {/* Office Hours */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Support Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Monday - Friday</span>
                <span className="text-purple-600">9:00 AM - 6:00 PM GMT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Saturday</span>
                <span className="text-purple-600">10:00 AM - 4:00 PM GMT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Sunday</span>
                <span className="text-purple-600">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Partnership Section */}
      <section className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Interested in Partnering?</h2>
          <p className="mb-6">
            We're always looking to collaborate with organizations, coaches, and individuals 
            who share our passion for wheelchair racing and accessibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Event Organizers</h4>
              <p className="text-sm opacity-90">List your events on our platform</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Equipment Manufacturers</h4>
              <p className="text-sm opacity-90">Showcase your products to athletes</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Coaches & Trainers</h4>
              <p className="text-sm opacity-90">Share your expertise with our community</p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Contact;