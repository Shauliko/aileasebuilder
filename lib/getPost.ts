// lib/getPost.ts
import { marked } from "marked";
import { sql } from "@/lib/db";

type DBPost = {
  slug: string;
  title: string;
  date: string;
  category: string | null;
  tags: string[] | null;
  featured: boolean | null;
  publish_at: string | null;
  published_at: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
};

// Normalize DB → internal format
function normalize(post: DBPost) {
  return {
    ...post,
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: post.featured ?? false,
    publish_at: post.publish_at ?? null,
    published_at: post.published_at ?? null,
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
  };
}

// ---------------------------------------------------
// GET ALL POSTS
// ---------------------------------------------------
export async function getAllPosts() {
  const rows = await sql`
    SELECT
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,
      published_at,
      content,
      meta_title,
      meta_description
    FROM blog_posts
    ORDER BY date DESC
  `;

  return (rows as unknown as DBPost[]).map(normalize);
}

// ---------------------------------------------------
// GET ONE POST
// ---------------------------------------------------
export async function getPost(slug: string) {
  const rows = await sql`
    SELECT
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,
      published_at,
      content,
      meta_title,
      meta_description
    FROM blog_posts
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const list = rows as unknown as DBPost[];
  if (list.length === 0) return null;

  const post = normalize(list[0]);

  return {
    ...post,
    html: marked.parse(post.content || ""),
  };
}
