// WheelchairRacer/frontend/src/pages/Forum.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ADMIN_USER_ID } from '../lib/constants';

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  topic_count?: number;
  post_count?: number;
};

type Topic = {
  id: string;
  category_id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  views_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  category_name?: string;
  category_color?: string;
};

const Forum: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.id === ADMIN_USER_ID;

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats state
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [activeTopics, setActiveTopics] = useState(0);

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '💬',
    color: 'blue',
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Topic modal state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [topicForm, setTopicForm] = useState({
    title: '',
    content: '',
  });
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState('');

  // Fetch categories with stats
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    // Get topic and post counts for each category
    const categoriesWithStats = await Promise.all(
      (data || []).map(async (category) => {
        const { count: topicCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        const { data: topics } = await supabase
          .from('forum_topics')
          .select('replies_count')
          .eq('category_id', category.id);

        const postCount = (topics || []).reduce((sum, topic) => sum + (topic.replies_count || 0), 0) + (topicCount || 0);

        return {
          ...category,
          topic_count: topicCount || 0,
          post_count: postCount,
        };
      })
    );

    setCategories(categoriesWithStats);
  }, []);

  // Fetch recent topics
  const fetchRecentTopics = useCallback(async () => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories(name, color)
      `)
      .order('last_activity_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching topics:', error);
      return;
    }

    const topicsWithCategory = (data || []).map((topic: any) => ({
      ...topic,
      category_name: topic.category?.name,
      category_color: topic.category?.color,
    }));

    setRecentTopics(topicsWithCategory);
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    // Total members (users who have created topics or replies)
    const { data: topicAuthors } = await supabase
      .from('forum_topics')
      .select('author_id');
    
    const { data: replyAuthors } = await supabase
      .from('forum_replies')
      .select('author_id');

    const uniqueAuthors = new Set([
      ...(topicAuthors || []).map(t => t.author_id),
      ...(replyAuthors || []).map(r => r.author_id),
    ]);
    setTotalMembers(uniqueAuthors.size);

    // Total posts (topics + replies)
    const { count: topicsCount } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true });

    const { count: repliesCount } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true });

    setTotalPosts((topicsCount || 0) + (repliesCount || 0));

    // Active topics (topics with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeCount } = await supabase
      .from('forum_topics')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', thirtyDaysAgo.toISOString());

    setActiveTopics(activeCount || 0);
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchRecentTopics(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCategories, fetchRecentTopics, fetchStats]);

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setCategoryLoading(true);
    setCategoryError('');

    const { error } = await supabase.from('forum_categories').insert([
      {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        icon: categoryForm.icon,
        color: categoryForm.color,
        display_order: categories.length + 1,
        created_by: user?.id,
      },
    ]);

    if (error) {
      setCategoryError(error.message);
    } else {
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', icon: '💬', color: 'blue' });
      await fetchCategories();
    }

    setCategoryLoading(false);
  };

  // Handle create topic
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setTopicLoading(true);
    setTopicError('');

    const { error } = await supabase.from('forum_topics').insert([
      {
        category_id: selectedCategory,
        title: topicForm.title.trim(),
        content: topicForm.content.trim(),
        author_id: user.id,
        author_name: user.user_metadata?.username || 'Anonymous',
      },
    ]);

    if (error) {
      setTopicError(error.message);
    } else {
      setShowTopicModal(false);
      setTopicForm({ title: '', content: '' });
      setSelectedCategory('');
      await Promise.all([fetchCategories(), fetchRecentTopics(), fetchStats()]);
    }

    setTopicLoading(false);
  };

  const openTopicModal = () => {
    if (!user) {
      setError('Please sign in to create a topic');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setShowTopicModal(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Community Forum</h1>
          <p className="text-lg text-gray-600 mb-2">
            Connect with fellow wheelchair racers, share experiences, and get advice from the community.
          </p>
          <p className="text-gray-500">
            Join discussions about training, equipment, races, and everything wheelchair racing.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Forum Stats */}
        <section className="mb-8 card-xl p-6" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', color: 'var(--color-white)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalMembers}</div>
              <div className="text-sm" style={{ opacity: 0.8 }}>Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalPosts}</div>
              <div className="text-sm" style={{ opacity: 0.8 }}>Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{activeTopics}</div>
              <div className="text-sm" style={{ opacity: 0.8 }}>Active Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{user ? '1' : '0'}</div>
              <div className="text-sm" style={{ opacity: 0.8 }}>Online Now</div>
            </div>
          </div>
        </section>

        {/* Forum Categories */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-secondary)' }}>Forum Categories</h2>
            {isAdmin && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn-accent px-4 py-2 text-sm"
              >
                + Add Category
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/forum/category/${category.id}`}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer block"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center ${
                      category.color === 'blue'
                        ? 'bg-blue-100'
                        : category.color === 'green'
                        ? 'bg-green-100'
                        : category.color === 'purple'
                        ? 'bg-purple-100'
                        : category.color === 'red'
                        ? 'bg-red-100'
                        : category.color === 'yellow'
                        ? 'bg-yellow-100'
                        : category.color === 'pink'
                        ? 'bg-pink-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{category.topic_count} topics</span>
                      <span>•</span>
                      <span>{category.post_count} posts</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Topics */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-secondary)' }}>Recent Topics</h2>
            <button
              onClick={() => openTopicModal()}
              className="btn-primary px-4 py-2 text-sm"
            >
              New Topic
            </button>
          </div>
          <div className="space-y-4">
            {recentTopics.length === 0 ? (
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No topics yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              recentTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/forum/topic/${topic.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.is_pinned && (
                          <span className="text-yellow-500">📌</span>
                        )}
                        <h3 className="font-medium text-gray-800 hover:text-blue-600">
                          {topic.title}
                        </h3>
                        {topic.is_locked && (
                          <span className="text-gray-400">🔒</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>by {topic.author_name}</span>
                        <span>•</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            topic.category_color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : topic.category_color === 'purple'
                              ? 'bg-purple-100 text-purple-800'
                              : topic.category_color === 'red'
                              ? 'bg-red-100 text-red-800'
                              : topic.category_color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : topic.category_color === 'pink'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {topic.category_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="text-center">
                        <div className="font-medium text-gray-700">{topic.replies_count}</div>
                        <div>replies</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-700">{topic.views_count}</div>
                        <div>views</div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="font-medium text-gray-700">
                          {formatTimeAgo(topic.last_activity_at)}
                        </div>
                        <div>last activity</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="card p-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-accent)' }}>Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--color-secondary)' }}>Please Remember:</h4>
              <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-body)' }}>
                <li>• Be respectful and supportive</li>
                <li>• Stay on topic</li>
                <li>• Share constructive feedback</li>
                <li>• Help newcomers feel welcome</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--color-secondary)' }}>Forum Features:</h4>
              <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-body)' }}>
                <li>✓ Create and reply to topics</li>
                <li>✓ Multiple categories</li>
                <li>✓ Real-time stats</li>
                <li>✓ User-friendly interface</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Create Category Modal (Admin Only) */}
      {showCategoryModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Training Tips"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the category"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Emoji (e.g., 💬)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="pink">Pink</option>
                </select>
              </div>

              {categoryError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{categoryError}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryForm({ name: '', description: '', icon: '💬', color: 'blue' });
                    setCategoryError('');
                  }}
                  className="btn-secondary flex-1 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="btn-primary flex-1 px-4 py-2"
                  style={{ opacity: categoryLoading ? 0.5 : 1 }}
                >
                  {categoryLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's your topic about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={topicForm.content}
                  onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts, questions, or ideas..."
                  rows={8}
                  required
                />
              </div>

              {topicError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{topicError}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicModal(false);
                    setTopicForm({ title: '', content: '' });
                    setSelectedCategory('');
                    setTopicError('');
                  }}
                  className="btn-secondary flex-1 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicLoading}
                  className="btn-primary flex-1 px-4 py-2"
                  style={{ opacity: topicLoading ? 0.5 : 1 }}
                >
                  {topicLoading ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Forum;