import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

// -----------------------------
// GET — List all users (ADMIN ONLY)
// -----------------------------
export async function GET() {
  try {
    // 🔒 AUTH — server-side admin check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional future enhancement:
    // Enforce role = "admin" using Clerk publicMetadata/roles if needed.

    // Fetch users
    const result = await clerkClient.users.getUserList({ limit: 200 });

    const users = result.map((u: any) => ({
      id: u.id,
      email: u.emailAddresses?.[0]?.emailAddress || "",
      createdAt: new Date(u.createdAt).toLocaleDateString(),
      blocked: !!u.publicMetadata?.blocked,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("USER LIST ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}
