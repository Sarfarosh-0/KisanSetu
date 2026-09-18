import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./style.css";

// ---------------------------------------------------------------------------
// Sentry — client-side crash reporting
// Reads VITE_SENTRY_DSN at build time. No-ops silently when the var is absent
// (i.e. local development without a DSN configured).
// ---------------------------------------------------------------------------
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE, // "development" | "production"
    integrations: [
      Sentry.browserTracingIntegration(),
      // Session replay: captures 10% of sessions, 100% of sessions with errors
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Trace 10% of transactions for performance monitoring (free tier friendly)
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
