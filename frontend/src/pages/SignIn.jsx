import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Github, Chrome, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageShell from '../components/layout/PageShell';
import SiteHeader from '../components/layout/SiteHeader';
import ScrollReveal from '../components/animations/ScrollReveal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function CodePathwaySignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const passwordRequirements = [
    { id: 1, text: t('signIn.passwordRequirements.r1'), met: formData.password.length >= 8 },
    { id: 2, text: t('signIn.passwordRequirements.r2'), met: /\d/.test(formData.password) },
    { id: 3, text: t('signIn.passwordRequirements.r3'), met: /[A-Z]/.test(formData.password) },
    { id: 4, text: t('signIn.passwordRequirements.r4'), met: formData.password === formData.confirmPassword && formData.password.length > 0 }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { success, message } = await sendUserCredentials();
      if (success) {
        navigate('/check-email', {
          state: { email: formData.email },
        });
      } else if (message) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendUserCredentials = async () =>{
     try {
      const response = await fetch(`${BACKEND_URL}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          selectedPath: ''
        })
      });
      const data = await response.json();
      return {
        success: response.ok && data.success !== false,
        message: data.message || 'Unable to create account. Please try again.',
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        success: false,
        message: 'Unable to connect to server. Please try again.',
      };
    }
  }

  return (
    <PageShell
      className="text-[var(--text-primary)]"
      contentClassName="mx-auto w-full max-w-2xl px-4 py-10"
    >
      <SiteHeader onBrandClick={() => navigate('/')} className="mb-6" />
      <div className="w-full">
        <ScrollReveal className="mb-8 text-center" threshold={0.2}>
          <h1 className="mb-2 bg-gradient-to-r from-emerald-200 via-green-300 to-lime-300 bg-clip-text text-4xl font-black text-transparent">
            {t('signIn.title')}
          </h1>
          <p className="text-[var(--text-muted)]">{t('signIn.subtitle')}</p>
        </ScrollReveal>

        <ScrollReveal className="app-card p-8" threshold={0.12} delay={80}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('signIn.form.fullName')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="app-input py-3 pl-12 pr-4"
                  placeholder={t('signIn.form.fullNamePlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('signIn.form.email')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="app-input py-3 pl-12 pr-4"
                  placeholder={t('signIn.form.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('signIn.form.password')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="app-input py-3 pl-12 pr-12"
                  placeholder={t('signIn.form.passwordPlaceholder')}
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

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[var(--text-secondary)]">
                {t('signIn.form.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200/60">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="app-input py-3 pl-12 pr-12"
                  placeholder={t('signIn.form.confirmPasswordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('login.form.hidePassword') : t('login.form.showPassword')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-200/60 transition-colors hover:text-emerald-100"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {formData.password.length > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">{t('signIn.passwordRequirements.title')}</p>
                <div className="stagger-children grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center gap-2">
                      <CheckCircle2 
                        className={`w-4 h-4 ${req.met ? 'text-emerald-300' : 'text-emerald-900'}`}
                      />
                      <span className={`text-xs ${req.met ? 'text-emerald-100/80' : 'text-emerald-100/45'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="app-button-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50"
              
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {loading ? t('signIn.form.submitting') : t('signIn.form.submit')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-500/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--surface-primary)] px-4 text-emerald-100/55">{t('signIn.social.divider')}</span>
            </div>
          </div>

          <div className="stagger-children grid grid-cols-2 gap-4">
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
              {t('signIn.bottom.hasAccount')}{' '}
              <Link to="/login" className="app-link-hover font-semibold text-emerald-300 transition-colors hover:text-emerald-200">
                {t('signIn.bottom.signIn')}
              </Link>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal as="p" className="mt-6 text-center text-sm text-[var(--text-muted)]" threshold={0.2} delay={140}>
          {t('signIn.bottom.termsPrefix')}{' '}
          <a href="#" className="app-link-hover text-emerald-100/65 transition-colors hover:text-emerald-100">{t('signIn.bottom.terms')}</a>
          {' '}and{' '}
          <a href="#" className="app-link-hover text-emerald-100/65 transition-colors hover:text-emerald-100">{t('signIn.bottom.privacy')}</a>
        </ScrollReveal>
      </div>
    </PageShell>
  );
}