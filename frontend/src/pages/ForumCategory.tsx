// WheelchairRacer/frontend/src/pages/ForumCategory.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
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
};

const ForumCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New topic modal state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({
    title: '',
    content: '',
  });
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState('');

  // Fetch category and topics
  const fetchCategoryAndTopics = useCallback(async () => {
    if (!categoryId) return;

    setLoading(true);

    // Fetch category
    const { data: categoryData, error: categoryError } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      setError('Category not found');
      setLoading(false);
      return;
    }

    setCategory(categoryData);

    // Fetch topics in this category (pinned first, then by last activity)
    const { data: topicsData, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('category_id', categoryId)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false });

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
    } else {
      setTopics(topicsData || []);
    }

    setLoading(false);
  }, [categoryId]);

  useEffect(() => {
    fetchCategoryAndTopics();
  }, [fetchCategoryAndTopics]);

  // Handle create topic
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryId) return;

    setTopicLoading(true);
    setTopicError('');

    const { error } = await supabase.from('forum_topics').insert([
      {
        category_id: categoryId,
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
      await fetchCategoryAndTopics();
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
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
          <Link to="/forum" className="text-blue-600 hover:underline">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link to="/forum" className="hover:text-blue-600">Forum</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`text-3xl w-16 h-16 rounded-full flex items-center justify-center ${
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
              <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
              <p className="text-gray-600 mt-1">{category.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
            </div>
            <button
              onClick={openTopicModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              New Topic
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Topics List */}
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No topics in this category yet.</p>
              <button
                onClick={openTopicModal}
                className="text-blue-600 hover:underline"
              >
                Be the first to start a discussion!
              </button>
            </div>
          ) : (
            topics.map((topic) => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.is_pinned && (
                        <span className="text-yellow-500" title="Pinned">📌</span>
                      )}
                      <h3 className="font-medium text-gray-800 hover:text-blue-600 truncate">
                        {topic.title}
                      </h3>
                      {topic.is_locked && (
                        <span className="text-gray-400" title="Locked">🔒</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span>by {topic.author_name}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(topic.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500 ml-4">
                    <div className="text-center min-w-[60px]">
                      <div className="font-medium text-gray-700">{topic.replies_count}</div>
                      <div className="text-xs">replies</div>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <div className="font-medium text-gray-700">{topic.views_count}</div>
                      <div className="text-xs">views</div>
                    </div>
                    <div className="text-right min-w-[100px] hidden md:block">
                      <div className="font-medium text-gray-700">
                        {formatTimeAgo(topic.last_activity_at)}
                      </div>
                      <div className="text-xs">last activity</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Create Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </div>
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
                    setTopicError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topicLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

export default ForumCategory;
