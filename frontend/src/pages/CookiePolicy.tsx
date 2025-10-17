// WheelchairRacer/frontend/src/pages/CookiePolicy.tsx
import React from 'react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Last Updated: October 17, 2025
        </p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are 
              widely used to make websites work more efficiently and provide information to website owners. 
              Cookies help us remember your preferences, understand how you use our site, and improve your 
              overall experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Types of Cookies We Use</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, authentication, and network management. You cannot opt out of these cookies.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Session management and authentication</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization, such as remembering your 
                  preferences and settings.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Language preferences</li>
                  <li>Theme settings (light/dark mode)</li>
                  <li>User interface customizations</li>
                  <li>Workout and training preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Page views and navigation patterns</li>
                  <li>Time spent on pages</li>
                  <li>Click-through rates</li>
                  <li>Error tracking and diagnostics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Marketing Cookies</h3>
                <p>
                  These cookies are used to track visitors across websites to display relevant and engaging 
                  advertisements. They may be set by us or third-party advertising partners.
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Targeted advertising</li>
                  <li>Social media integration</li>
                  <li>Email campaign tracking</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Third-Party Cookies</h2>
            <p className="mb-3">
              We may use third-party services that set cookies on your device. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication Services:</strong> Supabase for secure user authentication</li>
              <li><strong>Analytics:</strong> Google Analytics or similar services to understand site usage</li>
              <li><strong>Social Media:</strong> Cookies from social media platforms when you interact with sharing features</li>
              <li><strong>Content Delivery:</strong> CDN services to improve site performance</li>
            </ul>
            <p className="mt-3">
              These third parties have their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. How Long Do Cookies Last?</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Session Cookies</h3>
                <p>
                  These temporary cookies are deleted when you close your browser. They are used to maintain 
                  your session while you navigate the site.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Persistent Cookies</h3>
                <p>
                  These cookies remain on your device for a set period (typically 30 days to 2 years) or 
                  until you delete them. They remember your preferences across multiple sessions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Managing Cookies</h2>
            <p className="mb-3">
              You have several options for managing cookies:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Browser Settings</h3>
                <p className="mb-2">Most browsers allow you to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>View and delete cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Block all cookies (may affect site functionality)</li>
                  <li>Delete cookies when you close the browser</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  Check your browser's help section for specific instructions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookie Preferences</h3>
                <p>
                  You can manage your cookie preferences through our cookie consent banner when you first 
                  visit the site, or through your account settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Opt-Out Tools</h3>
                <p>For analytics and marketing cookies, you can use:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Google Analytics Opt-out Browser Add-on</li>
                  <li>Network Advertising Initiative opt-out page</li>
                  <li>Digital Advertising Alliance opt-out page</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our site 
                and limit certain features.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Do Not Track Signals</h2>
            <p>
              Some browsers have a "Do Not Track" feature that lets you tell websites you do not want to have 
              your online activities tracked. Currently, we do not respond to Do Not Track signals, but we are 
              committed to providing you with meaningful choices about the information collected on our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Cookie Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cookie Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm">sb-access-token</td>
                    <td className="px-4 py-3 text-sm">Authentication session</td>
                    <td className="px-4 py-3 text-sm">Session</td>
                    <td className="px-4 py-3 text-sm">Essential</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm">sb-refresh-token</td>
                    <td className="px-4 py-3 text-sm">Session refresh</td>
                    <td className="px-4 py-3 text-sm">7 days</td>
                    <td className="px-4 py-3 text-sm">Essential</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">user_preferences</td>
                    <td className="px-4 py-3 text-sm">Store user settings</td>
                    <td className="px-4 py-3 text-sm">1 year</td>
                    <td className="px-4 py-3 text-sm">Functional</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-sm">_ga</td>
                    <td className="px-4 py-3 text-sm">Analytics tracking</td>
                    <td className="px-4 py-3 text-sm">2 years</td>
                    <td className="px-4 py-3 text-sm">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, 
              or our practices. We will notify you of significant changes by posting a notice on our website or 
              updating the "Last Updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p className="mb-3">
              If you have questions about our use of cookies, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li><strong>Email:</strong> privacy@wheelchairracer.com</li>
              <li><strong>Website:</strong> www.wheelchairracer.com</li>
            </ul>
          </section>

          <section className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm text-blue-800">
              <strong>Your Consent:</strong> By continuing to use our website, you consent to our use of cookies 
              as described in this Cookie Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
