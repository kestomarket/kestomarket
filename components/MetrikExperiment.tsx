"use client";

import { useEffect } from "react";

export function MetrikExperiment() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.getFeatureFlag("metrik-exp-bbb80bee") === "test") {
        document.body.style.backgroundColor = "white";
        document.body.style.background = "white";
      }
    });
  }, []);

  return null;
}
