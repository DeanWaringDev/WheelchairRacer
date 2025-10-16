import React from 'react';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      title: "Getting Started with Wheelchair Racing: A Beginner's Guide",
      excerpt: "Everything you need to know about entering the exciting world of wheelchair racing, from equipment basics to your first race.",
      author: "Sarah Johnson",
      date: "October 15, 2025",
      category: "Beginner Tips",
      readTime: "5 min read",
      featured: true
    },
    {
      title: "Marathon Training: Building Endurance for Long Distance Events",
      excerpt: "A comprehensive guide to preparing for marathon distances, including training schedules and nutrition strategies.",
      author: "Mike Chen",
      date: "October 12, 2025",
      category: "Training",
      readTime: "8 min read",
      featured: false
    },
    {
      title: "Equipment Review: Latest Racing Wheelchair Technologies",
      excerpt: "An in-depth look at the newest innovations in racing wheelchair design and how they impact performance.",
      author: "Alex Rivera",
      date: "October 10, 2025",
      category: "Equipment",
      readTime: "6 min read",
      featured: false
    }
  ];

  const categories = ["All", "Training", "Equipment", "Nutrition", "Race Reports", "Beginner Tips", "Inspiration"];

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Racing Blog
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Latest insights, tips, and stories from the wheelchair racing community.
        </p>
        <p className="text-gray-500">
          Expert advice, athlete spotlights, and everything you need to know about wheelchair racing.
        </p>
      </div>
      
      {/* Category Filter */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      
      {/* Featured Post */}
      {blogPosts.filter(post => post.featured).map((post, index) => (
        <section key={index} className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
            <span className="inline-block bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm mb-4">
              Featured Post
            </span>
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <p className="text-lg mb-4 opacity-90">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span>By {post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Read Article
              </button>
            </div>
          </div>
        </section>
      ))}
      
      {/* Recent Posts */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.filter(post => !post.featured).map((post, index) => (
            <article key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  post.category === 'Training' ? 'bg-blue-100 text-blue-800' :
                  post.category === 'Equipment' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.category}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-3 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <span>{post.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-6">
            Get the latest racing tips, training advice, and community news delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      {/* Coming Soon Notice */}
      <section className="mt-8 bg-purple-50 border border-purple-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">📝 Community Blog Coming Soon</h3>
        <p className="text-purple-700 mb-4">
          We're building a platform where community members can share their own racing stories, training tips, and experiences.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Planned Features:</h4>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• User-generated content</li>
              <li>• Race reports and reviews</li>
              <li>• Training diaries</li>
              <li>• Photo galleries</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Get Involved:</h4>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Submit article ideas</li>
              <li>• Share your racing story</li>
              <li>• Become a contributor</li>
              <li>• Join our writing community</li>
            </ul>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default Blog;