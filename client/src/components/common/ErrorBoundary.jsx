import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('B.C.A. Application Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Une erreur inattendue est survenue</h1>
            <p className="text-sm text-slate-500 mb-6">
              L'application a rencontré un problème d'affichage momentané. Veuillez rafraîchir la page pour reprendre normalement.
            </p>
            {this.state.error?.message && (
              <pre className="text-left bg-slate-100 p-3 rounded-xl text-xs text-slate-700 overflow-x-auto mb-6 max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition"
            >
              <RefreshCw className="w-4 h-4" /> Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
