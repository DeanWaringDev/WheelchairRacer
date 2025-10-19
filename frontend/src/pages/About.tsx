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
    <main className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-secondary)' }}>
            About Wheelchair Racer
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--color-text-body)' }}>
            Empowering wheelchair racers worldwide with accessible resources, 
            community connections, and data-driven insights.
          </p>
        </div>
        
        <div className="card-xl p-8" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-white)' }}>Our Mission</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-white)' }}>
              To create the world's most comprehensive platform for wheelchair racing, 
              providing athletes with the tools, information, and community support 
              they need to achieve their racing goals and push the boundaries of what's possible.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: 'var(--color-secondary)' }}>Our Story</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>
              Wheelchair Racer was born from a simple observation: wheelchair racing 
              was growing rapidly, but athletes lacked centralized resources for 
              training, event discovery, and community connection.
            </p>
            <p className="mb-4" style={{ color: 'var(--color-text-body)' }}>
              Founded by Paralympic athletes and technology professionals, our platform 
              combines deep sport expertise with cutting-edge technology to serve 
              the wheelchair racing community.
            </p>
            <p style={{ color: 'var(--color-text-body)' }}>
              From accessibility mapping to AI-powered training plans, we're building 
              the future of wheelchair racing support, one feature at a time.
            </p>
          </div>
          <div className="card p-8">
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>By the Numbers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>2,747</div>
                <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>Parkrun Events Mapped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>1,200+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>150+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>Training Plans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>50+</div>
                <div className="text-sm" style={{ color: 'var(--color-text-body)' }}>Countries Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: 'var(--color-secondary)' }}>Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="card text-center p-6">
              <div className="text-4xl mb-4">{member.image}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-secondary)' }}>{member.name}</h3>
              <p className="font-medium mb-3" style={{ color: 'var(--color-primary)' }}>{member.role}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: 'var(--color-secondary)' }}>Our Journey</h2>
        <div className="max-w-3xl mx-auto">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold mr-6"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}
              >
                {milestone.year}
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--color-text-body)' }}>{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Values */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: 'var(--color-secondary)' }}>Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Excellence</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Pursuing the highest standards in everything we build</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>Community</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Building connections that empower athletes worldwide</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-3">♿</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Accessibility</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Ensuring our platform works for everyone</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>Innovation</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-body)' }}>Pioneering new solutions for athlete development</p>
          </div>
        </div>
      </section>
      
      {/* Contact CTA */}
      <section className="card p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>Get In Touch</h2>
        <p className="mb-6" style={{ color: 'var(--color-text-body)' }}>
          Have questions, suggestions, or want to partner with us? 
          We'd love to hear from the wheelchair racing community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary px-6 py-3">
            Contact Us
          </button>
          <button className="btn-secondary px-6 py-3">
            Join Our Team
          </button>
        </div>
      </section>
      </div>
    </main>
  );
};

export default About;