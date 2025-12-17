// app/blog/sitemap.ts
export const runtime = "nodejs";

import { MetadataRoute } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://aileasebuilder.com";

  const { rows } = await pool.query(`
    SELECT slug, updated_at
    FROM blog_posts
    WHERE published_at IS NOT NULL
  `);

  return rows.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at || new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
