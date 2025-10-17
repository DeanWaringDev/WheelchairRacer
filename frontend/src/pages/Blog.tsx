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

const ADMIN_USER_ID = "5bc2da58-8e69-4779-ba02-52e6182b9668";
const STORAGE_BUCKET = "post-images";

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
      setPosts(data ?? []);
      
      // After fetching posts, fetch comment counts for each post
      if (data) {
        const counts: Record<string, number> = {};
        
        for (const post of data) {
          const { count } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          counts[post.id] = count || 0;
        }
        
        setCommentCounts(counts);
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
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, likes_count: Math.max((p.likes_count || 0) - 1, 0) } : p
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
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
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
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        author_id: user?.id ?? ADMIN_USER_ID,
        author_name: user?.user_metadata?.username ?? "Admin",
      },
    ]);

    if (error) {
      setFormError(error.message);
    } else {
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
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Wheelchair Racing Blog
          </h1>
          <p className="text-gray-600">
            Training notes, race reports, and stories from the community.
          </p>
        </header>

        {user?.id === ADMIN_USER_ID && (
          <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Post
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="title"
                  onChange={handleChange}
                  type="text"
                  value={form.title}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="content"
                  onChange={handleChange}
                  rows={5}
                  value={form.content}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <p className="mt-1 text-xs text-gray-500">
                    Optional; select multiple images (JPG/PNG up to 5MB each). Perfect for route maps and race photos!
                  </p>
                  {imageFiles.length > 0 && (
                    <p className="mt-1 text-sm text-gray-700">
                      📸 {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex justify-end">
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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
                  className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
                  }`}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Loading posts...
            </div>
          ) : (
            <>
              {fetchError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fetchError}
                </div>
              )}

              {displayedPosts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                  No posts to show yet. Check back soon!
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-lg border border-gray-200 p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-y-2 text-sm text-gray-500">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          {post.category || "Uncategorized"}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>{formatDate(post.created_at)}</span>
                          {user?.id === ADMIN_USER_ID && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-800 font-medium transition-colors"
                              aria-label="Delete post"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold text-gray-900">
                        {post.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-line text-gray-700">
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
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      ) : post.image_url ? (
                        <img
                          alt={post.title}
                          className="mt-4 h-56 w-full rounded-md object-cover"
                          src={post.image_url}
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
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
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
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={commentSubmitting[post.id] || !commentForm[post.id]?.trim()}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {commentSubmitting[post.id] ? "Posting..." : "Post"}
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Please <Link to="/signin" className="text-blue-600 hover:underline">sign in</Link> to comment.
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
      </div>
    </main>
  );
};

export default Blog;
