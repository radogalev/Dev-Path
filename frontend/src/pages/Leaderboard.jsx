import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Medal, Trophy } from 'lucide-react';
import PageShell from '../components/layout/PageShell';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${BACKEND_URL}/learning/leaderboard?limit=100`);
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || t('leaderboard.errors.loadFailed'));
        }

        if (!cancelled) {
          setRows(Array.isArray(data.leaderboard) ? data.leaderboard : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setRows([]);
          setError(loadError?.message || t('leaderboard.errors.loadFailed'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const topThree = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <PageShell
      withHeader
      headerProps={{
        onBrandClick: () => navigate('/'),
        right: (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="app-button-secondary px-4 py-2 text-sm font-semibold"
          >
            {t('shared.userHeaderActions.dashboard')}
          </button>
        ),
      }}
      contentClassName="mx-auto w-full max-w-6xl px-6 py-10"
    >
      <div className="mb-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="app-link-hover inline-flex items-center gap-2 text-sm text-emerald-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('leaderboard.back')}
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
          <Trophy className="h-4 w-4" />
          {t('leaderboard.title')}
        </div>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {topThree.map((row, index) => (
          <article key={row.userId} className="app-card p-5">
            <p className="text-xs uppercase tracking-wide text-emerald-100/60">{t('leaderboard.topLabel', { rank: index + 1 })}</p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-black text-emerald-200">
              <Medal className="h-5 w-5 text-emerald-300" />
              {row.fullName}
            </h2>
            <p className="mt-1 text-sm text-emerald-100/70">{row.selectedPath || t('leaderboard.noPathSelected')}</p>
            <p className="mt-4 text-3xl font-black text-emerald-300">{row.totalScore}</p>
            <p className="text-xs text-emerald-100/60">{t('leaderboard.totalScore')}</p>
          </article>
        ))}
      </section>

      <section className="app-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-emerald-500/10 text-emerald-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.rank')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.user')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.path')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.lecturesCompleted')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.tasksSolved')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.theoryTestsSolved')}</th>
                <th className="px-4 py-3 font-semibold">{t('leaderboard.table.totalScore')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-5 text-emerald-100/70" colSpan={7}>{t('leaderboard.loading')}</td>
                </tr>
              ) : null}

              {!loading && error ? (
                <tr>
                  <td className="px-4 py-5 text-red-300" colSpan={7}>{error}</td>
                </tr>
              ) : null}

              {!loading && !error && rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-emerald-100/70" colSpan={7}>{t('leaderboard.empty')}</td>
                </tr>
              ) : null}

              {!loading && !error && rows.map((row) => (
                <tr key={row.userId} className="border-t border-emerald-500/15">
                  <td className="px-4 py-3 font-bold text-emerald-300">#{row.rank}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-100">{row.fullName}</td>
                  <td className="px-4 py-3 text-emerald-100/80">{row.selectedPath || '-'}</td>
                  <td className="px-4 py-3 text-emerald-100/80">{row.lessonsCompleted}</td>
                  <td className="px-4 py-3 text-emerald-100/80">{row.tasksSolved}</td>
                  <td className="px-4 py-3 text-emerald-100/80">{row.theoryTestsSolved}</td>
                  <td className="px-4 py-3 text-lg font-black text-emerald-300">{row.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
