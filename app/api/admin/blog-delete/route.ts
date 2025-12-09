import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { trackEventServer as trackEvent } from "@/lib/analytics/posthog-server";

function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM blog_posts
      WHERE slug = ${slug};
    `;

    // Optional: check if anything was deleted
    if ((result.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    trackEvent("admin_blog_deleted", userId, {
      slug,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/blog-delete error:", error);
    return NextResponse.json(
      { error: "Server error deleting post" },
      { status: 500 }
    );
  }
}
