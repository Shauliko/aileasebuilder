"use client";

export default async function BlogDeletePage({ params }: any) {
  const { slug } = await params; // NEXT 16 REQUIREMENT

  const deletePost = async () => {
    const res = await fetch("/api/admin/blog-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert("Deleted");
      window.location.href = "/admin/blog-list";
    } else {
      alert("Error deleting: " + (data.error || "Unknown error"));
    }
  };

  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Delete Post</h1>

      <p className="mb-6">
        Are you sure you want to delete: <strong>{slug}</strong>?
      </p>

      <button
        onClick={deletePost}
        className="bg-red-600 text-white px-4 py-2"
      >
        YES, DELETE
      </button>
    </main>
  );
}
