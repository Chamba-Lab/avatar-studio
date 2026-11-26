import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './Icon.tsx';

type State = { failed: boolean };

/**
 * Last line of defence: an unexpected error shows a way out instead of a blank page. The usual
 * cause is a new deploy, which replaces the editor's code file while an old page is still open.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-accent/50 text-accent">
          <Icon name="rotate" size={40} />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Reload the page to start again. Your photo was never uploaded, so nothing was shared.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-[52px] rounded-[18px] bg-accent px-6 text-[15px] font-bold text-on-accent active:scale-[0.98]"
        >
          Reload
        </button>
      </main>
    );
  }
}
