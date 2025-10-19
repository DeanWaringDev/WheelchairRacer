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
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { user } = useAuth()
  
  return (
    <header 
      className="w-full shadow-sm" 
      role="banner"
      style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
    >
      {/* Container with max width constraint and responsive padding */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between min-[470px]:px-4 max-[469px]:px-2 max-[469px]:py-3">
        
        {/* Left side: Logo and Site Title */}
        <Link 
          to="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="Go to homepage"
        >
          {/* Logo - using public/logo.svg (80px square) */}
          <img 
            className="w-16 h-16 max-[469px]:w-12 max-[469px]:h-12" 
            src="/logo.svg" 
            alt="Wheelchair Racer Logo - Orange wheelchair racing icon" 
          />
          
          {/* Site Title with brand primary color border */}
          <h1 
            className="text-2xl font-bold border-l-4 pl-4 max-[469px]:text-lg max-[469px]:pl-2 max-[469px]:border-l-2"
            style={{ color: 'var(--color-secondary)', borderColor: 'var(--color-primary)' }}
          >
            Wheelchair Racer
          </h1>
        </Link>
        
        {/* Right side: Navigation, Social Icons, and Profile */}
        <div className="flex items-center gap-4 max-[469px]:gap-1">
          
          {/* Main Navigation Component */}
          <Navigation />
          
          {/* Social Media Links - Only visible on large screens (lg:flex) */}
          <div className="hidden lg:flex items-center gap-3" role="complementary" aria-label="Social media links">
            
            {/* Facebook Icon Link */}
            <a
              href="https://facebook.com/wheelchairracer" 
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: 'var(--color-text-body)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-body)'}
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
            to={user ? "/profile" : "/signin"}
            className="flex items-center p-2 rounded-full transition-colors max-[469px]:p-1"
            style={{ color: 'var(--color-text-body)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label={user ? "View profile" : "Sign in"}
          >
            {/* Show user avatar if logged in, otherwise show default icon */}
            {user && user.user_metadata?.avatar_url ? (
              <img
                className="w-8 h-8 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--color-primary)' }}
                src={user.user_metadata.avatar_url}
                alt="Profile"
              />
            ) : (
              <svg 
                className="w-8 h-8" 
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
            )}
            
            {/* Show username on larger screens if logged in */}
            {user && (
              <span 
                className="hidden sm:block ml-2 text-sm font-medium"
                style={{ color: 'var(--color-secondary)' }}
              >
                {user.user_metadata?.username || 'Profile'}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;
