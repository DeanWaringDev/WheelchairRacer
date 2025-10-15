import Header from './components/Header'

function App() {
  return (
    <>
      <Header />
      <main className="bg-white min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Wheelchair Racer</h1>
        <p className="text-gray-600 mb-4">
          This is temporary content to show the semi-transparent overlay effect when the mobile menu is open.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-100 p-6 rounded-lg">
            <h3 className="font-bold text-blue-800">Parkrun Analysis</h3>
            <p className="text-blue-600">Find wheelchair-accessible parkrun routes</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="font-bold text-green-800">Event Routes</h3>
            <p className="text-green-600">Analyze race event accessibility</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg">
            <h3 className="font-bold text-purple-800">Workouts</h3>
            <p className="text-purple-600">Personalized exercise plans</p>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
