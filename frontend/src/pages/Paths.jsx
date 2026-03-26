import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Code, 
  Brain, 
  Server, 
  Smartphone, 
  Database, 
  Shield, 
  Cloud, 
  Gamepad2,
  Clock,
  BarChart,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';

export default function Paths() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const learningPaths = [
    {
      id: 1,
      title: 'Frontend Development',
      roadmapKey: 'frontend',
      icon: Code,
      description: 'Master the art of building beautiful, responsive user interfaces with modern frameworks and tools.',
      duration: '6 months',
      difficulty: 'Beginner',
      topics: ['HTML & CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design'],
      bestFor: 'Design-minded builders who want to ship polished user experiences.',
      outcomes: ['Frontend Developer', 'UI Engineer', 'React Developer'],
      resumeOffer: 'Resume bullet pack focused on UI impact, performance, and accessibility wins.',
      students: 15420,
      rating: 4.8,
      color: '#61dafb',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Backend Development',
      roadmapKey: 'backend',
      icon: Server,
      description: 'Build robust server-side applications, APIs, and handle data management with industry-standard technologies.',
      duration: '8 months',
      difficulty: 'Intermediate',
      topics: ['Node.js', 'Python', 'REST APIs', 'Authentication', 'Microservices'],
      bestFor: 'Problem solvers who enjoy architecture, APIs, and system reliability.',
      outcomes: ['Backend Developer', 'API Engineer', 'Platform Engineer'],
      resumeOffer: 'Backend resume kit with API scale metrics, uptime highlights, and auth architecture phrasing.',
      students: 12350,
      rating: 4.7,
      color: '#68d391',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: 'Machine Learning & AI',
      roadmapKey: 'data',
      icon: Brain,
      description: 'Dive into artificial intelligence and machine learning to create intelligent systems and predictive models.',
      duration: '10 months',
      difficulty: 'Advanced',
      topics: ['Python', 'TensorFlow', 'Neural Networks', 'Data Science', 'Deep Learning'],
      bestFor: 'Data-driven learners who want to turn models into real product features.',
      outcomes: ['ML Engineer', 'AI Application Developer', 'Data Scientist'],
      resumeOffer: 'ML resume templates with model performance, data pipeline, and experiment impact language.',
      students: 8920,
      rating: 4.9,
      color: '#c084fc',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Mobile Development',
      roadmapKey: 'mobile',
      icon: Smartphone,
      description: 'Create native and cross-platform mobile applications for iOS and Android devices.',
      duration: '7 months',
      difficulty: 'Intermediate',
      topics: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX'],
      bestFor: 'Creators who want to build fast, delightful apps people use every day.',
      outcomes: ['Mobile Developer', 'React Native Engineer', 'iOS/Android Engineer'],
      resumeOffer: 'Mobile resume examples emphasizing app performance, retention, and release cycles.',
      students: 10560,
      rating: 4.6,
      color: '#fbbf24',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 5,
      title: 'Database Engineering',
      roadmapKey: 'database',
      icon: Database,
      description: 'Master database design, optimization, and management for both SQL and NoSQL databases.',
      duration: '5 months',
      difficulty: 'Intermediate',
      topics: ['SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Database Design'],
      bestFor: 'Engineers who like optimization, reliability, and data modeling.',
      outcomes: ['Database Engineer', 'Data Platform Developer', 'Data Reliability Engineer'],
      resumeOffer: 'Data resume module with schema design impact, query optimization, and migration achievements.',
      students: 7840,
      rating: 4.5,
      color: '#f472b6',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 7,
      title: 'Cloud Computing',
      roadmapKey: 'cloud',
      icon: Cloud,
      description: 'Deploy and manage scalable applications using cloud platforms like AWS, Azure, and Google Cloud.',
      duration: '6 months',
      difficulty: 'Intermediate',
      topics: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'DevOps'],
      bestFor: 'Builders who love automation, scale, and cloud-first deployment.',
      outcomes: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'],
      resumeOffer: 'Cloud resume set with deployment scale, cost optimization, and automation proof points.',
      students: 9450,
      rating: 4.7,
      color: '#60a5fa',
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      id: 8,
      title: 'Game Development',
      roadmapKey: 'fullstack',
      icon: Gamepad2,
      description: 'Bring your creative ideas to life by building interactive games for various platforms.',
      duration: '8 months',
      difficulty: 'Intermediate',
      topics: ['Unity', 'Unreal Engine', 'C#', 'Game Design', '3D Graphics'],
      bestFor: 'Creative developers who want to turn ideas into immersive interactive products.',
      outcomes: ['Gameplay Programmer', 'Game Developer', 'Technical Designer'],
      resumeOffer: 'Game-dev resume examples featuring shipped systems, gameplay loops, and rendering improvements.',
      students: 11230,
      rating: 4.9,
      color: '#a78bfa',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
      case 'Intermediate': return 'bg-green-500/20 text-green-300 border-green-500/35';
      case 'Advanced': return 'bg-lime-500/20 text-lime-300 border-lime-500/35';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative">
        <SiteHeader
          onBrandClick={() => navigate('/')}
          right={(
            <>
              <button onClick={() => navigate('/')} className="text-emerald-100/80 transition hover:text-emerald-100">{t('paths.navHome')}</button>
              <button onClick={() => navigate('/signin')} className="app-button-secondary px-4 py-2 text-sm font-semibold">{t('home.nav.signIn')}</button>
              <button onClick={() => navigate('/login')} className="app-button-primary px-4 py-2 text-sm font-semibold">{t('home.nav.logIn')}</button>
            </>
          )}
        />

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              {t('paths.title')}
            </h2>
            <p className="text-xl text-emerald-100/70 max-w-3xl mx-auto">
              {t('paths.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="app-card p-6 text-center">
              <div className="text-3xl font-black text-emerald-300 mb-2">8+</div>
              <div className="text-emerald-100/65 text-sm">{t('paths.stats.learningPaths')}</div>
            </div>
            <div className="app-card p-6 text-center">
              <div className="text-3xl font-black text-emerald-300 mb-2">500+</div>
              <div className="text-emerald-100/65 text-sm">{t('paths.stats.codingChallenges')}</div>
            </div>
            <div className="app-card p-6 text-center">
              <div className="text-3xl font-black text-emerald-300 mb-2">82K+</div>
              <div className="text-emerald-100/65 text-sm">{t('paths.stats.activeStudents')}</div>
            </div>
            <div className="app-card p-6 text-center">
              <div className="text-3xl font-black text-emerald-300 mb-2">95%</div>
              <div className="text-emerald-100/65 text-sm">{t('paths.stats.successRate')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <article 
                key={path.id}
                className="group app-card p-6 hover:border-emerald-400/40 hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center">
                      <path.icon className="w-7 h-7 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-emerald-300 transition-colors">
                        {path.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(path.difficulty)}`}>
                          {path.difficulty}
                        </span>
                        <span className="text-xs text-emerald-100/55 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {path.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-emerald-100/75 mb-4 leading-relaxed">
                  {path.description}
                </p>

                <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
                  <p className="text-xs uppercase tracking-wider text-emerald-300/80 font-semibold">{t('paths.card.bestFor')}</p>
                  <p className="mt-2 text-sm text-emerald-100/80">{path.bestFor}</p>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-emerald-100/85 mb-2">{t('paths.card.whatYouLearn')}</div>
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-xs text-emerald-100/75"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-emerald-300/80 font-semibold">{t('paths.card.careerOutcomes')}</p>
                    <ul className="mt-2 space-y-1 text-sm text-emerald-100/80">
                      {path.outcomes.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-lime-500/25 bg-lime-500/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-lime-300/85 font-semibold">{t('paths.card.resumeOffer')}</p>
                    <p className="mt-2 text-sm text-emerald-100/85">{path.resumeOffer}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                  <div className="flex items-center gap-4 text-sm text-emerald-100/65">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t('paths.card.students', { count: path.students.toLocaleString() })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-emerald-300 fill-emerald-300" />
                      <span>{path.rating}</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {t('paths.card.pathExplainer')}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-900/40 to-green-900/35 p-12 text-center">
            <h3 className="text-4xl font-black mb-4">
              {t('paths.finalCta.title')}
            </h3>
            <p className="text-xl text-emerald-100/80 mb-8 max-w-2xl mx-auto">
              {t('paths.finalCta.description')}
            </p>
            <button 
              onClick={() => navigate('/signin')}
              className="app-button-primary rounded-full px-10 py-4 text-lg font-bold"
            >
              {t('paths.finalCta.button')}
            </button>
          </div>
        </div>

        <footer className="border-t border-emerald-500/20 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-emerald-100/50">
            <p>{t('paths.footer.copyright')}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
