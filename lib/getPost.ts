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
    return { slug, ...data };
  });
}

/**
 * Load ONE post (admin + public wrapper)
 * Includes rendered HTML from markdown.
 */
export function getPost(slug: string) {
  const filePath = path.join(process.cwd(), "content/posts", `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const html = marked.parse(post.content || "");

  return {
    ...post,
    html,
  };
}
