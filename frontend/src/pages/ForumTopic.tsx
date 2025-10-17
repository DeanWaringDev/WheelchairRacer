// WheelchairRacer/frontend/src/pages/ForumTopic.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ADMIN_USER_ID = '5bc2da58-8e69-4779-ba02-52e6182b9668';

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
  category?: {
    name: string;
    color: string;
  };
};

type Reply = {
  id: string;
  topic_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
};

const ForumTopic: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.id === ADMIN_USER_ID;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch topic and replies
  const fetchTopicAndReplies = useCallback(async () => {
    if (!topicId) return;

    setLoading(true);

    // Fetch topic
    const { data: topicData, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories(name, color)
      `)
      .eq('id', topicId)
      .single();

    if (topicError) {
      setError('Topic not found');
      setLoading(false);
      return;
    }

    setTopic(topicData);

    // Fetch replies
    const { data: repliesData, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (repliesError) {
      console.error('Error fetching replies:', repliesError);
    } else {
      setReplies(repliesData || []);
    }

    // Increment view count
    await supabase.rpc('increment_topic_views', { topic_id: topicId });

    setLoading(false);
  }, [topicId]);

  useEffect(() => {
    fetchTopicAndReplies();
  }, [fetchTopicAndReplies]);

  // Handle reply submission
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topicId || topic?.is_locked) return;

    setReplyLoading(true);
    setReplyError('');

    const { error } = await supabase.from('forum_replies').insert([
      {
        topic_id: topicId,
        content: replyContent.trim(),
        author_id: user.id,
        author_name: user.user_metadata?.username || 'Anonymous',
      },
    ]);

    if (error) {
      setReplyError(error.message);
    } else {
      setReplyContent('');
      await fetchTopicAndReplies();
    }

    setReplyLoading(false);
  };

  // Handle edit reply
  const handleEditReply = async (replyId: string) => {
    const { error } = await supabase
      .from('forum_replies')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', replyId);

    if (!error) {
      setEditingReplyId(null);
      setEditContent('');
      await fetchTopicAndReplies();
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    const { error } = await supabase.from('forum_replies').delete().eq('id', replyId);

    if (!error) {
      await fetchTopicAndReplies();
    }
  };

  // Handle delete topic (admin only)
  const handleDeleteTopic = async () => {
    if (!isAdmin || !topicId) return;
    if (!window.confirm('Are you sure you want to delete this topic? This will also delete all replies.')) return;

    const { error } = await supabase.from('forum_topics').delete().eq('id', topicId);

    if (!error) {
      navigate('/forum');
    } else {
      setError('Failed to delete topic');
    }
  };

  // Handle toggle pin (admin only)
  const handleTogglePin = async () => {
    if (!isAdmin || !topicId || !topic) return;

    const { error } = await supabase
      .from('forum_topics')
      .update({ is_pinned: !topic.is_pinned })
      .eq('id', topicId);

    if (!error) {
      await fetchTopicAndReplies();
    }
  };

  // Handle toggle lock (admin only)
  const handleToggleLock = async () => {
    if (!isAdmin || !topicId || !topic) return;

    const { error } = await supabase
      .from('forum_topics')
      .update({ is_locked: !topic.is_locked })
      .eq('id', topicId);

    if (!error) {
      await fetchTopicAndReplies();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Topic not found'}</p>
          <Link to="/forum" className="text-blue-600 hover:underline">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link to="/forum" className="hover:text-blue-600">Forum</Link>
          <span className="mx-2">›</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              topic.category?.color === 'green'
                ? 'bg-green-100 text-green-800'
                : topic.category?.color === 'purple'
                ? 'bg-purple-100 text-purple-800'
                : topic.category?.color === 'red'
                ? 'bg-red-100 text-red-800'
                : topic.category?.color === 'yellow'
                ? 'bg-yellow-100 text-yellow-800'
                : topic.category?.color === 'pink'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {topic.category?.name}
          </span>
        </div>

        {/* Topic Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {topic.is_pinned && <span className="text-yellow-500">📌</span>}
                <h1 className="text-2xl font-bold text-gray-800">{topic.title}</h1>
                {topic.is_locked && <span className="text-gray-400">🔒</span>}
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span>by {topic.author_name}</span>
                <span>•</span>
                <span>{formatDate(topic.created_at)}</span>
                <span>•</span>
                <span>{topic.views_count} views</span>
                <span>•</span>
                <span>{topic.replies_count} replies</span>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={handleTogglePin}
                  className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  title={topic.is_pinned ? 'Unpin' : 'Pin'}
                >
                  📌
                </button>
                <button
                  onClick={handleToggleLock}
                  className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  title={topic.is_locked ? 'Unlock' : 'Lock'}
                >
                  {topic.is_locked ? '🔓' : '🔒'}
                </button>
                <button
                  onClick={handleDeleteTopic}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Replies ({replies.length})
          </h2>

          {replies.map((reply) => (
            <div key={reply.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-medium text-gray-800">{reply.author_name}</span>
                  <span className="text-sm text-gray-500 ml-3">{formatDate(reply.created_at)}</span>
                  {reply.updated_at !== reply.created_at && (
                    <span className="text-xs text-gray-400 ml-2">(edited)</span>
                  )}
                </div>

                {/* Reply Actions */}
                {(user?.id === reply.author_id || isAdmin) && (
                  <div className="flex gap-2">
                    {user?.id === reply.author_id && (
                      <button
                        onClick={() => {
                          setEditingReplyId(reply.id);
                          setEditContent(reply.content);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingReplyId === reply.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditReply(reply.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingReplyId(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              )}
            </div>
          ))}

          {replies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No replies yet. Be the first to reply!
            </div>
          )}
        </div>

        {/* Reply Form */}
        {user && !topic.is_locked ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Post a Reply</h3>
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts..."
                rows={5}
                required
              />

              {replyError && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{replyError}</p>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={replyLoading || !replyContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {replyLoading ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        ) : topic.is_locked ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              🔒 This topic is locked. No new replies can be posted.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Please sign in to post a reply</p>
            <Link
              to="/signin"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default ForumTopic;
