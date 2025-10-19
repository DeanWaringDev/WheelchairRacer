// WheelchairRacer/frontend/src/pages/PrivacyPolicy.tsx
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="page-container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto card p-8">
        <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-secondary)' }}>Privacy Policy</h1>
        
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
          Last Updated: October 17, 2025
        </p>

        <div className="space-y-6" style={{ color: 'var(--color-text-body)' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>1. Introduction</h2>
            <p>
              Welcome to Wheelchair Racer ("we," "our," or "us"). We are committed to protecting your 
              personal information and your right to privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, username, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Profile picture, bio, fitness goals, and preferences</li>
              <li><strong>User Content:</strong> Blog posts, comments, training logs, and race reports you create</li>
              <li><strong>Communication Data:</strong> Messages you send through our platform and feedback you provide</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Personalize your experience and provide tailored content</li>
              <li>Send you updates, newsletters, and promotional materials (with your consent)</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>4. Information Sharing and Disclosure</h2>
            <p className="mb-3">We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Public Content:</strong> Blog posts, comments, and profile information you choose to make public</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>6. Your Rights and Choices</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a structured, commonly used format</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect and track information about your activities 
              on our website. For more information, please see our <a href="/cookies" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected information from 
              a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. 
              We take appropriate measures to ensure your data is protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review 
              this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-secondary)' }}>11. Contact Us</h2>
            <p className="mb-3">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> privacy@wheelchairracer.com</li>
              <li><strong>Website:</strong> www.wheelchairracer.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
