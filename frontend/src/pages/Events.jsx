import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Code, 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Flame,
  LogOut,
  Award,
  Zap,
  Target,
  MapPin
} from 'lucide-react';
import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function Events() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('competitions');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  };

  const currentUser = getUserData();

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const competitions = [
    {
      id: 1,
      title: 'Algorithm Sprint Challenge',
      description: 'Test your problem-solving skills with complex algorithms and data structures. Top 10 winners get prizes!',
      endsIn: '2 days 14 hours',
      participants: 1234,
      prize: '$500',
      difficulty: 'Medium',
      status: 'Active',
      tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
      startDate: 'Feb 10, 2026',
      endDate: 'Feb 17, 2026'
    },
    {
      id: 2,
      title: 'Frontend Design Challenge',
      description: 'Create stunning, responsive UI components using React and Tailwind CSS. Showcase your design skills!',
      endsIn: '5 days 8 hours',
      participants: 892,
      prize: '$750',
      difficulty: 'Hard',
      status: 'Active',
      tags: ['React', 'CSS', 'UI/UX'],
      startDate: 'Feb 12, 2026',
      endDate: 'Feb 20, 2026'
    },
    {
      id: 3,
      title: 'Bug Hunt Blitz',
      description: 'Find and fix bugs in real-world codebases. Speed and accuracy matter!',
      endsIn: '12 hours',
      participants: 456,
      prize: '$250',
      difficulty: 'Easy',
      status: 'Ending Soon',
      tags: ['Debugging', 'Code Review'],
      startDate: 'Feb 14, 2026',
      endDate: 'Feb 15, 2026'
    },
    {
      id: 4,
      title: 'AI/ML Hackathon',
      description: 'Build innovative machine learning models to solve real-world problems. Team competition!',
      endsIn: '10 days',
      participants: 567,
      prize: '$1,500',
      difficulty: 'Hard',
      status: 'Active',
      tags: ['Machine Learning', 'Python', 'AI'],
      startDate: 'Feb 15, 2026',
      endDate: 'Feb 25, 2026'
    },
    {
      id: 5,
      title: 'Code Golf Challenge',
      description: 'Write the shortest code possible to solve given problems. Less is more!',
      endsIn: '3 days',
      participants: 324,
      prize: '$300',
      difficulty: 'Medium',
      status: 'Active',
      tags: ['Code Optimization', 'Creative Coding'],
      startDate: 'Feb 13, 2026',
      endDate: 'Feb 18, 2026'
    }
  ];

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError('');
        const response = await fetch(`${BACKEND_URL}/events`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || t('events.eventsTab.loading'));
        }

        const normalized = (data.events || []).map((event) => {
          const dateValue = event.date ? new Date(event.date) : null;
          return {
            id: event.id,
            title: event.title,
            description: event.description || '-',
            date: dateValue ? dateValue.toLocaleDateString() : 'TBA',
            time: dateValue
              ? dateValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'TBA',
            attendees: 0,
            type: event.event_type || 'Event',
            location: event.location || 'Virtual',
            level: event.is_free ? 'Free' : 'Paid',
          };
        });

        setEvents(normalized);
      } catch (error) {
        setEventsError(error.message || t('events.eventsTab.loading'));
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
      case 'Medium': return 'bg-green-500/20 text-green-300 border-green-500/35';
      case 'Hard': return 'bg-lime-500/20 text-lime-300 border-lime-500/35';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
    }
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-4xl font-black mb-2">
              {t('events.title')}
            </h2>
            <p className="text-emerald-100/65 text-lg">{t('events.subtitle')}</p>
          </div>

          <div className="mb-8 flex gap-4 border-b border-emerald-500/20">
            <button
              onClick={() => setActiveTab('competitions')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'competitions'
                  ? 'text-emerald-300'
                  : 'text-emerald-100/60 hover:text-emerald-100/85'
              }`}
            >
              <Trophy className="w-5 h-5 inline mr-2" />
              {t('events.tabs.competitions')}
              {activeTab === 'competitions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'events'
                  ? 'text-emerald-300'
                  : 'text-emerald-100/60 hover:text-emerald-100/85'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              {t('events.tabs.events')}
              {activeTab === 'events' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
              )}
            </button>
          </div>

          {activeTab === 'competitions' && (
            <div className="space-y-6">
              {competitions.map((comp) => (
                <div
                  key={comp.id}
                  className="app-card group cursor-pointer p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold transition-colors group-hover:text-emerald-300">
                          {comp.title}
                        </h3>
                        {comp.status === 'Ending Soon' && (
                          <span className="text-xs px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {t('events.competitionCard.endingSoon')}
                          </span>
                        )}
                      </div>
                      <p className="mb-4 text-emerald-100/72">{comp.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {comp.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-3xl font-black text-emerald-300 mb-2">{comp.prize}</div>
                      <div className={`text-xs px-3 py-1 rounded-full border ${getDifficultyColor(comp.difficulty)}`}>
                        {comp.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                    <div className="flex items-center gap-6 text-sm text-emerald-100/65">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('events.competitionCard.endsIn', { time: comp.endsIn })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('events.competitionCard.participants', { count: comp.participants })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {comp.startDate} - {comp.endDate}
                      </span>
                    </div>
                    <button className="app-button-primary flex items-center gap-2 px-6 py-3 font-semibold transition-all group-hover:gap-3">
                      {t('events.competitionCard.join')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventsLoading ? (
                <div className="col-span-full app-card p-6 text-emerald-100/75">{t('events.eventsTab.loading')}</div>
              ) : null}

              {!eventsLoading && eventsError ? (
                <div className="col-span-full rounded-xl border border-red-500/35 bg-red-500/15 p-4 text-red-200">
                  {eventsError}
                </div>
              ) : null}

              {!eventsLoading && !eventsError && events.length === 0 ? (
                <div className="col-span-full app-card p-6 text-emerald-100/75">{t('events.eventsTab.empty')}</div>
              ) : null}

              {!eventsLoading && !eventsError && events.map((event) => (
                <div
                  key={event.id}
                  className="app-card group cursor-pointer p-6"
                >
                  <div className="flex gap-4 mb-4">
                    <div
                      className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/12"
                    >
                      <Calendar className="w-8 h-8 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-emerald-300">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-emerald-100/65">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed text-emerald-100/72">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs text-emerald-300">
                        {event.type}
                      </span>
                      <span className="rounded-full border border-green-500/35 bg-green-500/15 px-3 py-1 text-xs text-green-300">
                        {event.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                    <div className="text-sm text-emerald-100/65">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {t('events.eventsTab.attending', { count: event.attendees })}
                      </div>
                    </div>
                    <button className="app-button-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all group-hover:gap-3">
                      {t('events.eventsTab.register')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
