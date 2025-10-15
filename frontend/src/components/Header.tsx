/**
 * Header Component
 * 
 * Main site header containing:
 * - Logo and site title (clickable, links to homepage)
 * - Navigation menu (responsive: hamburger on mobile, horizontal on desktop)
 * - Social media links (hidden on mobile to save space)
 * - User profile/authentication link
 * 
 * Design features:
 * - Responsive layout with constrained max-width (max-w-7xl)
 * - Accessibility-focused with proper ARIA labels and semantic HTML
 * - Consistent color scheme: blue background, orange accents
 */

import Navigation from "./Navigation";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-50 w-full" role="banner">
      {/* Container with max width constraint and responsive padding */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Left side: Logo and Site Title */}
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="Go to homepage"
        >
          {/* Logo - using public/logo.svg (80px square) */}
          <img 
            className="w-20 h-20" 
            src="/logo.svg" 
            alt="Wheelchair Racer Logo - Orange wheelchair racing icon" 
          />
          
          {/* Site Title with orange accent border */}
          <h1 className="text-3xl font-bold text-gray-800 border-l-4 pl-4 border-amber-400">
            Wheelchair Racer
          </h1>
        </Link>
        
        {/* Right side: Navigation, Social Icons, and Profile */}
        <div className="flex items-center gap-4">
          
          {/* Main Navigation Component */}
          <Navigation />
          
          {/* Social Media Links - Only visible on large screens (lg:flex) */}
          <div className="hidden lg:flex items-center gap-3" role="complementary" aria-label="Social media links">
            
            {/* Facebook Icon Link */}
            <a
              href="https://facebook.com/wheelchairracer" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Visit our Facebook page (opens in new tab)"
            >
              {/* Facebook SVG Icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            {/* TODO: Add more social media links here (Instagram, Twitter, etc.) */}
          </div>
          
          {/* User Profile/Authentication Link */}
          <Link 
            to="/signin" /* TODO: Implement authentication logic:
                          * - If user is logged out: go to /signin
                          * - If user is logged in: go to /profile
                          */
            className="flex items-center p-2 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Sign in or view profile"
          >
            {/* User Icon - TODO: Replace with actual user avatar when authenticated */}
            <svg 
              className="w-8 h-8 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;
