import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, Calendar, CheckCircle2, Code, Sparkles, Trophy, Users, Zap } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';

export default function Home(){
  const navigate = useNavigate();
  const { t } = useTranslation();
  const MotionSection = motion.section;

  const sections = useMemo(() => ([
    {
      icon: Code,
      title: 'Interactive Coding',
      descriptionKey: 'home.features.interactiveCoding'
    },
    {
      icon: BookOpen,
      title: 'Structured Learning',
      descriptionKey: 'home.features.structuredLearning'
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      descriptionKey: 'home.features.instantFeedback'
    },
    {
      icon: Users,
      title: 'Community Support',
      descriptionKey: 'home.features.communitySupport'
    }
  ]), []);

  const reveal = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <div className="page-enter relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative z-10">
        <SiteHeader
          onBrandClick={() => navigate('/')}
          right={(
            <>
              <button onClick={() => navigate('/paths')} className="app-link-hover text-emerald-200/80 transition hover:text-emerald-100">{t('home.nav.paths')}</button>
              <button onClick={() => navigate('/leaderboard')} className="app-link-hover text-emerald-200/80 transition hover:text-emerald-100">{t('home.nav.leaderboard')}</button>
              <button onClick={() => navigate('/signin')} className="app-button-secondary px-4 py-2 text-sm font-semibold">{t('home.nav.signIn')}</button>
              <button onClick={() => navigate('/login')} className="app-button-primary px-4 py-2 text-sm font-semibold">{t('home.nav.logIn')}</button>
            </>
          )}
        />

        <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-14">
          <MotionSection initial="hidden" animate="show" variants={reveal} className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              <Sparkles className="h-4 w-4" />
              {t('home.hero.badge')}
            </span>
            <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-emerald-100/80 md:text-xl">
              {t('home.hero.description')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate('/login')} className="app-button-primary inline-flex items-center gap-2 px-7 py-3 text-base">
                {t('home.hero.ctaStart')}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('/paths')} className="app-button-secondary px-7 py-3 text-base font-semibold">
                {t('home.hero.ctaExplore')}
              </button>
              <button onClick={() => navigate('/leaderboard')} className="app-button-secondary inline-flex items-center gap-2 px-7 py-3 text-base font-semibold">
                <Trophy className="h-4 w-4" />
                {t('home.hero.ctaLeaderboard')}
              </button>
            </div>
          </MotionSection>

          <MotionSection
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={reveal}
            className="mt-24 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {sections.map((item) => (
              <div key={item.title} className="app-card p-5">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500/15">
                  <item.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-emerald-100/75">{t(item.descriptionKey)}</p>
              </div>
            ))}
          </MotionSection>

          <MotionSection initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mt-24">
            <h2 className="text-3xl font-black">{t('home.howItWorks.title')}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[t('home.howItWorks.step1'), t('home.howItWorks.step2'), t('home.howItWorks.step3'), t('home.howItWorks.step4')].map((step, index) => (
                <div key={step} className="app-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">{t('home.howItWorks.stepLabel', { index: index + 1 })}</p>
                  <p className="mt-2 text-sm text-emerald-100/85">{step}</p>
                </div>
              ))}
            </div>
          </MotionSection>

          <MotionSection initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mt-24 grid gap-6 lg:grid-cols-2">
            <div className="app-card p-6">
              <h3 className="text-2xl font-black">Featured learning paths</h3>
              <div className="mt-4 space-y-3 text-sm text-emerald-100/80">
                {['Frontend Engineering', 'Backend Systems', 'Fullstack Delivery', 'Data & AI Foundations'].map((path) => (
                  <div key={path} className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3">
                    <span>{path}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </div>
                ))}
              </div>
            </div>
            <div className="app-card p-6">
              <h3 className="text-2xl font-black">{t('home.jobsEventsIntro.title')}</h3>
              <p className="mt-3 text-sm text-emerald-100/80">
                {t('home.jobsEventsIntro.description')}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
                  <Briefcase className="h-5 w-5 text-emerald-300" />
                  <p className="mt-2 text-sm font-semibold">{t('home.jobsEventsIntro.jobMatch')}</p>
                </div>
                <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
                  <Calendar className="h-5 w-5 text-emerald-300" />
                  <p className="mt-2 text-sm font-semibold">{t('home.jobsEventsIntro.eventsBySkill')}</p>
                </div>
              </div>
            </div>
          </MotionSection>

          <MotionSection initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mt-24 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Active learners', value: '10K+' },
              { label: 'Solved challenges', value: '500+' },
              { label: 'Career placement impact', value: '95%' },
            ].map((stat) => (
              <div key={stat.label} className="app-card p-6 text-center">
                <p className="text-4xl font-black text-emerald-300">{stat.value}</p>
                <p className="mt-2 text-sm text-emerald-100/75">{stat.label}</p>
              </div>
            ))}
          </MotionSection>

          <MotionSection initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mt-24 app-card p-8">
            <h3 className="text-2xl font-black">{t('home.faq.title')}</h3>
            <div className="mt-5 space-y-3 text-sm text-emerald-100/80">
              <p><span className="font-semibold text-emerald-200">{t('home.faq.q1')}</span> {t('home.faq.a1')}</p>
              <p><span className="font-semibold text-emerald-200">{t('home.faq.q2')}</span> {t('home.faq.a2')}</p>
              <p><span className="font-semibold text-emerald-200">{t('home.faq.q3')}</span> {t('home.faq.a3')}</p>
            </div>
          </MotionSection>

          <MotionSection initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="mt-24 rounded-2xl border border-emerald-300/30 bg-gradient-to-r from-emerald-700/30 to-green-900/30 p-8 text-center">
            <h3 className="text-3xl font-black">{t('home.finalCta.title')}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-emerald-100/80">
              {t('home.finalCta.description')}
            </p>
            <button onClick={() => navigate('/signin')} className="app-button-primary mt-6 px-8 py-3 text-base">{t('home.finalCta.button')}</button>
          </MotionSection>
        </main>

        <footer className="border-t border-emerald-500/20 px-6 py-8 text-center text-sm text-emerald-100/55">
          {t('home.footer.copyright')}
        </footer>
      </div>
    </div>
  );
}