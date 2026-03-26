import React, { useState } from 'react';
import { Code, Brain, Server, Smartphone, Database, Cloud, CheckCircle2, ArrowRight } from 'lucide-react';
import PageBackground from './layout/PageBackground';

export default function PathSelection({ onSelectPath, userName }) {
  const [selectedPath, setSelectedPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const learningPaths = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      icon: Code,
      description: 'Master the art of building beautiful, responsive user interfaces with modern frameworks.',
      duration: '6 months',
      difficulty: 'Beginner',
      topics: ['HTML & CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design'],
      color: '#61dafb',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'backend',
      title: 'Backend Development',
      icon: Server,
      description: 'Build robust server-side applications, APIs, and handle data management.',
      duration: '8 months',
      difficulty: 'Intermediate',
      topics: ['Node.js', 'Python', 'REST APIs', 'Authentication', 'Microservices'],
      color: '#68d391',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      icon: Code,
      description: 'Combine frontend and backend skills to build complete web applications.',
      duration: '10 months',
      difficulty: 'Intermediate',
      topics: ['React', 'Node.js', 'MongoDB', 'APIs', 'Deployment'],
      color: '#a78bfa',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'mobile',
      title: 'Mobile Development',
      icon: Smartphone,
      description: 'Create native and cross-platform mobile applications for iOS and Android.',
      duration: '7 months',
      difficulty: 'Intermediate',
      topics: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX'],
      color: '#fbbf24',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'data',
      title: 'Data Science & ML',
      icon: Brain,
      description: 'Dive into data analysis, machine learning, and artificial intelligence.',
      duration: '10 months',
      difficulty: 'Advanced',
      topics: ['Python', 'TensorFlow', 'Data Analysis', 'Machine Learning', 'Deep Learning'],
      color: '#c084fc',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'database',
      title: 'Database Engineering',
      icon: Database,
      description: 'Master database design, optimization, and management.',
      duration: '5 months',
      difficulty: 'Intermediate',
      topics: ['SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Database Design'],
      color: '#f472b6',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 'cloud',
      title: 'Cloud Computing',
      icon: Cloud,
      description: 'Deploy and manage scalable applications using cloud platforms.',
      duration: '6 months',
      difficulty: 'Intermediate',
      topics: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'DevOps'],
      color: '#60a5fa',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedPath) return;
    setIsSubmitting(true);
    await onSelectPath(selectedPath);
    setIsSubmitting(false);
  };

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
        <header className="border-b border-emerald-500/20 backdrop-blur-sm bg-black/35">
          <div className="max-w-full px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/50 bg-emerald-500/20">
                <Code className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-emerald-200">
                Dev Path
              </h1>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              Welcome, <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300 bg-clip-text text-transparent">{userName}!</span>
            </h2>
            <p className="mx-auto mb-6 max-w-3xl text-xl text-emerald-100/70">
              Choose your learning path to begin your coding journey. Select the path that aligns with your career goals.
            </p>
            {selectedPath && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
                <span>Path selected! Click continue to start learning</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {learningPaths.map((path) => {
              const Icon = path.icon;
              const isSelected = selectedPath === path.id;
              
              return (
                <div
                  key={path.id}
                  onClick={() => setSelectedPath(path.id)}
                  className={`relative rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] ${
                    isSelected
                      ? 'border-emerald-400/70 bg-emerald-500/12 ring-2 ring-emerald-400/40'
                      : 'border-emerald-500/20 bg-[var(--surface-primary)] hover:border-emerald-400/45'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                    </div>
                  )}
                  
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/15 transition-transform group-hover:scale-110">
                    <Icon className="w-8 h-8 text-emerald-200" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                  <p className="mb-4 text-sm text-emerald-100/70">{path.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                    <span className="text-xs text-emerald-100/50">⏱️ {path.duration}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {path.topics.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-xs text-emerald-100/70">
                        {topic}
                      </span>
                    ))}
                    {path.topics.length > 3 && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-xs text-emerald-100/70">
                        +{path.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPath && (
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="app-button-primary inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                {isSubmitting ? 'Starting your journey...' : 'Continue to Dashboard'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
