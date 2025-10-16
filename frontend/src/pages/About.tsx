import React from 'react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Thompson",
      role: "Founder & CEO",
      bio: "Paralympic medalist and advocate for accessible sports. 10+ years in wheelchair racing.",
      image: "👩‍💼"
    },
    {
      name: "Marcus Chen",
      role: "Head of Technology",
      bio: "Former software engineer at major tech companies. Passionate about accessibility tech.",
      image: "👨‍💻"
    },
    {
      name: "Dr. Emma Rodriguez",
      role: "Sports Scientist",
      bio: "PhD in Sports Medicine. Specializes in wheelchair racing performance optimization.",
      image: "👩‍🔬"
    }
  ];

  const milestones = [
    { year: "2023", event: "Platform concept developed" },
    { year: "2024", event: "Beta testing with 50 athletes" },
    { year: "2025", event: "Public launch and community growth" },
    { year: "2026", event: "Mobile app and AI coaching planned" }
  ];

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            About Wheelchair Racer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering wheelchair racers worldwide with accessible resources, 
            community connections, and data-driven insights.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              To create the world's most comprehensive platform for wheelchair racing, 
              providing athletes with the tools, information, and community support 
              they need to achieve their racing goals and push the boundaries of what's possible.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Our Story</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-600 mb-4">
              Wheelchair Racer was born from a simple observation: wheelchair racing 
              was growing rapidly, but athletes lacked centralized resources for 
              training, event discovery, and community connection.
            </p>
            <p className="text-gray-600 mb-4">
              Founded by Paralympic athletes and technology professionals, our platform 
              combines deep sport expertise with cutting-edge technology to serve 
              the wheelchair racing community.
            </p>
            <p className="text-gray-600">
              From accessibility mapping to AI-powered training plans, we're building 
              the future of wheelchair racing support, one feature at a time.
            </p>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">By the Numbers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2,747</div>
                <div className="text-sm text-gray-600">Parkrun Events Mapped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1,200+</div>
                <div className="text-sm text-gray-600">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">150+</div>
                <div className="text-sm text-gray-600">Training Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">50+</div>
                <div className="text-sm text-gray-600">Countries Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center bg-gray-50 p-6 rounded-lg">
              <div className="text-4xl mb-4">{member.image}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Our Journey</h2>
        <div className="max-w-3xl mx-auto">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center mb-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold mr-6">
                {milestone.year}
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium">{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Values */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-blue-800 mb-2">Excellence</h3>
            <p className="text-blue-600 text-sm">Pursuing the highest standards in everything we build</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-green-800 mb-2">Community</h3>
            <p className="text-green-600 text-sm">Building connections that empower athletes worldwide</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">♿</div>
            <h3 className="font-semibold text-purple-800 mb-2">Accessibility</h3>
            <p className="text-purple-600 text-sm">Ensuring our platform works for everyone</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-yellow-800 mb-2">Innovation</h3>
            <p className="text-yellow-600 text-sm">Pioneering new solutions for athlete development</p>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="bg-gray-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Get In Touch</h2>
        <p className="text-gray-600 mb-6">
          Have questions, suggestions, or want to partner with us? 
          We'd love to hear from the wheelchair racing community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors">
            Contact Us
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-blue-600 hover:text-white transition-colors">
            Join Our Team
          </button>
        </div>
      </section>
      </div>
    </main>
  );
};

export default About;