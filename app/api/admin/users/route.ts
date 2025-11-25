import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await clerkClient.users.getUserList({ limit: 200 });

  const users = result.map((u: any) => ({
    id: u.id,
    email: u.emailAddresses?.[0]?.emailAddress || "",
    createdAt: new Date(u.createdAt).toLocaleDateString(),
    blocked: !!u.publicMetadata?.blocked,
  }));

  return NextResponse.json({ users });
}
