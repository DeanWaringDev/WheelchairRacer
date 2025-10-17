// WheelchairRacer/frontend/src/pages/TermsOfService.tsx
import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: October 17, 2025
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              Welcome to Wheelchair Racer. By accessing or using our website and services, you agree to be bound 
              by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              Wheelchair Racer provides a platform for wheelchair athletes and enthusiasts to access training resources, 
              workout programs, nutritional guidance, race information, and community features including blogs and forums. 
              We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-3">To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access or security breach</li>
            </ul>
            <p className="mt-3">
              You must be at least 13 years old to create an account. Users under 18 should have parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Post harmful, offensive, or inappropriate content</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Impersonate any person or entity</li>
              <li>Spam or send unsolicited communications</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malware, viruses, or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. User Content</h2>
            <p className="mb-3">
              You retain ownership of content you post ("User Content"), but you grant us a worldwide, non-exclusive, 
              royalty-free license to use, reproduce, modify, publish, and distribute your User Content in connection 
              with our services.
            </p>
            <p className="mb-3">You represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have the right to post your User Content</li>
              <li>Your User Content does not violate any third-party rights</li>
              <li>Your User Content complies with these Terms</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Medical Disclaimer</h2>
            <p className="mb-3">
              <strong>IMPORTANT:</strong> The information provided on Wheelchair Racer is for educational and 
              informational purposes only and is not intended as medical advice.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Always consult with a qualified healthcare provider before starting any exercise program</li>
              <li>We are not liable for any injuries or health issues resulting from use of our services</li>
              <li>Exercise and physical activity involve inherent risks</li>
              <li>You assume all risks associated with following any training programs or advice</li>
              <li>Individual results may vary; we make no guarantees about outcomes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>
              All content on Wheelchair Racer, including text, graphics, logos, images, videos, and software, 
              is the property of Wheelchair Racer or its licensors and is protected by copyright, trademark, 
              and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative 
              works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Third-Party Links</h2>
            <p>
              Our services may contain links to third-party websites or services. We are not responsible for 
              the content, privacy policies, or practices of third-party sites. Your use of third-party sites 
              is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WHEELCHAIR RACER SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruptions or errors</li>
              <li>Personal injury or property damage resulting from your use of our services</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid us (if any) in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Wheelchair Racer, its officers, directors, 
              employees, and agents from any claims, losses, damages, liabilities, and expenses (including 
              legal fees) arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to our services at any time, 
              with or without notice, for any reason, including violation of these Terms. Upon termination, 
              your right to use our services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or your use of our services shall be resolved through 
              binding arbitration in accordance with applicable arbitration rules. You waive your right to 
              participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes 
              by posting the updated Terms on our website and updating the "Last Updated" date. Your continued 
              use of our services after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">15. Contact Information</h2>
            <p className="mb-3">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> legal@wheelchairracer.com</li>
              <li><strong>Website:</strong> www.wheelchairracer.com</li>
            </ul>
          </section>

          <section className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              By using Wheelchair Racer, you acknowledge that you have read, understood, and agree to be bound 
              by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
