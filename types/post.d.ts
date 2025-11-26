export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  publish_at: string | null;        // SCHEDULING SUPPORT
  content: string;
  html?: string;                    // MARKDOWN RENDERED HTML

  // =======================
  // NEW — SEO METADATA
  // =======================
  meta_title: string;
  meta_description: string;
}
