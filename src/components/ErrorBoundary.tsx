import React, { ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled component error:", error, errorInfo);
    // Report to Sentry (no-op when Sentry is not initialised / DSN absent)
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
    this.setState({ errorInfo });
  }


  public handleReset = () => {
    try {
      localStorage.removeItem("kisansetu_active_tab");
      localStorage.removeItem("kisansetu_user_role");
    } catch {
      // Ignore localStorage errors
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public handleSoftRecover = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center p-4 sm:p-6 text-slate-900 selection:bg-emerald-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                The application encountered an unexpected runtime state. Your data is safe in KisanEscrow.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-[11px] font-mono text-slate-700 max-h-32 overflow-y-auto break-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleSoftRecover}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

