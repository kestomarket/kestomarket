// Auto-added by Metrik so injected analytics calls typecheck.
export {};

declare global {
  interface Window {
    metrik?: {
      track: (event: string, props?: Record<string, unknown>) => void;
      getFlag?: (key: string) => string | boolean | null;
      onVariants?: (cb: () => void) => void;
      reset?: () => void;
    };
    posthog?: {
      getFeatureFlag?: (key: string) => string | boolean | undefined;
      capture?: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}
