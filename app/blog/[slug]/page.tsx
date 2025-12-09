export const revalidate = 10;

import { getPost, getAllPosts } from "@/lib/getPost";
import Link from "next/link";

interface BlogPostProps {
  params: { slug: string };
}

/** STATIC PARAMS */
export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

/** METADATA */
export async function generateMetadata(props: any) {
  const { slug } = await props.params; // REQUIRED in Next 16

  const post = getPost(slug);

  // If post doesn't exist → 404 metadata
  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post does not exist.",
    };
  }

  // ================================
  // DRAFT + FUTURE SCHEDULED BLOCK
  // ================================
  const now = Date.now();

  const isDraft =
    post.published_at === null &&
    (post.publish_at === null || post.publish_at === "");

  const isScheduledFuture =
    post.published_at === null &&
    post.publish_at &&
    new Date(post.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) {
    return {
      title: "Post Not Found",
      description: "This blog post does not exist.",
    };
  }

  const seoTitle =
    post.meta_title && post.meta_title.trim() !== ""
      ? post.meta_title
      : post.title;

  const seoDescription =
    post.meta_description && post.meta_description.trim() !== ""
      ? post.meta_description
      : (
          post.content
            ?.replace(/[#*_>\-\[\]\(\)`]/g, "")
            ?.slice(0, 160) || ""
        );

  return {
    title: seoTitle,
    description: seoDescription,
  };
}

/** PAGE */
export default async function BlogPostPage(props: any) {
  const { slug } = await props.params; // REQUIRED in Next 16

  const post = getPost(slug);

  // If file doesn't exist → 404 page
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">Not Found</h1>
        <p>Post does not exist.</p>
      </main>
    );
  }

  // ================================
  // DRAFT + FUTURE SCHEDULED BLOCK
  // ================================
  const now = Date.now();

  const isDraft =
    post.published_at === null &&
    (post.publish_at === null || post.publish_at === "");

  const isScheduledFuture =
    post.published_at === null &&
    post.publish_at &&
    new Date(post.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) {
    return (
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">Not Found</h1>
        <p>Post does not exist.</p>
      </main>
    );
  }

  // ================================
  // AUTO-PUBLISH SCHEDULED POSTS
  // (Rendered correctly even though JSON is unchanged)
  // ================================
  const effectiveDate =
    post.published_at ||
    (post.publish_at && new Date(post.publish_at).toISOString()) ||
    post.date;

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 text-sm mb-2">{effectiveDate}</p>

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
          {post.tags.map((tag: string) => (
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
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </main>
  );
}
