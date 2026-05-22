import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught error inside boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
          <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-lg">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-300 mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-gray-50 mb-2">Unexpected visual crash</h2>
            <p className="text-sm text-gray-550 dark:text-gray-400 mb-6">
              An unexpected client-side error occurred. {this.state.error?.message || ''}
            </p>
            <Button variant="primary" size="md" className="w-full" onClick={this.handleReset}>
              Reload Main Screen
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
