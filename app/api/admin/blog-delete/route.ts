// app/api/admin/blog-delete/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

// Validate slug characters
function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON body
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid slug" },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // Check existence + delete
    const result = await sql`
      DELETE FROM blog_posts
      WHERE slug = ${slug}
      RETURNING slug
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Server error deleting post" },
      { status: 500 }
    );
  }
}
