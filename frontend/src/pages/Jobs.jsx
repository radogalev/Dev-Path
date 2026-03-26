import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  ArrowLeft,
  ArrowRight, 
  Building2,
  TrendingUp,
  Filter
} from 'lucide-react';
import { learningRoadmaps } from '../data/roadmaps';
import PageShell from '../components/layout/PageShell';
import { professionMatchesPath } from '../data/pathProfessions';
import UserHeaderActions from '../components/layout/UserHeaderActions';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function Jobs() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all');
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Get user data from localStorage
  const currentUser = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }, []);

  const userSelectedPath = currentUser?.selectedPath || 'frontend';

  // Fetch jobs from backend and filter by user's selected path
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const response = await fetch(`${BACKEND_URL}/jobs`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter jobs by profession matching the user's selected path
          const filtered = Array.isArray(data.jobs)
            ? data.jobs.filter((job) => professionMatchesPath(job.profession, userSelectedPath))
            : [];

          // Add a match percentage to each job
          const jobsWithMatch = filtered.map((job) => ({
            ...job,
            match: 85 + Math.floor(Math.random() * 15), // 85-99% match
          }));

          setAllJobs(jobsWithMatch);
        } else {
          setAllJobs([]);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setAllJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [userSelectedPath]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Filter jobs by type and user's selected path
  const filteredJobs = useMemo(() => {
    let jobs = allJobs;
    
    if (filterType !== 'all') {
      jobs = jobs.filter(job => {
        const jobType = job.job_type || job.type || '';
        return jobType.toLowerCase() === filterType.toLowerCase();
      });
    }
    
    return jobs;
  }, [allJobs, filterType]);

  return (
    <PageShell
      withHeader
      headerProps={{
        onBrandClick: () => navigate('/dashboard'),
        right: (
          <UserHeaderActions
            currentUser={currentUser}
            onDashboard={() => navigate('/dashboard')}
            onLogout={handleLogout}
          />
        ),
      }}
      contentClassName="max-w-7xl mx-auto px-6 py-8"
    >
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="app-button-secondary mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('jobs.back')}
            </button>
            <h2 className="text-4xl font-black mb-2">
              {t('jobs.title')}
            </h2>
            <p className="text-[var(--text-muted)] text-lg">
              {t('jobs.subtitle', { path: learningRoadmaps[userSelectedPath]?.title || 'selected path' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="app-card p-4">
              <div className="text-2xl font-black text-emerald-300 mb-1">{allJobs.length}</div>
              <div className="text-emerald-100/65 text-sm">{t('jobs.stats.matching')}</div>
            </div>
            <div className="app-card p-4">
              <div className="text-2xl font-black text-emerald-300 mb-1">{allJobs.filter(j => j.match >= 90).length}</div>
              <div className="text-emerald-100/65 text-sm">{t('jobs.stats.highMatch')}</div>
            </div>
            <div className="app-card p-4">
              <div className="text-2xl font-black text-emerald-300 mb-1">{allJobs.filter(j => (j.job_type || j.type || '').toLowerCase() === 'full-time').length}</div>
              <div className="text-emerald-100/65 text-sm">{t('jobs.stats.fullTime')}</div>
            </div>
            <div className="app-card p-4">
              <div className="text-2xl font-black text-emerald-300 mb-1">All</div>
              <div className="text-emerald-100/65 text-sm">{t('jobs.stats.locations')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-emerald-100/60" />
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'bg-emerald-500/10 text-emerald-100/65 hover:text-emerald-100'
              }`}
            >
              {t('jobs.filters.all')}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('full-time')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterType === 'full-time'
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'bg-emerald-500/10 text-emerald-100/65 hover:text-emerald-100'
              }`}
            >
              {t('jobs.filters.fullTime')}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('internship')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterType === 'internship'
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'bg-emerald-500/10 text-emerald-100/65 hover:text-emerald-100'
              }`}
            >
              {t('jobs.filters.internship')}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('contract')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterType === 'contract'
                  ? 'bg-emerald-500 text-emerald-950'
                  : 'bg-emerald-500/10 text-emerald-100/65 hover:text-emerald-100'
              }`}
            >
              {t('jobs.filters.contract')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobsLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block rounded-full border-4 border-emerald-500/30 border-t-emerald-500 w-12 h-12 animate-spin mb-4"></div>
                  <p className="text-emerald-100/65">{t('jobs.states.loading')}</p>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-emerald-500/40" />
                  <p className="text-emerald-100/65 text-lg">{t('jobs.states.emptyLine1', { filter: filterType === 'all' ? 'your path' : `${filterType} positions` })}</p>
                  <p className="text-emerald-100/50 mt-2">{t('jobs.states.emptyLine2')}</p>
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="app-card group p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 flex-1">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/12 text-3xl">
                        {job.logo || '💼'}
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-emerald-300">
                          {job.title}
                        </h3>
                        <div className="mb-2 flex items-center gap-2 text-sm text-emerald-100/65">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                      <TrendingUp className="w-3 h-3" />
                      {t('jobs.jobCard.match', { value: job.match })}
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-emerald-100/72">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                    <div className="flex flex-col gap-2 text-sm text-emerald-100/65">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location || t('jobs.jobCard.fallbackLocation')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary || t('jobs.jobCard.fallbackSalary')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                          {job.job_type || job.type || t('jobs.filters.fullTime')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('jobs.jobCard.postedRecently')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
                      className="app-button-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all group-hover:gap-3"
                      aria-label={`${t('jobs.jobCard.viewDetails')} ${job.title}`}
                    >
                      {t('jobs.jobCard.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
    </PageShell>
  );
}
