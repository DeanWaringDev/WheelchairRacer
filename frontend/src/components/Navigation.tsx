/**
 * Navigation Component
 * 
 * Responsive navigation menu that adapts to different screen sizes:
 * - Desktop (lg and up): Horizontal menu with all items visible
 * - Mobile (below lg): Hamburger button that opens slide-in menu from right
 * 
 * Features:
 * - Responsive breakpoint at 1024px (lg) for optimal text layout
 * - Semi-transparent overlay on mobile menu
 * - Smooth transitions and hover effects
 * - Accessibility-focused with proper ARIA labels
 * - Closes mobile menu when item is clicked
 * 
 * TODO: Add active page highlighting when routing is implemented
 */

import { useState } from "react";
import { Link } from "react-router-dom";

// Interface for type safety on menu items
interface MenuItem {
  name: string;
  path: string;
}

const Navigation: React.FC = () => {
  // State to control mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Toggle function for mobile menu
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Main navigation menu items
  // Note: Ordered by importance/user flow - main features first, info pages last
  const menuItems: MenuItem[] = [
    { name: "Parkrun", path: "/parkrun" },        // Main feature: Parkrun accessibility analysis
    { name: "Events", path: "/events" },          // Main feature: Event route analysis  
    { name: "Workouts", path: "/workouts" },      // Utility: Exercise generator
    { name: "Blog", path: "/blog" },              // Content: Achievements and race highlights
    { name: "Forum", path: "/forum" },            // Community: User discussions
    { name: "About Us", path: "/about" },         // Information: About the platform
    { name: "Contact Us", path: "/contact" },     // Information: Contact details
  ];

  return (
    <>
      {/* Desktop Navigation Menu */}
      {/* Hidden on mobile/tablet (hidden), visible on large screens (lg:flex) */}
      <nav className="hidden lg:flex items-center gap-6" role="navigation" aria-label="Main navigation">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="text-gray-700 hover:text-amber-600 font-medium transition-colors flex items-center text-center"
            /* TODO: Add aria-current="page" for active page highlighting */
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Hamburger Menu Button */}
      {/* Visible on mobile/tablet, hidden on large screens (lg:hidden) */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {/* Hamburger Icon (3 horizontal lines) */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
      </button>

      {/* Mobile Slide-in Menu Overlay */}
      {/* Conditionally rendered based on isMobileMenuOpen state */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden" 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Semi-transparent background overlay */}
          {/* Clicking this closes the menu (UX best practice) */}
          <div 
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} /* 30% opacity for subtle dimming */
            onClick={toggleMobileMenu}
            aria-label="Close mobile menu"
          />
          
          {/* Slide-in Menu Panel */}
          {/* Slides in from right, matches header background color */}
          <div className="fixed right-0 top-0 h-full w-64 bg-blue-50 shadow-lg transform transition-transform">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Close mobile menu"
              >
                {/* X Icon for closing */}
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            {/* Mobile Menu Items */}
            <nav 
              className="flex flex-col p-4 space-y-4" 
              role="navigation" 
              aria-label="Mobile navigation"
            >
              <h2 id="mobile-menu-title" className="sr-only">Navigation Menu</h2>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-700 hover:text-amber-600 font-medium py-2 border-b border-gray-200 transition-colors"
                  onClick={toggleMobileMenu} /* Close menu when item is clicked */
                  /* TODO: Add aria-current="page" for active page highlighting */
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
};

export default Navigation;
