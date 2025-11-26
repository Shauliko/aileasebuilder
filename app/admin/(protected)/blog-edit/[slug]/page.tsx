"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

export default function BlogEditPage({ params }: any) {
  const { slug } = params;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false); // FEATURED
  const [publishAt, setPublishAt] = useState(""); // SCHEDULED
  const [content, setContent] = useState("");

  // NEW: For Draft Mode (published_at)
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // === SEO ===
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loadingSEO, setLoadingSEO] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/blog?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setTitle(data.post.title);
          setDate(data.post.date);
          setCategory(data.post.category || "");
          setTags((data.post.tags || []).join(", "));
          setFeatured(!!data.post.featured);

          // Scheduling
          setPublishAt(data.post.publish_at || "");

          // Draft Mode
          setPublishedAt(data.post.published_at ?? null);

          setContent(data.post.content);

          // SEO
          setMetaTitle(data.post.meta_title || "");
          setMetaDescription(data.post.meta_description || "");
        }
      });
  }, [slug]);

  // ======================================================
  // SAVE DRAFT (published_at = null)
  // ======================================================
  const saveDraft = async () => {
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        date,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,

        publish_at: null,
        published_at: null, // DRAFT

        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
      }),
    });

    if (res.ok) alert("Draft saved");
    else alert("Error saving draft");
  };

  // ======================================================
  // PUBLISH NOW (published_at = now)
  // ======================================================
  const publishNow = async () => {
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        date,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,

        publish_at: null,
        published_at: new Date().toISOString(), // PUBLISH NOW

        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
      }),
    });

    if (res.ok) alert("Post published");
    else alert("Error publishing");
  };

  // ======================================================
  // UPDATE SCHEDULE (publish_at = datetime)
  // ======================================================
  const updateSchedule = async () => {
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        date,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,

        publish_at: publishAt || null,
        published_at: null, // Scheduled posts are NOT published yet

        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
      }),
    });

    if (res.ok) alert("Schedule updated");
    else alert("Error updating schedule");
  };

  // ======================================================
  // SAVE (General Save - does NOT publish)
  // Preserves original behavior for compatibility
  // ======================================================
  const save = async () => {
    const res = await fetch("/api/admin/blog", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug,
        title,
        date,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,

        publish_at: publishAt || null,
        published_at: publishedAt, // preserve existing state

        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
      }),
    });

    if (res.ok) alert("Updated");
    else alert("Error updating");
  };

  // ============================
  //      AI SEO GENERATION
  // ============================
  const generateSEO = async () => {
    try {
      setLoadingSEO(true);

      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          tags,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("SEO generation failed");
        return;
      }

      setMetaTitle(data.meta_title || "");
      setMetaDescription(data.meta_description || "");
    } catch {
      alert("SEO generation failed");
    } finally {
      setLoadingSEO(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

      {/* === SEO BLOCK === */}
      <div className="mb-6 space-y-2 border p-4 rounded">
        <h2 className="font-semibold text-lg">SEO Metadata</h2>

        <input
          className="border p-2 w-full"
          placeholder="Meta Title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
        />

        <textarea
          className="border p-2 w-full h-24"
          placeholder="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />

        <button
          onClick={generateSEO}
          className="bg-green-700 text-white px-4 py-2 rounded"
          disabled={loadingSEO}
        >
          {loadingSEO ? "Generating SEO..." : "Generate SEO with AI"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT — EDITOR */}
        <div className="space-y-4">
          <input
            className="border p-2 w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {/* FEATURED CHECKBOX */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span>Featured Post</span>
          </label>

          {/* SCHEDULED PUBLISH DATE */}
          <div className="space-y-1">
            <label className="text-sm font-medium block">Publish At</label>
            <input
              type="datetime-local"
              className="border p-2 w-full"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave empty to publish immediately.
            </p>
          </div>

          <textarea
            className="border p-2 w-full h-80"
            placeholder="Markdown content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* ======================================================
              BUTTONS
            ====================================================== */}

          {/* Save (does not change publish state) */}
          <button
            onClick={save}
            className="bg-gray-700 text-white px-4 py-2 mr-3"
          >
            Save
          </button>

          {/* Save Draft */}
          <button
            onClick={saveDraft}
            className="bg-blue-600 text-white px-4 py-2 mr-3"
          >
            Save Draft
          </button>

          {/* Publish Now */}
          <button
            onClick={publishNow}
            className="bg-black text-white px-4 py-2 mr-3"
          >
            Publish Now
          </button>

          {/* Update Schedule */}
          <button
            onClick={updateSchedule}
            className="bg-orange-600 text-white px-4 py-2"
          >
            Update Schedule
          </button>
        </div>

        {/* RIGHT — PREVIEW */}
        <div className="border p-4 rounded bg-white overflow-auto prose max-w-none">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: marked.parse(content || ""),
            }}
          />
        </div>
      </div>
    </main>
  );
}
