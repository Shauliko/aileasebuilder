import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const postsDir = path.join(process.cwd(), "content/posts");

// Validate slug characters
function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

// -----------------------------
// DELETE POST (ADMIN ONLY)
// -----------------------------
export async function DELETE(request: NextRequest) {
  try {
    // 🔒 AUTH — Protect route
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse body
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid slug" },
        { status: 400 }
      );
    }

    // Sanitize
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    const filePath = path.join(postsDir, `${slug}.json`);

    // Check existence
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete
    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Server error deleting post" },
      { status: 500 }
    );
  }
}
