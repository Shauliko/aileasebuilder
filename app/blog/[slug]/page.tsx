export const revalidate = 10;

import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/getPost";

// In Next 16 dynamic routes, params is a Promise
type PageParams = {
  params: Promise<{ slug: string }>;
};

// --------- STATIC PARAMS ----------
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

// --------- METADATA ----------
export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params; // ✅ unwrap Promise

  const post = await getPost(slug);

  const notFoundMeta = {
    title: "Post Not Found",
    description: "This blog post does not exist.",
  };

  if (!post) return notFoundMeta;

  const now = Date.now();

  const isDraft =
    post.published_at === null &&
    (!post.publish_at || post.publish_at === "");

  const isScheduledFuture =
    post.publish_at && new Date(post.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) return notFoundMeta;

  const seoTitle =
    post.meta_title && post.meta_title.trim() !== ""
      ? post.meta_title
      : post.title;

  const seoDescription =
    post.meta_description && post.meta_description.trim() !== ""
      ? post.meta_description
      : (post.content || "")
          .replace(/[#*_>\-\[\]\(\)`]/g, "")
          .slice(0, 160);

  return {
    title: seoTitle,
    description: seoDescription,
  };
}

// --------- PAGE ----------
export default async function BlogPostPage({ params }: PageParams) {
  const { slug } = await params; // ✅ unwrap Promise

  const post = await getPost(slug);

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">Not Found</h1>
        <p>Post does not exist.</p>
      </main>
    );
  }

  const now = Date.now();

  const isDraft =
    post.published_at === null &&
    (!post.publish_at || post.publish_at === "");

  const isScheduledFuture =
    post.publish_at && new Date(post.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">Not Found</h1>
        <p>Post does not exist.</p>
      </main>
    );
  }

    const effectiveDate = (() => {
    const raw = post.published_at || post.publish_at || post.date;
    if (!raw) return null;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;

    return d.toISOString();
  })();

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>

      {effectiveDate && (
        <p className="text-gray-600 text-sm mb-2">
          {new Date(effectiveDate).toLocaleDateString()}
        </p>
      )}

      {post.category && (
        <p className="text-gray-500 text-sm mb-3">
          Category:{" "}
          <Link
            href={`/blog/category/${post.category}`}
            className="underline text-blue-400"
          >
            {post.category}
          </Link>
        </p>
      )}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded-md"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <article
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </main>
  );
}
