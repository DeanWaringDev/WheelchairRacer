import React from 'react';

const Forum: React.FC = () => {
  const forumCategories = [
    {
      name: "General Discussion",
      description: "Chat about wheelchair racing and related topics",
      posts: 156,
      topics: 42,
      icon: "💬",
      color: "blue"
    },
    {
      name: "Training & Technique",
      description: "Share training tips and discuss racing techniques",
      posts: 89,
      topics: 23,
      icon: "🏃‍♂️",
      color: "green"
    },
    {
      name: "Equipment & Gear",
      description: "Discuss racing wheelchairs, gear, and equipment reviews",
      posts: 67,
      topics: 18,
      icon: "⚙️",
      color: "purple"
    },
    {
      name: "Events & Races",
      description: "Share information about upcoming races and events",
      posts: 43,
      topics: 15,
      icon: "🏁",
      color: "red"
    }
  ];

  const recentTopics = [
    {
      title: "Best training schedule for marathon preparation?",
      author: "RacerMike92",
      replies: 12,
      lastActivity: "2 hours ago",
      category: "Training & Technique"
    },
    {
      title: "Looking for racing partners in London area",
      author: "SpeedyAnna",
      replies: 7,
      lastActivity: "4 hours ago",
      category: "General Discussion"
    },
    {
      title: "Racing wheelchair maintenance tips",
      author: "TechGuru",
      replies: 15,
      lastActivity: "6 hours ago",
      category: "Equipment & Gear"
    },
    {
      title: "Boston Marathon 2026 - Who's planning to participate?",
      author: "MarathonDreamer",
      replies: 23,
      lastActivity: "1 day ago",
      category: "Events & Races"
    }
  ];

  return (
    <main className="bg-white min-h-screen p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Community Forum
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Connect with fellow wheelchair racers, share experiences, and get advice from the community.
        </p>
        <p className="text-gray-500">
          Join discussions about training, equipment, races, and everything wheelchair racing.
        </p>
      </div>
      
      {/* Forum Stats */}
      <section className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm opacity-80">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">355</div>
            <div className="text-sm opacity-80">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">98</div>
            <div className="text-sm opacity-80">Active Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm opacity-80">Online Now</div>
          </div>
        </div>
      </section>
      
      {/* Forum Categories */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Forum Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forumCategories.map((category, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center ${
                  category.color === 'blue' ? 'bg-blue-100' :
                  category.color === 'green' ? 'bg-green-100' :
                  category.color === 'purple' ? 'bg-purple-100' :
                  'bg-red-100'
                }`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{category.topics} topics</span>
                    <span>•</span>
                    <span>{category.posts} posts</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Recent Topics</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            New Topic
          </button>
        </div>
        <div className="space-y-4">
          {recentTopics.map((topic, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1 hover:text-blue-600">
                    {topic.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>by {topic.author}</span>
                    <span>•</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      topic.category === 'Training & Technique' ? 'bg-green-100 text-green-800' :
                      topic.category === 'Equipment & Gear' ? 'bg-purple-100 text-purple-800' :
                      topic.category === 'Events & Races' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {topic.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="text-center">
                    <div className="font-medium text-gray-700">{topic.replies}</div>
                    <div>replies</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-700">{topic.lastActivity}</div>
                    <div>last activity</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Community Guidelines */}
      <section className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">Community Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Please Remember:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Be respectful and supportive</li>
              <li>• Stay on topic</li>
              <li>• Share constructive feedback</li>
              <li>• Help newcomers feel welcome</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-800 mb-2">Coming Soon:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Full forum functionality</li>
              <li>• User profiles and badges</li>
              <li>• Direct messaging</li>
              <li>• Mobile forum app</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Forum;