import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: targetId, blocked } = await req.json();

  if (!targetId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await clerkClient.users.updateUserMetadata(targetId, {
    publicMetadata: { blocked },
  });

  return NextResponse.json({ success: true });
}
