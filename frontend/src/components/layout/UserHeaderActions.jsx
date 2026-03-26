import { Flame, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UserHeaderActions({
  currentUser,
  onDashboard,
  onLogout,
  showDashboard = true,
  showStreak = false,
  streakText = 'Streak',
  extra,
}) {
  const { t } = useTranslation();

  return (
    <>
      {showDashboard ? (
        <button
          type="button"
          onClick={onDashboard}
          className="hidden text-emerald-100/80 transition hover:text-emerald-100 font-semibold sm:inline-flex"
        >
          {t('shared.userHeaderActions.dashboard')}
        </button>
      ) : null}
      {showStreak ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 sm:px-4 sm:py-2">
          <Flame className="h-4 w-4 text-emerald-300 sm:h-5 sm:w-5" />
          <span className="hidden font-bold text-emerald-100 sm:inline">{streakText}</span>
        </div>
      ) : null}
      <div aria-label="User avatar" className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500/20 text-sm font-bold sm:h-10 sm:w-10 sm:text-base">
        {currentUser?.fullName?.[0] || t('shared.userHeaderActions.fallbackUserLetter')}
      </div>
      {extra}
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-2 rounded-full border border-red-500/45 bg-red-500/15 px-3 py-1.5 font-semibold text-red-300 transition hover:bg-red-500/25 sm:px-4 sm:py-2"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">{t('shared.userHeaderActions.logout')}</span>
      </button>
    </>
  );
}
