"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function PostHogFlagButtons() {
  useEffect(() => {
    posthog.onFeatureFlags(() => {
      if (posthog.getFeatureFlag("metrik-exp-3097cb15") === "test") {
        if (document.getElementById("metrik-exp-3097cb15-styles")) return;
        const style = document.createElement("style");
        style.id = "metrik-exp-3097cb15-styles";
        style.textContent =
          "button { background-color: #93c5fd !important; color: #1e3a5f !important; border-color: #93c5fd !important; }";
        document.head.appendChild(style);
      }
    });
  }, []);

  return null;
}
