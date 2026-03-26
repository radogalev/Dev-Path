import { useEffect, useRef, useState } from 'react';
import { Globe, Settings, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsMenu({
  openUpward = false,
  compact = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const isLight = theme === 'light';
  const isBulgarian = i18n.language === 'bg';

  const menuPositionClass = openUpward ? 'bottom-full mb-2' : 'mt-2';

  return (
    <div ref={menuRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-primary)] ${
          compact
            ? 'h-12 w-12 justify-center rounded-full shadow-[var(--shadow-soft)]'
            : 'rounded-lg px-3 py-2'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('shared.settings.open', { defaultValue: 'Open settings' })}
      >
        <Settings className="h-4 w-4" />
        {!compact ? <span className="hidden text-sm font-semibold sm:inline">{t('shared.settings.title', { defaultValue: 'Settings' })}</span> : null}
        {!compact ? <ChevronDown className="h-4 w-4" /> : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute right-0 z-[80] w-72 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-secondary)] p-3 text-[var(--text-primary)] shadow-[var(--shadow-soft)] ${menuPositionClass}`}
        >
          <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <Sun className="h-4 w-4" />
              {t('shared.settings.theme', { defaultValue: 'Theme' })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isLight
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-emerald-500/25 bg-transparent text-emerald-100/70 hover:text-emerald-100'
                }`}
              >
                <Sun className="h-4 w-4" />
                {t('shared.settings.light', { defaultValue: 'Light' })}
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  !isLight
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-emerald-500/25 bg-transparent text-emerald-100/70 hover:text-emerald-100'
                }`}
              >
                <Moon className="h-4 w-4" />
                {t('shared.settings.dark', { defaultValue: 'Dark' })}
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[var(--border-primary)] bg-[var(--surface-primary)] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <Globe className="h-4 w-4" />
              {t('shared.settings.language', { defaultValue: 'Language' })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  !isBulgarian
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-emerald-500/25 bg-transparent text-emerald-100/70 hover:text-emerald-100'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('bg')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isBulgarian
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-emerald-500/25 bg-transparent text-emerald-100/70 hover:text-emerald-100'
                }`}
              >
                Български
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
