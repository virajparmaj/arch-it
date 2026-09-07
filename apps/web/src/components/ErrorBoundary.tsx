import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Arch It could not render', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="app-error" role="alert">
          <h1>We couldn’t open the atlas.</h1>
          <p>Reload the page to try again.</p>
          <button className="primary-button" onClick={() => window.location.reload()}>Reload page</button>
        </main>
      )
    }
    return this.props.children
  }
}
