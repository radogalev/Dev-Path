import React, { useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Code, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Flame,
  LogOut,
  Building2,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  Star
} from 'lucide-react';
import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';

// Helper function to parse job description from database format
const parseJobDescription = (description) => {
  if (!description) {
    return { intro: '', responsibilities: [], requirements: [], niceToHave: [] };
  }

  const sections = {
    intro: '',
    responsibilities: [],
    requirements: [],
    niceToHave: [],
  };

  const lines = description.split('\n').map(line => line.trim()).filter(line => line);
  let currentSection = 'intro';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.toLowerCase().includes('responsibilities')) {
      currentSection = 'responsibilities';
      continue;
    }
    if (line.toLowerCase().includes('requirements') && !line.toLowerCase().includes('nice')) {
      currentSection = 'requirements';
      continue;
    }
    if (line.toLowerCase().includes('nice to have')) {
      currentSection = 'niceToHave';
      continue;
    }

    if (line.startsWith('-')) {
      const item = line.substring(1).trim();
      if (currentSection === 'responsibilities') {
        sections.responsibilities.push(item);
      } else if (currentSection === 'requirements') {
        sections.requirements.push(item);
      } else if (currentSection === 'niceToHave') {
        sections.niceToHave.push(item);
      }
    } else if (currentSection === 'intro') {
      sections.intro += (sections.intro ? ' ' : '') + line;
    }
  }

  return sections;
};

export default function JobDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { t } = useTranslation();
  
  // Get job from location state or find by id (fallback)
  const job = location.state?.job || {
    id: id,
    title: t('jobDetails.fallback.jobOpening'),
    company: t('jobDetails.fallback.companyName'),
    logo: '💼',
    location: t('jobDetails.fallback.location'),
    job_type: t('jobs.filters.fullTime'),
    match: 85,
    description: t('jobDetails.fallback.description'),
    salary: t('jobs.jobCard.fallbackSalary'),
    posted_date: new Date().toISOString(),
  };

  // Parse description into structured sections
  const jobDescription = useMemo(() => parseJobDescription(job.description), [job.description]);

  // Get user data from localStorage
  const currentUser = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleApply = () => {
    navigate('/apply', { state: { job } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative">
        <SiteHeader
          onBrandClick={() => navigate('/dashboard')}
          right={(
            <>
              <button onClick={() => navigate('/dashboard')} className="text-emerald-100/80 transition hover:text-emerald-100 font-semibold">{t('shared.userHeaderActions.dashboard')}</button>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2">
                <Flame className="w-5 h-5 text-emerald-300" />
                <span className="font-bold text-emerald-100">{t('shared.userHeaderActions.streak')}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500/20 font-bold">
                {currentUser?.fullName?.[0] || 'U'}
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-red-500/45 bg-red-500/15 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-500/25">
                <LogOut className="w-4 h-4" />
                <span>{t('shared.userHeaderActions.logout')}</span>
              </button>
            </>
          )}
        />

        <div className="max-w-5xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/jobs')}
            className="mb-6 flex items-center gap-2 text-emerald-100/65 transition-colors group hover:text-emerald-100"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {t('jobDetails.back')}
          </button>

          <div className="app-card mb-6 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/12 text-5xl">
                  {job.logo}
                </div>
                <div>
                  <h1 className="text-4xl font-black mb-2">{job.title}</h1>
                  <div className="mb-4 flex items-center gap-4 text-lg text-emerald-100/82">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-4 py-2 text-sm font-semibold text-emerald-300">
                      {job.job_type || job.type || t('jobs.filters.fullTime')}
                    </span>
                    <span className="flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300">
                      <TrendingUp className="w-4 h-4" />
                      {t('jobs.jobCard.match', { value: job.match })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleApply}
                className="app-button-primary flex items-center gap-2 px-8 py-4 text-lg font-bold"
              >
                {t('jobDetails.applyNow')}
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-8 border-t border-emerald-500/20 pt-6">
              <div className="flex items-center gap-2 text-emerald-100/82">
                <DollarSign className="w-5 h-5 text-emerald-300" />
                <span className="font-semibold">{job.salary || t('jobs.jobCard.fallbackSalary')}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100/82">
                <Calendar className="w-5 h-5 text-emerald-300" />
                <span>{t('jobDetails.postedRecently')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="app-card p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-emerald-300" />
                  {t('jobDetails.aboutRole')}
                </h2>
                <p className="mb-6 leading-relaxed text-emerald-100/80">
                  {jobDescription.intro || job.description}
                </p>

                {jobDescription.responsibilities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-emerald-200 mb-3">{t('jobDetails.responsibilities')}</h3>
                    <ul className="space-y-2">
                      {jobDescription.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-3 text-emerald-100/80">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="app-card p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-300" />
                  {t('jobDetails.requirements')}
                </h2>
                <ul className="space-y-3 mb-6">
                  {jobDescription.requirements.length > 0 ? (
                    jobDescription.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-emerald-100/80">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                        {req}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-3 text-emerald-100/80">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                        {t('jobDetails.fallbackRequirement1')}
                      </li>
                      <li className="flex items-start gap-3 text-emerald-100/80">
                        <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                        </div>
                        {t('jobDetails.fallbackRequirement2')}
                      </li>
                    </>
                  )}
                </ul>

                {jobDescription.niceToHave.length > 0 && (
                  <div>
                    <h3 className="font-bold text-emerald-200 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {t('jobDetails.niceToHave')}
                    </h3>
                    <ul className="space-y-2">
                      {jobDescription.niceToHave.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-emerald-100/80">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                            <Star className="w-3 h-3 text-yellow-400" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {job.tags && job.tags.length > 0 && (
                <div className="app-card p-6">
                  <h3 className="text-xl font-bold mb-4">{t('jobDetails.requiredSkills')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/12 px-3 py-2 text-sm font-semibold text-emerald-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="app-card p-6">
                <h3 className="text-xl font-bold mb-4">{t('jobDetails.aboutCompany', { company: job.company || t('jobDetails.companyDefault') })}</h3>
                <div className="mb-4 text-sm leading-relaxed text-emerald-100/80">
                  {t('jobDetails.companyDescription')}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-100/65">
                    <Building2 className="w-4 h-4" />
                    <span>{t('jobDetails.industry')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-100/65">
                    <Users className="w-4 h-4" />
                    <span>{t('jobDetails.growingTeam')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-100/65">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || t('jobDetails.multiLocations')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="app-button-primary flex w-full items-center justify-center gap-2 px-6 py-4 text-lg font-bold"
              >
                {t('jobDetails.applyPosition')}
                <ExternalLink className="w-5 h-5" />
              </button>

              <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-green-500/8 p-4 text-center text-sm text-emerald-100/80">
                {t('jobDetails.tip')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
