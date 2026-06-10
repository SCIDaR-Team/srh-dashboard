/**
 * ErrorBoundary — last-resort catch for rendering errors anywhere in the
 * app. Shows a friendly card with a retry button (full reload) so users
 * can recover without losing the URL.
 *
 * React still doesn't provide a hooks API for error boundaries, so this
 * stays as a class component.
 */

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Override the default fallback UI. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Surface in dev tools; integrate with a real reporter later.
    // eslint-disable-next-line no-console
    console.error('[SRH] caught render error', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)

    return (
      <div className="flex min-h-screen items-center justify-center bg-page p-6">
        <div className="srh-card max-w-md p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose/40 text-danger">
            <AlertCircle size={22} />
          </div>
          <h2 className="font-heading text-lg font-bold text-ink">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted">
            The dashboard ran into an unexpected error while rendering this page.
          </p>
          <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-light-green/40 p-3 text-left text-xs text-ink">
            {error.message}
          </pre>
          <button
            type="button"
            onClick={() => {
              this.reset()
              window.location.reload()
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </div>
    )
  }
}
