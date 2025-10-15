// Navigation.tsx
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    { name: "Parkrun", path: "/parkrun" },
    { name: "Events", path: "/events" },
    { name: "Workouts", path: "/workouts" },
    { name: "Blog", path: "/blog" },
    { name: "Forum", path: "/forum" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  // Desktop and Mobile menu rendering logic here...
  return (
  <>
    {/* Desktop Navigation */}
    <nav className="hidden lg:flex items-center gap-6">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="text-gray-700 hover:text-amber-600 font-medium transition-colors flex items-center text-center"
        >
          {item.name}
        </Link>
      ))}
    </nav>

    {/* Mobile Hamburger Button */}
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden p-2 text-gray-700"
    >
      {/* Hamburger Icon SVG */}
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    {/* Mobile Slide-in Menu */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Background overlay */}
        <div 
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Slide-in menu */}
        <div className="fixed right-0 top-0 h-full w-64 bg-blue-50 shadow-lg transform transition-transform">
          {/* Close button */}
          <button
            onClick={toggleMobileMenu}
            className="p-4 text-gray-700"
          >
            {/* Close X icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Menu items */}
          <nav className="flex flex-col p-4 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-700 hover:text-amber-600 font-medium py-2 border-b border-gray-200"
                onClick={toggleMobileMenu}
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
