"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) {
      // small delay for smooth appearance
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={
        "fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto " +
        "bg-surface border border-white/10 p-4 rounded-xl shadow-2xl " +
        "flex flex-col sm:flex-row items-center gap-4 " +
        "animate-in fade-in slide-in-from-bottom-4 duration-500"
      }
      role="alert"
    >
      <p className="text-sm text-gray-300 text-center sm:text-left">
        Мы используем файлы cookie для улучшения работы сайта и анализа трафика.
        Продолжая использовать сайт, вы даёте согласие на обработку данных.{" "}
        <Link href="/terms" className="underline text-accent hover:text-accentHover">
          Подробнее
        </Link>
      </p>

      <button
        onClick={accept}
        className="bg-accent text-dark px-6 py-2 rounded font-bold hover:bg-accentHover transition-colors shrink-0 cursor-pointer"
      >
        Хорошо
      </button>
    </div>
  );
}
