/**
 * Main App component - Root component that defines the overall layout
 * This component handles the main page structure and routing
 * TODO: Add React Router Routes here when implementing page navigation
 */

import Header from './components/Header'

// Define the main App component using function declaration (React best practice)
const App: React.FC = () => {
  return (
    <>
      {/* Site header with navigation - displayed on all pages */}
      <Header />
      
      {/* Main content area */}
      <main className="bg-white min-h-screen p-8">
        {/* Welcome section - TODO: Replace with proper homepage content */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Wheelchair Racer
          </h1>
          <p className="text-gray-600 mb-4">
            This is temporary content to show the semi-transparent overlay effect when the mobile menu is open.
          </p>
        </section>
        
        {/* Feature preview cards - TODO: Make these functional components */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {/* Parkrun Analysis Feature */}
          <div className="bg-blue-100 p-6 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-bold text-blue-800 mb-2">Parkrun Analysis</h3>
            <p className="text-blue-600">Find wheelchair-accessible parkrun routes</p>
          </div>
          
          {/* Event Routes Feature */}
          <div className="bg-green-100 p-6 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-bold text-green-800 mb-2">Event Routes</h3>
            <p className="text-green-600">Analyze race event accessibility</p>
          </div>
          
          {/* Workouts Feature */}
          <div className="bg-purple-100 p-6 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-bold text-purple-800 mb-2">Workouts</h3>
            <p className="text-purple-600">Personalized exercise plans</p>
          </div>
        </section>
      </main>
    </>
  )
}

export default App
