// WheelchairRacer/frontend/src/pages/Blog.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { ADMIN_USER_ID, STORAGE_BUCKET } from "../lib/constants";
import { sanitizeRichText, stripHTML } from "../lib/sanitize";
import { rateLimiter, RateLimits, formatTimeRemaining } from "../lib/rateLimit";

type Post = {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  author_id?: string | null;
  author_name?: string | null;
  created_at?: string;
  likes_count?: number;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

const categories = [
  "All",
  "Training",
  "Equipment",
  "Nutrition",
  "Race Reports",
  "Beginner Tips",
  "Inspiration",
];

const Blog: React.FC = () => {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentForm, setCommentForm] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  
  // Likes state
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  
  // Edit post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "",
  });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError(error.message);
      setPosts([]);
    } else {
      // After fetching posts, fetch comment counts and like counts for each post
      if (data) {
        const counts: Record<string, number> = {};
        const postsWithLikes = [];
        
        for (const post of data) {
          // Fetch comment count
          const { count: commentCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          counts[post.id] = commentCount || 0;
          
          // Fetch like count
          const { count: likeCount } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          postsWithLikes.push({ ...post, likes_count: likeCount || 0 });
        }
        
        setPosts(postsWithLikes);
        setCommentCounts(counts);
      } else {
        setPosts([]);
      }
    }

    setLoading(false);
  }, []);

  // Fetch user's likes
  const fetchUserLikes = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);

    if (!error && data) {
      setUserLikes(new Set(data.map(like => like.post_id)));
    }
  }, [user]);

  // Fetch comments for a specific post
  const fetchCommentsForPost = useCallback(async (postId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: data }));
    }
  }, []);

  // Toggle like on a post
  const handleLike = async (postId: string) => {
    setLikingPosts(prev => new Set(prev).add(postId));

    const isLiked = userLikes.has(postId);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user?.id || null);

      if (!error) {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        
        // Count the actual likes from post_likes table
        const { count } = await supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, likes_count: count ?? 0 } : p
          )
        );
      }
    } else {
      // Like
      const { error } = await supabase.from("post_likes").insert([
        {
          post_id: postId,
          user_id: user?.id || null,
        },
      ]);

      if (!error) {
        setUserLikes(prev => new Set(prev).add(postId));
        
        // Count the actual likes from post_likes table
        const { count } = await supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, likes_count: count ?? 0 } : p
          )
        );
      }
    }

    setLikingPosts(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
  };

  // Submit comment
  const handleCommentSubmit = async (postId: string) => {
    if (!user) return;
    
    const content = commentForm[postId]?.trim();
    if (!content) return;

    setCommentSubmitting(prev => ({ ...prev, [postId]: true }));

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: user.id,
        author_name: user.user_metadata?.username || "Anonymous",
        content,
      },
    ]);

    if (!error) {
      setCommentForm(prev => ({ ...prev, [postId]: "" }));
      await fetchCommentsForPost(postId);
      // Update comment count
      setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }

    setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string, postId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      await fetchCommentsForPost(postId);
      // Update comment count
      setCommentCounts(prev => ({ ...prev, [postId]: Math.max((prev[postId] || 0) - 1, 0) }));
    }
  };

  // Delete post (admin only)
  const handleDeletePost = async (postId: string) => {
    if (user?.id !== ADMIN_USER_ID) return;
    
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      await fetchPosts();
    }
  };

  // Edit post handlers (admin only)
  const handleStartEdit = (post: Post) => {
    if (user?.id !== ADMIN_USER_ID) return;
    
    setEditingPostId(post.id);
    setEditForm({
      title: post.title,
      content: post.content,
      category: post.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditForm({ title: '', content: '', category: '' });
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.id !== ADMIN_USER_ID || !editingPostId) return;
    
    const cleanTitle = stripHTML(editForm.title);
    const cleanContent = sanitizeRichText(editForm.content);
    
    const { error } = await supabase
      .from('posts')
      .update({
        title: cleanTitle,
        content: cleanContent,
        category: editForm.category,
      })
      .eq('id', editingPostId)
      .select();
    
    if (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post: ' + error.message);
      return;
    }
    
    setEditingPostId(null);
    setEditForm({ title: '', content: '', category: '' });
    await fetchPosts();
  };

  // Toggle comments visibility
  const toggleComments = async (postId: string) => {
    const isCurrentlyShown = showComments[postId];
    
    if (!isCurrentlyShown && !comments[postId]) {
      await fetchCommentsForPost(postId);
    }
    
    setShowComments(prev => ({ ...prev, [postId]: !isCurrentlyShown }));
  };

  useEffect(() => {
    fetchPosts();
    fetchUserLikes();
  }, [fetchPosts, fetchUserLikes]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImageFiles(files);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.category) {
      setFormError("Please fill in all required fields.");
      return;
    }

    // Rate limiting
    const rateLimitKey = `post:create:${user?.id}`;
    if (!rateLimiter.check(rateLimitKey, RateLimits.POST_CREATE)) {
      const resetTime = rateLimiter.resetIn(rateLimitKey);
      setFormError(`You're creating posts too quickly. Please try again in ${formatTimeRemaining(resetTime)}.`);
      return;
    }

    // Sanitize inputs
    const cleanTitle = stripHTML(form.title.trim());
    const cleanContent = sanitizeRichText(form.content.trim());

    if (!cleanTitle || !cleanContent) {
      setFormError("Invalid content detected. Please check your input.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    let imageUrls: string[] = [];

    if (imageFiles.length > 0) {
      // Upload all images
      for (const file of imageFiles) {
        if (file.size > 5 * 1024 * 1024) {
          setFormError(`Image "${file.name}" must be smaller than 5MB.`);
          setSubmitting(false);
          return;
        }

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filePath = `${user?.id ?? "public"}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setFormError(`Image upload failed: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);
        
        if (publicData?.publicUrl) {
          imageUrls.push(publicData.publicUrl);
        }
      }
    }

    const { error } = await supabase.from("posts").insert([
      {
        title: cleanTitle,
        content: cleanContent,
        category: form.category,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        author_id: user?.id ?? ADMIN_USER_ID,
        author_name: user?.user_metadata?.username ?? "Admin",
      },
    ]);

    if (error) {
      setFormError(error.message);
    } else {
      // Clear rate limit on success
      rateLimiter.clear(rateLimitKey);
      setForm({ title: "", content: "", category: "" });
      setImageFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchPosts();
    }

    setSubmitting(false);
  };

  const displayedPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  const formatDate = (iso?: string) => {
    if (!iso) return "Unknown date";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "Unknown date";
    return parsed.toLocaleDateString();
  };

  return (
    <main className="page-container">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-secondary)' }}>
            Wheelchair Racing Blog
          </h1>
          <p style={{ color: 'var(--color-text-body)' }}>
            Training notes, race reports, and stories from the community.
          </p>
        </header>

        {/* Edit Post Form */}
        {user?.id === ADMIN_USER_ID && editingPostId && (
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-secondary)' }}>
                Edit Post
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--color-text-body)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Cancel
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleEditPost}>
              <div>
                <label className="label">
                  Title
                </label>
                <input
                  className="input-field"
                  name="title"
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  type="text"
                  value={editForm.title}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Content
                </label>
                <textarea
                  className="input-field"
                  name="content"
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={5}
                  value={editForm.content}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Category
                </label>
                <select
                  className="input-field"
                  name="category"
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  value={editForm.category}
                  required
                >
                  <option value="">Select category</option>
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'var(--color-text-body)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                >
                  Update Post
                </button>
              </div>
            </form>
          </section>
        )}

        {user?.id === ADMIN_USER_ID && (
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-secondary)' }}>
              Add New Post
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label">
                  Title
                </label>
                <input
                  className="input-field"
                  name="title"
                  onChange={handleChange}
                  type="text"
                  value={form.title}
                  required
                />
              </div>
              <div>
                <label className="label">
                  Content
                </label>
                <textarea
                  className="input-field"
                  name="content"
                  onChange={handleChange}
                  rows={5}
                  value={form.content}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label">
                    Category
                  </label>
                  <select
                    className="input-field"
                    name="category"
                    onChange={handleChange}
                    value={form.category}
                    required
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <input
                    ref={fileInputRef}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                    onChange={handleFileChange}
                    type="file"
                    multiple
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-text-body)', opacity: 0.8 }}>
                    Optional; select multiple images (JPG/PNG up to 5MB each). Perfect for route maps and race photos!
                  </p>
                  {imageFiles.length > 0 && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-body)' }}>
                      📸 {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
              {formError && <p className="text-sm" style={{ color: '#C33' }}>{formError}</p>}
              <div className="flex justify-end">
                <button
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Posting..." : "Add Post"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-1 text-sm font-medium transition`}
                  style={isActive ? {
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-primary)'
                  } : {
                    backgroundColor: 'var(--color-white)',
                    color: 'var(--color-text-body)',
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.color = 'var(--color-text-body)';
                    }
                  }}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="card p-8 text-center" style={{ color: 'var(--color-text-body)' }}>
              Loading posts...
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="rounded-md px-4 py-3 text-sm" style={{ backgroundColor: '#FEE', border: '1px solid #FCC', color: '#C33' }}>
                  {fetchError}
                </div>
              )}

              {displayedPosts.length === 0 ? (
                <div className="card p-8 text-center" style={{ color: 'var(--color-text-body)' }}>
                  No posts to show yet. Check back soon!
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="card p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-y-2 text-sm">
                        <span 
                          className="rounded-full px-3 py-1" 
                          style={{ backgroundColor: 'rgba(245, 124, 0, 0.1)', color: 'var(--color-primary)' }}
                        >
                          {post.category || "Uncategorized"}
                        </span>
                        <div className="flex items-center gap-3" style={{ color: 'var(--color-text-body)' }}>
                          <span>{formatDate(post.created_at)}</span>
                          {user?.id === ADMIN_USER_ID && (
                            <>
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="font-medium transition-colors"
                                style={{ color: 'var(--color-primary)' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                aria-label="Edit post"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="font-medium transition-colors"
                                style={{ color: '#C33' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                aria-label="Delete post"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold" style={{ color: 'var(--color-secondary)' }}>
                        {post.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-line" style={{ color: 'var(--color-text-body)' }}>
                        {post.content}
                      </p>

                      {/* Display multiple images if available, otherwise fallback to single image */}
                      {post.image_urls && post.image_urls.length > 0 ? (
                        <div className={`mt-4 grid gap-2 ${
                          post.image_urls.length === 1 ? 'grid-cols-1' :
                          post.image_urls.length === 2 ? 'grid-cols-2' :
                          post.image_urls.length === 3 ? 'grid-cols-3' :
                          'grid-cols-2 md:grid-cols-3'
                        }`}>
                          {post.image_urls.map((url, index) => (
                            <img
                              key={index}
                              alt={`${post.title} - Image ${index + 1}`}
                              className="h-48 w-full rounded-md object-cover cursor-pointer hover:opacity-90 transition"
                              src={url}
                              loading="lazy"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      ) : post.image_url ? (
                        <img
                          alt={post.title}
                          className="mt-4 h-56 w-full rounded-md object-cover"
                          src={post.image_url}
                          loading="lazy"
                        />
                      ) : null}

                      <div className="mt-4 text-sm text-gray-400">
                        {post.author_name
                          ? `Posted by ${post.author_name}`
                          : "Posted by Admin"}
                      </div>

                      {/* Like and Comment Actions */}
                      <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-200">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={likingPosts.has(post.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                            userLikes.has(post.id)
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          aria-label={userLikes.has(post.id) ? "Unlike post" : "Like post"}
                        >
                          <svg
                            className="w-5 h-5"
                            fill={userLikes.has(post.id) ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>

                        {/* Comments Button */}
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Toggle comments"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span className="font-medium">
                            {commentCounts[post.id] || 0} {commentCounts[post.id] === 1 ? "Comment" : "Comments"}
                          </span>
                        </button>

                        {/* Share Button */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/blog/${post.id}`;
                              const text = `Check out this blog post: ${post.title}`;
                              
                              if (navigator.share) {
                                navigator.share({
                                  title: post.title,
                                  text: text,
                                  url: url
                                }).catch(() => {});
                              } else {
                                // Fallback: copy to clipboard
                                navigator.clipboard.writeText(url).then(() => {
                                  alert('Link copied to clipboard!');
                                });
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors"
                            style={{ 
                              backgroundColor: 'var(--color-primary)', 
                              color: 'white'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                            aria-label="Share post"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                              />
                            </svg>
                            <span className="font-medium">Share</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 pt-4 space-y-4" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                          {/* Add Comment Form (only for logged-in users) */}
                          {user ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commentForm[post.id] || ""}
                                onChange={(e) =>
                                  setCommentForm(prev => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !commentSubmitting[post.id]) {
                                    handleCommentSubmit(post.id);
                                  }
                                }}
                                placeholder="Add a comment..."
                                className="input-field text-sm flex-1"
                              />
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={commentSubmitting[post.id] || !commentForm[post.id]?.trim()}
                                className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {commentSubmitting[post.id] ? "Posting..." : "Post"}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm italic" style={{ color: 'var(--color-text-body)' }}>
                              Please <Link to="/signin" style={{ color: 'var(--color-primary)' }} className="hover:underline">sign in</Link> to comment.
                            </p>
                          )}

                          {/* Comments List */}
                          {comments[post.id] && comments[post.id].length > 0 && (
                            <div className="space-y-3">
                              {comments[post.id].map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-gray-50 rounded-md p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {comment.author_name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">
                                        {formatDate(comment.created_at)}
                                      </span>
                                      {(user?.id === comment.user_id || user?.id === ADMIN_USER_ID) && (
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, post.id)}
                                          className="text-xs text-red-600 hover:text-red-800"
                                          aria-label="Delete comment"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Sign Up CTA - Only show if user is not logged in */}
        {!user && (
          <section className="mt-12 mb-8">
            <div className="card p-8 text-center" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-secondary)' }}>
                Want to Join the Conversation? 💬
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-body)' }}>
                Create a free account to like posts, leave comments, and share your own training stories 
                with the wheelchair racing community!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/signin" 
                  className="px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'var(--color-white)'
                  }}
                >
                  Sign Up Free
                </Link>
                <span style={{ color: 'var(--color-text-light)' }}>or</span>
                <Link 
                  to="/signin" 
                  className="hover:underline font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Sign in if you already have an account
                </Link>
              </div>
              <p className="text-sm mt-4" style={{ color: 'var(--color-text-light)' }}>
                ✓ No spam, ever  •  ✓ Free forever  •  ✓ Join 1,000+ athletes
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

// Wrap in React.memo to prevent unnecessary re-renders
// Already optimized with useMemo for displayedPosts and useCallback for handlers
export default React.memo(Blog);
