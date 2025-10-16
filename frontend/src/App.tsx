/**
 * Main App component - Root component with React Router routing
 * This component handles the main page structure and routing between pages
 * Note: BrowserRouter is already provided in main.tsx, so we only need Routes here
 */

import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

// Import all page components
import Home from './pages/Home'
import Parkrun from './pages/Parkrun'
import Events from './pages/Events'
import Workouts from './pages/Workouts'
import Blog from './pages/Blog'
import Forum from './pages/Forum'
import About from './pages/About'
import Contact from './pages/Contact'

// Define the main App component with routing
const App: React.FC = () => {
  return (
    <>
      {/* Site header with navigation - displayed on all pages */}
      <Header />
      
      {/* Main content area with page routing */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parkrun" element={<Parkrun />} />
        <Route path="/events" element={<Events />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Fallback route - redirects to home */}
        <Route path="*" element={<Home />} />
      </Routes>
      
      {/* Site footer with links, newsletter signup, and exercise management */}
      <Footer />
    </>
  )
}

export default App
