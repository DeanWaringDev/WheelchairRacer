/**
 * Main App component - Root component with React Router routing
 * This component handles the main page structure and routing between pages
 * Note: BrowserRouter is already provided in main.tsx, so we only need Routes here
 */

import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider } from './contexts/AuthContext'

// Import critical pages directly (Home page for fast initial load)
import Home from './pages/Home'

// Lazy load all other pages for code splitting
const Parkrun = lazy(() => import('./pages/Parkrun'))
const ParkrunDetail = lazy(() => import('./pages/ParkrunDetail'))
const Events = lazy(() => import('./pages/Events'))
const Workouts = lazy(() => import('./pages/Workouts'))
const Blog = lazy(() => import('./pages/Blog'))
const Forum = lazy(() => import('./pages/Forum'))
const ForumCategory = lazy(() => import('./pages/ForumCategory'))
const ForumTopic = lazy(() => import('./pages/ForumTopic'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const SignIn = lazy(() => import('./pages/SignIn'))
const Profile = lazy(() => import('./pages/Profile'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Define the main App component with routing
const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* Site header with navigation - displayed on all pages */}
      <Header />
      
      {/* Main content area with page routing and code splitting */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/parkrun" element={<Parkrun />} />
          <Route path="/parkrun/:slug" element={<ParkrunDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/category/:categoryId" element={<ForumCategory />} />
          <Route path="/forum/topic/:topicId" element={<ForumTopic />} />
          <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        {/* Legal pages */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* Password reset pages */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Fallback route - redirects to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      
      {/* Site footer with links, newsletter signup, and exercise management */}
      <Footer />
    </AuthProvider>
  )
}

export default App
