import BlogDeleteClient from "./BlogDeleteClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDeletePage(props: PageProps) {
  // Next 16: params is a Promise in server components, so we await it here
  const { slug } = await props.params;

  return <BlogDeleteClient slug={slug} />;
}
