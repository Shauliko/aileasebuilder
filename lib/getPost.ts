import fs from "fs";
import path from "path";
import { marked } from "marked";

/**
 * Load ALL posts (even drafts & scheduled ones).
 * Used by admin.
 */
export function getAllPosts() {
  const postsDir = path.join(process.cwd(), "content/posts");
  const files = fs.readdirSync(postsDir);

  return files.map((file) => {
    const slug = file.replace(".json", "");
    const data = JSON.parse(
      fs.readFileSync(path.join(postsDir, file), "utf-8")
    );

    // ============================
    // BACKWARD-COMPATIBILITY FIXES
    // ============================

    return {
      slug,

      // NEW: published_at (draft support)
      published_at: data.published_at ?? null,

      // Already existing scheduled publish date
      publish_at: data.publish_at ?? null,

      // SEO fields (ensure they exist)
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",

      ...data,
    };
  });
}

/**
 * Load ONE post (admin + public)
 * Includes rendered HTML.
 */
export function getPost(slug: string) {
  const filePath = path.join(process.cwd(), "content/posts", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // ============================
  // BACKWARD-COMPATIBILITY FIXES
  // ============================
  const finalPost = {
    slug,

    published_at: post.published_at ?? null,
    publish_at: post.publish_at ?? null,

    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",

    ...post,

    // Render markdown → HTML
    html: marked.parse(post.content || ""),
  };

  return finalPost;
}
