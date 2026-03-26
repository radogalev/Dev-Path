import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  MapPin,
  PlayCircle,
  TrendingUp,
  Trophy,
  Users,
  Video,
  BookOpen,
} from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import ScrollReveal from '../components/animations/ScrollReveal';
import { professionMatchesPath } from '../data/pathProfessions';
import UserHeaderActions from '../components/layout/UserHeaderActions';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [learningLoading, setLearningLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState({
    title: t('dashboard.cards.currentPath'),
    description: '',
    milestones: [],
  });
  const [dashboardProgress, setDashboardProgress] = useState({
    currentLecture: 1,
    tasksSolved: 0,
    shouldPromptHardTask: false,
  });
  const [hardChallenge, setHardChallenge] = useState(null);
  const [showHardChallengePrompt, setShowHardChallengePrompt] = useState(false);
  const [hardChallengeLoading, setHardChallengeLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    if (!currentUser?.id) return;

    fetch(`${BACKEND_URL}/user/${currentUser.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.user) return;
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
      })
      .catch((error) => {
        console.error('Failed to refresh user progress on dashboard:', error);
      });
  }, [currentUser?.id]);

  const userSelectedPath = currentUser?.selectedPath || 'frontend';
  const currentLecture = currentUser?.currentLecture || 1;

  useEffect(() => {
    if (!currentUser?.id) return;

    setLearningLoading(true);
    fetch(`${BACKEND_URL}/learning/dashboard/${currentUser.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.dashboard?.roadmap) {
          return;
        }
        setRoadmapData(data.dashboard.roadmap);
        setDashboardProgress(data.dashboard.progress || {});
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard learning data:', error);
      })
      .finally(() => setLearningLoading(false));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !dashboardProgress?.shouldPromptHardTask) {
      return;
    }

    const tasksSolved = Number(dashboardProgress?.tasksSolved || 0);
    const promptCacheKey = `hard-challenge-prompt:${currentUser.id}:${tasksSolved}`;
    if (localStorage.getItem(promptCacheKey) === 'shown') {
      return;
    }

    setHardChallengeLoading(true);
    fetch(`${BACKEND_URL}/learning/dashboard/hard-challenge/${currentUser.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success || !data.shouldPrompt || !data.challenge) {
          return;
        }

        setHardChallenge(data.challenge);
        setShowHardChallengePrompt(true);
      })
      .catch((error) => {
        console.error('Failed to fetch hard challenge prompt:', error);
      })
      .finally(() => {
        setHardChallengeLoading(false);
      });
  }, [currentUser?.id, dashboardProgress?.shouldPromptHardTask, dashboardProgress?.tasksSolved]);

  // Fetch and filter jobs based on user's selected path
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

          // Take top 3 jobs and add a match percentage
          const jobsWithMatch = filtered.slice(0, 3).map((job, index) => ({
            ...job,
            match: 85 + Math.floor(Math.random() * 15), // 85-99% match
          }));

          setFilteredJobs(jobsWithMatch);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setFilteredJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [userSelectedPath]);

  const totalLectures = roadmapData.milestones.reduce((sum, milestone) => sum + milestone.lectures.length, 0);
  const solvedCount = Math.max(0, Math.min((currentLecture || 1) - 1, totalLectures));

  const getStreak = () => {
    if (!currentUser?.lastActiveDate) return 0;
    const formatLocalDate = (value) => {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = formatLocalDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);
    const lastActive = currentUser.lastActiveDate;
    if (lastActive === today || lastActive === yesterdayStr) {
      return currentUser.streakCount || 0;
    }
    return 0;
  };

  const dayStreak = getStreak();

  const dismissHardChallengePrompt = () => {
    const tasksSolved = Number(dashboardProgress?.tasksSolved || 0);
    if (currentUser?.id && tasksSolved > 0) {
      const promptCacheKey = `hard-challenge-prompt:${currentUser.id}:${tasksSolved}`;
      localStorage.setItem(promptCacheKey, 'shown');
    }
    setShowHardChallengePrompt(false);
  };

  const getCurrentLectureInfo = () => {
    if (!roadmapData.milestones.length) {
      return {
        lecture: { id: currentLecture, title: t('dashboard.currentLecture.allComplete'), duration: '-', type: 'video' },
        milestone: { id: 0, title: t('dashboard.milestones.title') },
      };
    }

    for (const milestone of roadmapData.milestones) {
      const lecture = milestone.lectures.find((item) => item.id === currentLecture);
      if (lecture) return { lecture, milestone };
    }
    const lastMilestone = roadmapData.milestones[roadmapData.milestones.length - 1];
    const lastLecture = lastMilestone.lectures[lastMilestone.lectures.length - 1];
    return { lecture: lastLecture, milestone: lastMilestone };
  };

  const { lecture: activeLecture, milestone: activeMilestone } = getCurrentLectureInfo();
  const allCompleted = currentLecture > totalLectures;

  const startLecture = (lecture, milestone) => {
    navigate(`/lesson/${userSelectedPath}/${lecture.id}`, {
      state: {
        lecture,
        milestone,
        pathTitle: roadmapData.title,
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const iconByType = {
    video: Video,
    interactive: PlayCircle,
    project: Code,
  };

  const competitions = [
    { id: 1, title: 'Algorithm Sprint', endsIn: '2d 14h', participants: 1234, prize: '$500' },
    { id: 2, title: 'Frontend Challenge', endsIn: '5d 8h', participants: 892, prize: '$750' },
    { id: 3, title: 'Bug Hunt Blitz', endsIn: '12h', participants: 456, prize: '$250' },
  ];

  const events = [
    { id: 1, title: 'Web Dev Bootcamp', date: 'Feb 15, 2026', time: '6:00 PM', attendees: 234 },
    { id: 2, title: 'Code & Coffee Meetup', date: 'Feb 18, 2026', time: '10:00 AM', attendees: 45 },
    { id: 3, title: 'AI/ML Tech Talk', date: 'Feb 20, 2026', time: '7:30 PM', attendees: 567 },
  ];

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
            showDashboard={false}
            showStreak
            streakText={`${dayStreak} ${t('shared.userHeaderActions.streak').toLowerCase()}`}
          />
        ),
      }}
      contentClassName="mx-auto w-full max-w-7xl px-6 py-8"
    >
          {showHardChallengePrompt && hardChallenge ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
              <div className="w-full max-w-3xl rounded-2xl border border-emerald-400/30 bg-[#07150f] p-6 shadow-2xl">
                <div className="mb-3 inline-flex rounded-full border border-lime-400/40 bg-lime-500/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-lime-200">
                  Hard challenge unlocked
                </div>
                <h2 className="text-2xl font-black text-emerald-50">{hardChallenge.title || 'Runtime Hard Challenge'}</h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/85">{hardChallenge.prompt}</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-200/75">Language</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-100">{hardChallenge.language || 'JavaScript'}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase text-emerald-200/75">Difficulty</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-100">{hardChallenge.difficulty || 'Hard'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-emerald-100/85">
                  <p><span className="font-semibold text-emerald-100">Input:</span> {hardChallenge.inputDescription}</p>
                  <p><span className="font-semibold text-emerald-100">Output:</span> {hardChallenge.outputDescription}</p>
                  {Array.isArray(hardChallenge.constraints) && hardChallenge.constraints.length > 0 ? (
                    <div>
                      <p className="font-semibold text-emerald-100">Constraints:</p>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-emerald-100/80">
                        {hardChallenge.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={dismissHardChallengePrompt}
                    className="app-button-secondary px-4 py-2 text-sm font-semibold"
                  >
                    Maybe later
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dismissHardChallengePrompt();
                      navigate(`/lesson/${userSelectedPath}/${currentLecture}`);
                    }}
                    className="app-button-primary px-4 py-2 text-sm font-semibold"
                  >
                    Solve now
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <ScrollReveal as="section" className="mb-8" threshold={0.2}>
            <h1 className="text-4xl font-black">{t('dashboard.welcome', { name: currentUser?.fullName || 'Guest' })}</h1>
            <p className="mt-2 text-[var(--text-muted)]">{t('dashboard.subtitle')}</p>
            {hardChallengeLoading ? (
              <p className="mt-3 text-sm text-emerald-200/70">Checking for unlocked hard challenges...</p>
            ) : null}
          </ScrollReveal>

          <ScrollReveal as="section" className="mb-8 stagger-children grid gap-4 md:grid-cols-3" threshold={0.14} delay={80}>
            <div className="app-card p-5">
              <p className="text-sm text-emerald-100/70">{t('dashboard.cards.lecturesCompleted')}</p>
              <p className="mt-1 text-3xl font-black text-emerald-300">{solvedCount}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/35">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${Math.min((solvedCount / totalLectures) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="app-card p-5">
              <p className="text-sm text-emerald-100/70">{t('dashboard.cards.currentPath')}</p>
              <p className="mt-1 text-2xl font-black text-emerald-200">{roadmapData.title}</p>
              <p className="mt-3 text-sm text-emerald-100/60">{t('dashboard.cards.lessonsTotal', { count: totalLectures })}</p>
            </div>
            <div className="app-card p-5">
              <p className="text-sm text-emerald-100/70">{t('dashboard.cards.consistency')}</p>
              <p className="mt-1 text-3xl font-black text-emerald-300">{dayStreak} days</p>
              <p className="mt-3 text-sm text-emerald-100/60">{t('dashboard.cards.stayActive')}</p>
            </div>
          </ScrollReveal>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ScrollReveal className="app-card p-6" threshold={0.16}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15">
                      <MapPin className="h-5 w-5 text-emerald-300" />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold">{t('dashboard.currentLecture.title')}</h2>
                      <p className="text-sm text-emerald-100/60">{activeMilestone.title}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/roadmap/${userSelectedPath}`)} className="app-link-hover text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
                    {t('dashboard.currentLecture.viewRoadmap')}
                  </button>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                      {allCompleted
                        ? t('dashboard.currentLecture.allComplete')
                        : t('dashboard.currentLecture.lectureOf', { current: Math.min(currentLecture, totalLectures), total: totalLectures })}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black">{activeLecture.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-emerald-100/70">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {activeLecture.duration}</span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-wide">{activeLecture.type}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startLecture(activeLecture, activeMilestone)}
                    className="app-button-primary mt-5 flex w-full items-center justify-center gap-2 py-3"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {allCompleted ? t('dashboard.currentLecture.reviewLessons') : t('dashboard.currentLecture.continueLearning')}
                  </button>
                </div>
              </ScrollReveal>

              <ScrollReveal className="app-card p-6" threshold={0.16} delay={90}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t('dashboard.milestones.title')}</h3>
                  <button type="button" onClick={() => navigate(`/roadmap/${userSelectedPath}`)} className="app-link-hover text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">{t('dashboard.milestones.openMap')}</button>
                </div>
                <div className="space-y-3">
                  {learningLoading && (
                    <p className="text-sm text-emerald-100/60">{t('dashboard.milestones.loading')}</p>
                  )}
                  {roadmapData.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                      <h4 className="font-bold">{milestone.title}</h4>
                      <p className="mt-1 text-sm text-emerald-100/60">{milestone.description}</p>
                      <div className="mt-3 space-y-2">
                        {milestone.lectures.slice(0, 2).map((lecture) => {
                          const LectureIcon = iconByType[lecture.type] || BookOpen;
                          return (
                            <button
                              type="button"
                              key={lecture.id}
                              onClick={() => startLecture(lecture, milestone)}
                              className="flex w-full items-center justify-between rounded-lg border border-emerald-500/25 bg-black/25 px-3 py-2 text-left text-sm transition hover:border-emerald-400/45"
                            >
                              <span className="flex items-center gap-2">
                                <LectureIcon className="h-4 w-4 text-emerald-300" />
                                {lecture.title}
                              </span>
                              <ArrowRight className="h-4 w-4 text-emerald-300" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div className="space-y-6">
              <ScrollReveal className="app-card p-5" threshold={0.22}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{t('dashboard.sidebar.competitions')}</h3>
                  <button type="button" onClick={() => navigate('/events')} className="app-link-hover text-sm text-emerald-300 transition hover:text-emerald-200">{t('dashboard.sidebar.all')}</button>
                </div>
                <div className="space-y-3">
                  {competitions.map((item) => (
                    <div key={item.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-3">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-emerald-100/60">{item.endsIn} · {item.participants} participants</p>
                      <p className="mt-1 text-sm font-bold text-emerald-300">{item.prize}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal className="app-card p-5" threshold={0.22} delay={80}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{t('dashboard.sidebar.events')}</h3>
                  <button type="button" onClick={() => navigate('/events')} className="app-link-hover text-sm text-emerald-300 transition hover:text-emerald-200">{t('dashboard.sidebar.viewAll')}</button>
                </div>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-3">
                      <p className="font-semibold">{event.title}</p>
                      <p className="mt-1 text-xs text-emerald-100/60">{event.date} · {event.time}</p>
                      <p className="mt-1 text-xs text-emerald-100/60">{t('events.eventsTab.attending', { count: event.attendees })}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal className="app-card p-5" threshold={0.22} delay={120}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{t('dashboard.sidebar.jobMatches')}</h3>
                  <button type="button" onClick={() => navigate('/jobs')} className="app-link-hover text-sm text-emerald-300 transition hover:text-emerald-200">{t('dashboard.sidebar.seeAll')}</button>
                </div>
                <div className="space-y-3">
                  {jobsLoading ? (
                    <p className="text-sm text-emerald-100/60">{t('dashboard.sidebar.loadingJobs')}</p>
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <button
                        type="button"
                        key={job.id}
                        onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
                        className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/8 p-3 text-left transition hover:border-emerald-400/45"
                      >
                        <p className="font-semibold">{job.title}</p>
                        <p className="mt-1 text-xs text-emerald-100/60">{job.company} · {job.location}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-emerald-100/70">{job.salary}</span>
                          <span className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-1 font-bold text-emerald-300">{t('jobs.jobCard.match', { value: job.match })}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-100/60">{t('dashboard.sidebar.noJobs')}</p>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal className="rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-900/30 to-green-900/20 p-4" threshold={0.22} delay={150}>
                <h4 className="font-bold">{t('dashboard.quickActions.title')}</h4>
                <div className="stagger-children mt-3 space-y-2">
                  <button type="button" onClick={() => navigate('/leaderboard')} className="app-button-secondary flex w-full items-center justify-between px-3 py-2 text-sm">
                    {t('dashboard.quickActions.leaderboard')} <Trophy className="h-4 w-4" />
                  </button>
                  <button type="button" className="app-button-secondary flex w-full items-center justify-between px-3 py-2 text-sm">
                    {t('dashboard.quickActions.dailyChallenge')} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => navigate('/events')} className="app-button-secondary flex w-full items-center justify-between px-3 py-2 text-sm">
                    {t('dashboard.quickActions.joinEvent')} <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => navigate('/jobs')} className="app-button-secondary flex w-full items-center justify-between px-3 py-2 text-sm">
                    {t('dashboard.quickActions.browseJobs')} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </section>
    </PageShell>
  );
}
