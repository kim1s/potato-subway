"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      aria-label="뒤로 가기"
      className="text-lg font-semibold text-stone-900 leading-none -ml-1 px-1"
    >
      ‹
    </button>
  );
}
