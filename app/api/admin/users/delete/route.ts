import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

// --------------------------------------------
// DELETE USER (ADMIN ONLY)
// --------------------------------------------
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetId } = await req.json();

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userId" },
        { status: 400 }
      );
    }

    if (targetId === userId) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    await clerkClient.users.deleteUser(targetId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
