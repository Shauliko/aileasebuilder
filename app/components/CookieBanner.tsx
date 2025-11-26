"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "yes");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 z-50 border-t border-white/10">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          We use cookies to improve your experience. By clicking OK, you agree.
        </p>

        <button
          onClick={accept}
          className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}
