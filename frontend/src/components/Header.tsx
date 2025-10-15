import Navigation from "./Navigation";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-50 w-full">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img className="w-20 h-20" src="/logo.svg" alt="Wheelchair Racer Logo" />
          <h1 className="text-3xl font-bold text-gray-800 border-l-4 pl-4 border-amber-400">Wheelchair Racer</h1>
        </Link>
        
        {/* Right side - Navigation, Social Icons, and Profile */}
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <Navigation />
          
          {/* Social Icons - hidden on mobile to save space */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Facebook Icon */}
            <a
              href="https://facebook.com/wheelchairracer" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Visit our Facebook page"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
          
          {/* Profile Icon */}
          <Link 
            to="/signin" // TODO: Change to "/profile" when user is logged in
            className="flex items-center p-2 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Sign in or view profile"
          >
            {/* Default profile icon - TODO: Replace with user avatar when logged in */}
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;
