"use client";

import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white">
      <div className="p-6 rounded-xl bg-[#0a0f1e] shadow-xl">
        <SignIn
          routing="path"
          path="/admin/login"
          signUpUrl="/sign-up"
          afterSignInUrl="/admin"
        />
      </div>
    </div>
  );
}
