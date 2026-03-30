"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("notariaprime-cookie-consent");
    if (!consent) {
      setVisible(true);
    } else if (consent === "accepted") {
      grantConsent();
    }
  }, []);

  function grantConsent() {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }

  function handleAccept() {
    localStorage.setItem("notariaprime-cookie-consent", "accepted");
    grantConsent();
    setVisible(false);
  }

  function handleRefuse() {
    localStorage.setItem("notariaprime-cookie-consent", "refused");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            <strong>Cookies &amp; vie privee</strong> — NotariaPrime utilise Google Analytics pour
            mesurer l&apos;audience du site (pages visitees, nombre de visiteurs). Vos calculs restent
            100% locaux et ne sont jamais transmis.{" "}
            <a
              href="/confidentialite"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              En savoir plus
            </a>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleRefuse}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-md transition"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
