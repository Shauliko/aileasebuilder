import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protect all /admin/* routes
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // auth is a function → returns a Promise → must await
  const session = await auth(); 
  const userId = session.userId;

  if (isProtectedRoute(req) && !userId) {
    return session.redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/",
  ],
};
