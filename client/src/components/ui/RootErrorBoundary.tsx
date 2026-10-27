import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { hardResetApp } from '../../utils/serviceWorkerKillSwitch';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isResetting: boolean;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    isResetting: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RootErrorBoundary] Uncaught application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = async () => {
    this.setState({ isResetting: true });
    await hardResetApp();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-screen min-h-dvh bg-[#FFFCF5] flex items-center justify-center p-4 sm:p-6 text-center selection:bg-mint selection:text-forest">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-forest/15 shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-forest">
                  {isChunkError ? 'Update Available / Network Interruption' : 'Application Error'}
                </h1>
                <p className="text-xs text-forest/70 font-medium">
                  {isChunkError
                    ? 'A new version was published or network connection was interrupted.'
                    : 'The interface encountered an unexpected error.'}
                </p>
              </div>
            </div>

            {/* Human-readable message */}
            <div className="p-3.5 rounded-2xl bg-cream/70 border border-forest/10 text-xs text-forest/90 leading-relaxed">
              {this.state.error?.message || 'An unknown error occurred while rendering the app.'}
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-2xl bg-forest hover:bg-forest-dark active:scale-[0.98] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                disabled={this.state.isResetting}
                onClick={this.handleHardReset}
                className="w-full py-2.5 px-4 rounded-2xl bg-cream border border-forest/20 hover:bg-forest/5 active:scale-[0.98] text-forest text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-forest/70" />
                <span>{this.state.isResetting ? 'Clearing cache...' : 'Clear Cache & Fresh Start (SW Reset)'}</span>
              </button>
            </div>

            {/* Collapsible diagnostic details */}
            <div className="pt-2 border-t border-forest/10">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="text-[11px] font-semibold text-forest/60 hover:text-forest flex items-center gap-1 transition"
              >
                <span>Technical details</span>
                {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[10px] font-mono text-gray-700 max-h-40 overflow-auto whitespace-pre-wrap leading-tight">
                  <div className="font-bold text-red-600 mb-1">
                    {this.state.error?.name}: {this.state.error?.message}
                  </div>
                  <div>{this.state.error?.stack}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2 text-gray-500">
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
