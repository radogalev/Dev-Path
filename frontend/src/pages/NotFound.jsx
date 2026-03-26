import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative">
        <SiteHeader onBrandClick={() => navigate('/dashboard')} />

        <main className="mx-auto max-w-2xl px-6 py-20">
          <section className="app-card rounded-2xl p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">{t('notFound.code')}</p>
            <h1 className="mt-3 text-4xl font-black">{t('notFound.title')}</h1>
            <p className="mt-3 text-emerald-100/70">{t('notFound.description')}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="app-button-primary mt-8 inline-flex items-center gap-2 px-6 py-3 font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('notFound.back')}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
