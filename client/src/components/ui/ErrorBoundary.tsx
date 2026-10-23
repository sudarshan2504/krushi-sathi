import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-dark-text">Something went wrong</h2>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                An unexpected interface error occurred. Your crop plans and farmer profile data remain safe in the database.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="py-3 px-6 rounded-2xl bg-forest hover:bg-forest-dark text-white text-xs font-bold transition flex items-center justify-center gap-2 mx-auto shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
