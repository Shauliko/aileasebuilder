export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;

  publish_at: string | null;       // scheduled publish date
  published_at: string | null;     // NEW: actual published date (null = draft)

  content: string;
  html?: string;                   // rendered HTML

  meta_title: string;
  meta_description: string;
}
