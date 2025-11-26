import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "content/posts");

// -----------------------------
// DELETE POST
// -----------------------------
export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid slug" },
        { status: 400 }
      );
    }

    const filePath = path.join(postsDir, `${slug}.json`);

    // Does file exist?
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Delete the file
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
