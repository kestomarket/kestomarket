"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function ExperimentBackground() {
  useEffect(() => {
    const variant = posthog.getFeatureFlag("metrik-exp-8d576d2b");
    if (variant === "test") {
      document.body.style.backgroundColor = '#000';
    }
  }, []);

  return null;
}
