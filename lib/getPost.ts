import fs from "fs";
import path from "path";
import { marked } from "marked";

/**
 * Load ALL posts (even scheduled ones).
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

    // ➜ BACKWARD COMPATIBILITY FIX: Ensure new fields exist
    return {
      slug,
      publish_at: data.publish_at ?? null,
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",
      ...data,
    };
  });
}

/**
 * Load ONE post (admin + public)
 * Includes rendered HTML from markdown.
 */
export function getPost(slug: string) {
  const filePath = path.join(process.cwd(), "content/posts", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // ➜ BACKWARD COMPATIBILITY FIX
  const finalPost = {
    publish_at: post.publish_at ?? null,
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
    ...post,
    html: marked.parse(post.content || ""),
  };

  return finalPost;
}
