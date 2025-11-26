"use client";

import { useState } from "react";
import { marked } from "marked";

export default function BlogNewPage() {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState(""); // TAGS
  const [featured, setFeatured] = useState(false); // FEATURED
  const [publishAt, setPublishAt] = useState(""); // SCHEDULED
  const [content, setContent] = useState("");
  const [loadingAI, setLoadingAI] = useState(false); // AI LOADING
  const [imagePrompt, setImagePrompt] = useState(""); // IMAGE PROMPT
  const [loadingImage, setLoadingImage] = useState(false); // IMAGE LOADING

  // === NEW FOR B10 ===
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [loadingSEO, setLoadingSEO] = useState(false);

  const createPost = async () => {
    const res = await fetch("/api/admin/blog", {
      method: "POST",
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
        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
      }),
    });

    if (res.ok) {
      alert("Post created");
      setSlug("");
      setTitle("");
      setDate("");
      setCategory("");
      setTags("");
      setFeatured(false);
      setPublishAt("");
      setContent("");
      setMetaTitle("");
      setMetaDescription("");
    } else {
      alert("Error creating post");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body,
    });

    const data = await res.json();

    if (data.url) {
      setContent((prev) => prev + `\n![](${data.url})\n`);
    } else {
      alert("Upload failed");
    }
  };

  // ======================================================
  //           AI AUTO-GENERATE BLOG POST BUTTON
  // ======================================================
  const generateAI = async () => {
    try {
      setLoadingAI(true);

      const res = await fetch("/api/admin/generate-post", {
        method: "POST",
      });

      const data = await res.json();

      if (data.error) {
        alert("AI Error");
        return;
      }

      setTitle(data.title || "");
      setCategory(data.category || "");
      setTags((data.tags || []).join(", "));
      setContent(data.content || "");

      setSlug(
        (data.title || "ai-post")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );

      setDate(new Date().toISOString().slice(0, 10));
    } catch {
      alert("AI generation failed");
    } finally {
      setLoadingAI(false);
    }
  };

  // ======================================================
  //           AI IMAGE GENERATION (B9)
  // ======================================================
  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      alert("Enter an image prompt");
      return;
    }

    try {
      setLoadingImage(true);

      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Image generation failed");
        return;
      }

      setContent((prev) => prev + `\n![](${data.url})\n`);
      setImagePrompt("");
    } catch {
      alert("Image generation failed");
    } finally {
      setLoadingImage(false);
    }
  };

  // ======================================================
  //           AI SEO METADATA GENERATION (B10)
  // ======================================================
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
      <h1 className="text-3xl font-bold mb-8">Create Blog Post</h1>

      {/* ================= AI TEXT BUTTON ================ */}
      <button
        onClick={generateAI}
        className="mb-6 bg-purple-600 text-white px-4 py-2 rounded"
        disabled={loadingAI}
      >
        {loadingAI ? "Generating..." : "Generate Blog Post with AI"}
      </button>

      {/* ================= AI IMAGE GENERATION ================ */}
      <div className="mb-6 space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Enter image prompt (ex: 'professional real estate contract illustration')"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
        />
        <button
          onClick={generateImage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loadingImage}
        >
          {loadingImage ? "Generating Image..." : "Generate Image with AI"}
        </button>
      </div>

      {/* ================= AI SEO METADATA ================ */}
      <div className="mb-6 space-y-2 border p-4 rounded">
        <h2 className="font-semibold text-lg">SEO Metadata</h2>

        <input
          className="border p-2 w-full"
          placeholder="Meta Title (SEO title)"
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
        {/* LEFT SIDE — EDITOR */}
        <div className="space-y-4">
          <input
            className="border p-2 w-full"
            placeholder="slug example: my-first-post"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

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
            placeholder="Category (ex: news, updates, legal)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          {/* TAGS */}
          <input
            className="border p-2 w-full"
            placeholder="Tags (comma separated: landlord, lease, real-estate)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          {/* FEATURED */}
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
            <label className="text-sm font-medium block">
              Publish At (optional)
            </label>
            <input
              className="border p-2 w-full"
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave empty to publish immediately. Set a future date/time to
              schedule.
            </p>
          </div>

          <textarea
            className="border p-2 w-full h-80"
            placeholder="Markdown content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 w-full"
          />

          <button
            onClick={createPost}
            className="bg-black text-white px-4 py-2"
          >
            Publish
          </button>
        </div>

        {/* RIGHT SIDE — LIVE PREVIEW */}
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
