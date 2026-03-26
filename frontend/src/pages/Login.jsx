import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Chrome, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PathSelection from '../components/PathSelection';
import PageShell from '../components/layout/PageShell';
import SiteHeader from '../components/layout/SiteHeader';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function CodePathwayLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setAuthUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    sendLoginCredentials();
  };

  const sendLoginCredentials = async () => {
    setLoading(true);
    try{
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email,
          password: password
        })
       });
       const data = await response.json();
       
       if (data.success) {
         setAuthUser(data.user);
        
         
         
         // Check if it's first login
         if (data.user.isFirstLogin) {
           setUserData(data.user);
           setShowPathSelection(true);
         } else {
           navigate('/dashboard');
         }
       } else {
         setError(data.message || t('login.errors.loginFailed'));
       }
    }
    catch(error){
      setError(t('login.errors.serverUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  const handlePathSelection = async (selectedPath) => {
    try {
      const response = await fetch(`${BACKEND_URL}/update-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userData.id,
          selectedPath: selectedPath
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setAuthUser(data.user);
        navigate('/dashboard');
      } else {
        setError('Failed to update path selection');
      }
    } catch (error) {
      console.error('Path selection error:', error);
      setError('Unable to save path selection. Please try again.');
    }
  }

  // If showing path selection, render that component
  if (showPathSelection && userData) {
    return <PathSelection onSelectPath={handlePathSelection} userName={userData.fullName} />;
  }

  return (
    <PageShell
      className="text-[var(--text-primary)]"
      contentClassName="mx-auto w-full max-w-md px-4 py-10"
    >
      <SiteHeader onBrandClick={() => navigate('/')} className="mb-6" />
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-emerald-200 via-green-300 to-lime-300 bg-clip-text text-transparent">
            {t('login.title')}
          </h1>
          <p className="text-[var(--text-muted)]">{t('login.subtitle')}</p>
        </div>

        <div className="app-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('login.form.emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input py-3 pl-12 pr-4"
                  placeholder={t('login.form.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('login.form.passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="app-input py-3 pl-12 pr-12"
                  placeholder={t('login.form.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('login.form.hidePassword') : t('login.form.showPassword')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-200/60 transition-colors hover:text-emerald-100"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-emerald-600 bg-slate-900 text-emerald-500"
                />
                <span className="text-sm text-emerald-100/65 transition-colors group-hover:text-emerald-100/85">
                  {t('login.form.rememberMe')}
                </span>
              </label>
              <a href="#" className="text-sm text-emerald-300 transition-colors hover:text-emerald-200">
                {t('login.form.forgotPassword')}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="app-button-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {loading ? t('login.form.submitting') : t('login.form.submit')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--surface-primary)] px-4 text-emerald-100/55">{t('login.social.divider')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="app-button-secondary flex items-center justify-center gap-2 py-3 font-semibold">
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </button>
            <button className="app-button-secondary flex items-center justify-center gap-2 py-3 font-semibold">
              <Chrome className="w-5 h-5" />
              <span>Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-emerald-100/65">
              {t('login.bottom.noAccount')}{' '}
              <Link to="/signin" className="font-semibold text-emerald-300 transition-colors hover:text-emerald-200">
                {t('login.bottom.signUpFree')}
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {t('login.bottom.termsPrefix')}{' '}
          <a href="#" className="text-emerald-100/65 transition-colors hover:text-emerald-100">{t('login.bottom.terms')}</a>
          {' '}and{' '}
          <a href="#" className="text-emerald-100/65 transition-colors hover:text-emerald-100">{t('login.bottom.privacy')}</a>
        </p>
      </div>
    </PageShell>
  );
}