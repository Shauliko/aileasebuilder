"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816]">
      <div className="bg-[#0d1224] border border-white/10 rounded-xl p-6 shadow-lg">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
