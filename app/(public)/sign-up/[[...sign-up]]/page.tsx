"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050816]">
      <div className="p-6 bg-[#0d1224] rounded-xl border border-white/10 shadow-md">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    </div>
  );
}
