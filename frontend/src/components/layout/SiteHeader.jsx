import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function SiteHeader({
  title = 'Dev Path',
  onBrandClick,
  center,
  right,
  className = '',
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
    } else {
      navigate('/');
    }

    if (location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }

    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('app:scroll-to-top'));
    });
  };

  return (
    <header className={`app-navbar sticky top-0 z-40 border-b border-emerald-500/20 transition-all duration-300 ${scrolled ? 'shadow-[var(--shadow-soft)]' : ''} ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-y-3 px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={handleBrandClick}
          aria-label={t('shared.siteHeader.ariaGoHome')}
          className="group flex min-w-0 flex-1 items-center gap-2 text-left transition hover:opacity-90 sm:gap-3"
        >
          <BrandLogo
            className="h-9 w-[145px] shrink-0 text-emerald-200 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-10 sm:w-[170px]"
          />
          {title !== 'Dev Path' ? (
            <span className="truncate text-base font-black tracking-tight text-emerald-200 sm:text-xl">
              {title}
            </span>
          ) : null}
        </button>

        {center ? <div className="hidden lg:flex items-center">{center}</div> : null}
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {right}
        </div>
      </div>
    </header>
  );
}
