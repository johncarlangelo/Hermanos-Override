import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unexpected renderer crashes and shows a recoverable screen
 * instead of an unresponsive white window.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Renderer crashed:', error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#06080d] text-slate-100 p-6 text-center">
        <div className="rounded-3xl p-1 bg-white/[0.02] border border-rose-500/30 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
          <div className="rounded-[calc(1.5rem-2px)] bg-[#0e1017]/95 p-8 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z"
                />
              </svg>
            </div>
            <h1 className="text-base font-bold text-white">Something went wrong</h1>
            <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
              The interface hit an unexpected error. Your library data is safe on disk.
            </p>
            {this.state.error && (
              <pre className="mt-3 w-full text-left text-[10px] font-mono text-slate-500 bg-black/40 border border-white/10 rounded-xl p-3 overflow-x-auto max-h-24 whitespace-pre-wrap break-all">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-500/15 border border-sky-500/40 hover:bg-sky-500/25 transition-colors cursor-pointer"
            >
              Reload Hermanos Override
            </button>
          </div>
        </div>
      </div>
    );
  }
}
