import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { withTranslation } from 'react-i18next';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen overflow-hidden px-6 py-16 text-emerald-50">
          <div className="mx-auto max-w-xl rounded-2xl border border-red-500/35 bg-red-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20">
              <AlertTriangle className="h-7 w-7 text-red-300" />
            </div>
            <h1 className="text-2xl font-black text-red-200">{t('shared.errorBoundary.title')}</h1>
            <p className="mt-2 text-sm text-red-100/80">
              {t('shared.errorBoundary.description')}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-full border border-red-400/40 bg-red-500/25 px-5 py-2.5 font-semibold text-red-100 transition hover:bg-red-500/35"
            >
              {t('shared.errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(AppErrorBoundary);
