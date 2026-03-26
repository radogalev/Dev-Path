import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, X } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import SiteHeader from '../components/layout/SiteHeader';

export default function CheckInbox() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [isClosing, setIsClosing] = useState(false);
  const [closeCountdown, setCloseCountdown] = useState(4);

  useEffect(() => {
    if (!isClosing) return undefined;

    const countdownInterval = setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const closeTimeout = setTimeout(() => {
      window.open('', '_self');
      window.close();
      navigate('/login');
    }, 4000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(closeTimeout);
    };
  }, [isClosing, navigate]);

  const handleClosePage = () => {
    setIsClosing(true);

    // Immediate close attempt for browsers that allow script-initiated close.
    window.open('', '_self');
    window.close();
  };

  return (
    <PageShell
      className="text-[var(--text-primary)]"
      contentClassName="mx-auto w-full max-w-2xl px-4 py-10"
    >
      <SiteHeader onBrandClick={() => navigate('/')} className="mb-6" />

      <div className="app-card p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10">
          <Mail className="h-10 w-10 text-emerald-300" />
        </div>

        <h1 className="mb-3 bg-gradient-to-r from-emerald-200 via-green-300 to-lime-300 bg-clip-text text-4xl font-black text-transparent">
          Check Your Email Inbox
        </h1>

        <p className="mx-auto mb-2 max-w-xl text-emerald-100/75">
          We sent you a verification link. After you click it in your email, you can close this page.
        </p>

        {email ? (
          <p className="mb-6 text-sm text-emerald-200/80">
            Sent to: <span className="font-semibold text-emerald-200">{email}</span>
          </p>
        ) : (
          <p className="mb-6 text-sm text-emerald-200/70">
            Check the email address you used during sign up.
          </p>
        )}

        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-left text-sm text-emerald-100/75">
          <p className="mb-2 font-semibold text-emerald-200">What happens next:</p>
          <p>1. Open the verification email.</p>
          <p>2. Click the verification link.</p>
          <p>3. Come back here and click "I Checked My Email" to close this page.</p>
        </div>

        {isClosing && (
          <p className="mt-4 text-sm text-emerald-200/80">
            Closing page automatically in {closeCountdown}s...
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="app-button-secondary px-5 py-2.5 text-sm font-semibold"
          >
            Back to Login
          </button>
          <button
            onClick={handleClosePage}
            disabled={isClosing}
            className="app-button-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
          >
            {isClosing ? 'Closing...' : 'I Checked My Email'}
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </PageShell>
  );
}
