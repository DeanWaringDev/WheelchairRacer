// WheelchairRacer/frontend/src/pages/Blog.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  author_id?: string | null;
  author_name?: string | null;
  created_at?: string;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.category) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    let imageUrl: string | null = null;

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        setFormError("Image must be smaller than 5MB.");
        setSubmitting(false);
        return;
      }

      const extension = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${user?.id ?? "public"}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, imageFile, {
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
      imageUrl = publicData?.publicUrl ?? null;
    }

    const { error } = await supabase.from("posts").insert([
      {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        image_url: imageUrl,
        author_id: user?.id ?? ADMIN_USER_ID,
        author_name: user?.user_metadata?.username ?? "Admin",
      },
    ]);

    if (error) {
      setFormError(error.message);
    } else {
      setForm({ title: "", content: "", category: "" });
      setImageFile(null);
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
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional; JPG/PNG up to 5MB.
                  </p>
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
                        <span>{formatDate(post.created_at)}</span>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold text-gray-900">
                        {post.title}
                      </h3>

                      <p className="mt-3 whitespace-pre-line text-gray-700">
                        {post.content}
                      </p>

                      {post.image_url && (
                        <img
                          alt={post.title}
                          className="mt-4 h-56 w-full rounded-md object-cover"
                          src={post.image_url}
                        />
                      )}

                      <div className="mt-4 text-sm text-gray-400">
                        {post.author_name
                          ? `Posted by ${post.author_name}`
                          : "Posted by Admin"}
                      </div>
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
