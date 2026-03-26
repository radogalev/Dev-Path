/* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/set-state-in-effect */
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Code, ExternalLink, PlayCircle, Video, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from '../components/layout/BrandLogo';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const HTML_BASE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
    
</body>
</html>`;

export default function Lesson() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { pathId, lectureId } = useParams();
  const [roadmap, setRoadmap] = useState({ title: t('dashboard.cards.currentPath'), milestones: [] });
  const [lessonBundle, setLessonBundle] = useState(null);
  const [bundleLoading, setBundleLoading] = useState(true);

  // 'learn' = lesson content view, 'practice' = split editor view
  const [mode, setMode] = useState('learn');
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncDeviceLayout = () => setIsDesktopDevice(mediaQuery.matches);

    syncDeviceLayout();
    mediaQuery.addEventListener('change', syncDeviceLayout);

    return () => {
      mediaQuery.removeEventListener('change', syncDeviceLayout);
    };
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/learning/roadmaps/${pathId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.roadmap) {
          setRoadmap(data.roadmap);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch roadmap data for lesson navigation:', error);
      });
  }, [pathId]);

  useEffect(() => {
    setBundleLoading(true);
    fetch(`${BACKEND_URL}/learning/lesson/${pathId}/${lectureId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.lesson) {
          setLessonBundle(data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch lesson bundle:', error);
      })
      .finally(() => setBundleLoading(false));
  }, [pathId, lectureId]);

  const lecture = lessonBundle?.lesson || location.state?.lecture || { id: Number(lectureId), title: t('lesson.learnMode.overviewTitle'), type: 'video', duration: '-' };
  const milestone = lessonBundle?.lesson?.milestone || location.state?.milestone || { id: 0, title: '' };
  const pathTitle = lessonBundle?.lesson?.pathTitle || location.state?.pathTitle || roadmap.title;
  const lessonTableData = lessonBundle?.lesson?.lessonTable || null;

  const lesson = useMemo(() => {
    const content = lessonBundle?.lesson?.content || {};
    const codingProblem = lessonBundle?.lesson?.codingProblem || null;

    const toText = (value) => {
      if (typeof value === 'string') {
        return value.trim();
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }

      if (value && typeof value === 'object') {
        const candidate = value.text ?? value.content ?? value.body ?? value.description ?? value.title ?? value.name;
        if (typeof candidate === 'string') {
          return candidate.trim();
        }
      }

      return '';
    };

    const normalizeSection = (section, index) => {
      if (typeof section === 'string') {
        const text = section.trim();
        return text
          ? {
              type: 'text',
              title: t('lesson.learnMode.sectionLabel', { index: index + 1 }),
              content: text,
            }
          : null;
      }

      if (!section || typeof section !== 'object') {
        return null;
      }

      const rawType = String(section.type || section.kind || section.sectionType || 'text').toLowerCase();
      const sectionTitle = toText(section.title) || toText(section.heading) || toText(section.name) || t('lesson.learnMode.sectionLabel', { index: index + 1 });

      const code =
        toText(section.code) ||
        toText(section.snippet) ||
        toText(section.source) ||
        toText(section.exampleCode) ||
        toText(section.sampleCode);

      const explanation =
        toText(section.explanation) ||
        toText(section.codeExplanation) ||
        toText(section.notes);

      const textContent =
        toText(section.content) ||
        toText(section.text) ||
        toText(section.body) ||
        toText(section.description) ||
        toText(section.details) ||
        toText(section.paragraph);

      const isCodeSection =
        rawType === 'code' ||
        rawType === 'snippet' ||
        rawType === 'example' ||
        rawType === 'code_example' ||
        rawType === 'codeexample' ||
        (!!code && !textContent);

      if (isCodeSection) {
        if (!code) {
          return null;
        }

        return {
          type: 'code',
          title: sectionTitle,
          code,
          explanation,
        };
      }

      if (!textContent) {
        return null;
      }

      return {
        type: 'text',
        title: sectionTitle,
        content: textContent,
      };
    };

    const rawTopics = Array.isArray(content.topics) ? content.topics : [];
    const topics = rawTopics.map((topic) => toText(topic)).filter(Boolean);

    const rawExplanation = Array.isArray(content.explanation) ? content.explanation : [];
    const explanation = rawExplanation.map((item) => toText(item)).filter(Boolean);

    const rawSections =
      Array.isArray(content.sections)
        ? content.sections
        : Array.isArray(content.parts)
          ? content.parts
          : Array.isArray(content.lessonParts)
            ? content.lessonParts
            : [];

    const sections = rawSections
      .map((section, index) => normalizeSection(section, index))
      .filter(Boolean);

    const hasCodeSection = sections.some((section) => (section?.type || '').toLowerCase() === 'code' && toText(section?.code));
    const starterCode = toText(codingProblem?.starterCode);

    if (!hasCodeSection && starterCode) {
      sections.push({
        type: 'code',
        title: toText(codingProblem?.title) || `${lecture.title} Code Example`,
        code: starterCode,
        explanation: toText(codingProblem?.prompt),
      });
    }

    const rawResources = Array.isArray(content.resources) ? content.resources : [];
    const resources = rawResources
      .map((resource) => {
        if (typeof resource === 'string') {
          const url = resource.trim();
          if (!url) {
            return null;
          }

          return {
            label: url,
            url,
          };
        }

        if (!resource || typeof resource !== 'object') {
          return null;
        }

        const label = toText(resource.label) || toText(resource.title) || toText(resource.name) || toText(resource.url);
        const url = toText(resource.url) || toText(resource.href) || toText(resource.link);

        if (!label || !url) {
          return null;
        }

        return { label, url };
      })
      .filter(Boolean);

    return {
      overview: content.overview || `${lecture.title} lesson overview.`,
      goal: content.goal || t('lesson.learnMode.goalTitle'),
      topics,
      explanation,
      sections,
      resources,
      codingProblem,
      theoryTest: lessonBundle?.lesson?.theoryTest || null,
    };
  }, [lessonBundle, lecture.title, t]);

  const exercises = useMemo(() => {
    const codingProblem = lesson.codingProblem;
    const theoryQuestions = lesson.theoryTest?.questions || [];

    if (lecture.type === 'video') {
      if (theoryQuestions.length > 0) {
        return theoryQuestions.map((question, index) => ({
          id: `theory-${lecture.id}-${index + 1}`,
          title: lesson.theoryTest?.title || `Theory Test ${index + 1}: ${lecture.title}`,
          difficulty: lesson.theoryTest?.difficulty || 'Easy',
          language: 'Theory',
          kind: 'theoretical',
          prompt: lesson.theoryTest?.title || `${t('lesson.practiceMode.question')} ${index + 1}`,
          question: question.question,
          options: question.options || [],
          correctOption: question.correctOption,
          starterCode: '',
          _exerciseIndex: index,
        }));
      }

      return [];
    }

    if (codingProblem) {
      return [
        {
          ...codingProblem,
          _exerciseIndex: 0,
        },
      ];
    }

    return [];
  }, [lesson, lecture]);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const activeProblem = exercises[Math.min(exerciseIndex, Math.max(exercises.length - 1, 0))];
  const isTheoryExercise = activeProblem?.kind === 'theoretical' || activeProblem?.language === 'Theory';
  const isTheoryLesson = useMemo(
    () => exercises.length > 0 && exercises.every((problem) => problem?.kind === 'theoretical' || problem?.language === 'Theory'),
    [exercises]
  );
  const shouldRouteToTheoryTest = lecture.type === 'video' || isTheoryLesson;
  const theoryOptions = Array.isArray(activeProblem?.options) ? activeProblem.options : [];
  const [code, setCode] = useState('');

  const [saveError, setSaveError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [improvementTips, setImprovementTips] = useState(null);
  const [tipsVariant, setTipsVariant] = useState('error');
  const [submitted, setSubmitted] = useState(false);

  const activeLanguage = (activeProblem?.language || '').toLowerCase();
  const taskText = `${activeProblem?.title || ''} ${activeProblem?.prompt || ''}`.toLowerCase();
  const isHtmlTask = activeLanguage.includes('html') || taskText.includes('html') || taskText.includes('tag') || taskText.includes('markup');
  const isCssTask = activeLanguage.includes('css') || taskText.includes('css') || taskText.includes('style') || taskText.includes('stylesheet');
  const shouldShowLivePreview = !isTheoryExercise && (isHtmlTask || isCssTask);

  const livePreviewDocument = useMemo(() => {
    if (!shouldShowLivePreview) {
      return '';
    }

    return code.trim()
      ? code
      : `<p style="font-family: sans-serif; color: #4b5563; padding: 16px;">${t('lesson.practiceMode.previewHint')}</p>`;
  }, [code, shouldShowLivePreview, t]);

  useEffect(() => {
    if (exerciseIndex >= exercises.length) {
      setExerciseIndex(0);
    }
  }, [exerciseIndex, exercises.length]);

  // Reset to learn mode when navigating to a new lecture
  useEffect(() => {
    setMode('learn');
    setExerciseIndex(0);
  }, [lecture.id]);

  // Reset state when exerciseIndex or lecture changes
  useEffect(() => {
    const defaultCode = isHtmlTask ? HTML_BASE_TEMPLATE : (activeProblem?.starterCode || '');
    setCode(defaultCode);
    setSubmitted(false);
    setSaveError(null);
    setSubmitLoading(false);
    setImprovementTips(null);
    setTipsVariant('error');
  }, [isHtmlTask, activeProblem?.starterCode]);

  const iconByType = {
    video: Video,
    interactive: PlayCircle,
    project: Code
  };

  const LectureIcon = iconByType[lecture.type] || BookOpen;

  const submitCode = async ({ eventType = 'manual_save' } = {}) => {
    if (!activeProblem) {
      throw new Error('No active problem available');
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const problemDescription = `${activeProblem.prompt}\n\nInput: ${activeProblem.inputDescription}\n\nOutput: ${activeProblem.outputDescription}`;
    const payload = {
      userId: userData.id ?? null,
      pathId,
      lectureId: lecture.id,
      milestoneId: milestone.id,
      exerciseIndex,
      code,
      language: activeProblem?.language ?? null,
      problemTitle: activeProblem.title,
      problemDescription,
      eventType,
    };

    const response = await fetch(`${BACKEND_URL}/submit-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const errorMessage =
      data?.message ||
      data?.detail ||
      (typeof data === 'string' ? data : null) ||
      'Failed to submit code';

    if (!response.ok || !data.success) {
      throw new Error(errorMessage);
    }

    return data;
  };

  // Find the next lecture across all milestones
  const getNextLecture = () => {
    const allLectures = roadmap.milestones.flatMap(m =>
      m.lectures.map(l => ({ lecture: l, milestone: m }))
    );
    const currentIndex = allLectures.findIndex(item => item.lecture.id === lecture.id);
    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      return allLectures[currentIndex + 1];
    }
    return null;
  };

  const persistProgress = async (nextLectureNumber) => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!storedUser?.id) return;

    let updatedUser = {
      ...storedUser,
      currentLecture: Math.max(storedUser.currentLecture || 1, nextLectureNumber),
    };

    try {
      const progressRes = await fetch(`${BACKEND_URL}/update-lecture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser.id,
          currentLecture: nextLectureNumber,
        }),
      });
      const progressResult = await progressRes.json();
      if (progressResult?.success && progressResult?.user) {
        updatedUser = progressResult.user;
      }
    } catch (error) {
      console.error('Failed to persist lecture progression:', error);
    }

    try {
      const streakRes = await fetch(`${BACKEND_URL}/update-streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUser.id }),
      });
      const streakResult = await streakRes.json();
      if (streakResult?.success) {
        updatedUser.streakCount = streakResult.streakCount;
        updatedUser.lastActiveDate = streakResult.lastActiveDate;
      }
    } catch (err) {
      console.error('Failed to update streak:', err);
    }

    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const submitSolution = async () => {
    if (!activeProblem) return;

    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setSubmitLoading(true);
    setSaveError(null);
    setImprovementTips(null);

    try {
      const result = await submitCode({ eventType: isTheoryExercise ? 'theory_submit' : 'solution_submit' });
      setSaveError(null);

      if (!isTheoryExercise && result?.isCorrect === false) {
        setImprovementTips(result.improvementTips || t('lesson.practiceMode.tipsTitle'));
        setTipsVariant('error');
        setSubmitted(false);
        return;
      }

      setImprovementTips(isTheoryExercise ? t('lesson.practiceMode.submitAnswer', { current: exerciseIndex + 1, total: exercises.length }) : t('lesson.practiceMode.successTitle'));
      setTipsVariant('success');
    } catch (error) {
      console.error('Failed to submit solution code to backend:', error);
      setSaveError(error?.message || 'Code was not sent to backend.');
      setImprovementTips(null);
      setTipsVariant('error');
      setSubmitted(false);
      return;
    } finally {
      setSubmitLoading(false);
    }

    // Accept everything as correct
    setSubmitted(true);

    const isLastExercise = exerciseIndex >= exercises.length - 1;

    if (isLastExercise) {
      await persistProgress(lecture.id + 1);

      // Navigate to next lesson after a short delay
      setTimeout(() => {
        const next = getNextLecture();
        if (next) {
          navigate(`/lesson/${pathId}/${next.lecture.id}`, {
            state: {
              lecture: next.lecture,
              milestone: next.milestone,
              pathTitle
            }
          });
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } else {
      // Move to next exercise after a short delay
      setTimeout(() => {
        setExerciseIndex(prev => prev + 1);
      }, 1000);
    }
  };

  if (bundleLoading && !lessonBundle && !location.state?.lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center text-emerald-100/75">
        {t('lesson.loading')}
      </div>
    );
  }

  /* ─── LEARN MODE: lesson content with a CTA button at the bottom ─── */
  if (mode === 'learn') {
    return (
      <PageShell className="overflow-y-auto text-emerald-50" contentClassName="p-0">
        {/* Header */}
        <header className="app-navbar sticky top-0 z-10 border-b border-emerald-500/20">
          <div className="relative flex max-w-full flex-col gap-3 px-4 py-3 sm:px-6 md:min-h-[72px] md:justify-center md:py-4">
            <div className="order-1 text-center md:absolute md:left-1/2 md:top-1/2 md:w-auto md:-translate-x-1/2 md:-translate-y-1/2">
              <h2 className="text-lg font-bold text-emerald-100">{lecture.title}</h2>
              <p className="hidden text-sm text-emerald-100/55 lg:block">{pathTitle}</p>
            </div>

            <div className="order-2 flex items-center justify-start gap-3 md:mr-auto md:gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
                aria-label={t('lesson.header.goDashboard')}
              >
                <BrandLogo className="h-10 w-[170px] shrink-0 text-emerald-200" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/roadmap/${pathId}`)}
                className="flex items-center gap-2 text-sm text-emerald-100/75 transition-colors hover:text-emerald-100"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('lesson.header.backToRoadmap')}
              </button>
            </div>
          </div>
        </header>

        <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Title section */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/12">
              <LectureIcon className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <p className="text-sm text-emerald-100/60">{milestone.title}</p>
              <h1 className="text-3xl font-bold">{lecture.title}</h1>
            </div>
          </div>

          {/* Overview */}
          <section className="app-card p-6">
            <h2 className="text-lg font-semibold mb-3">{t('lesson.learnMode.overviewTitle')}</h2>
            <p className="text-emerald-100/80 leading-relaxed">{lesson.overview}</p>
          </section>

          {/* Learning Goal */}
          <section className="app-card p-6">
            <h2 className="text-lg font-semibold mb-3">{t('lesson.learnMode.goalTitle')}</h2>
            <p className="text-emerald-100/80 leading-relaxed">{lesson.goal}</p>
          </section>

          {/* Topics */}
          <section className="app-card p-6">
            <h2 className="text-lg font-semibold mb-3">{t('lesson.learnMode.topicsTitle')}</h2>
            <ul className="space-y-2">
              {lesson.topics.map((topic) => (
                <li key={topic} className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-emerald-100/85">
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          {/* Lesson Notes / Explanation */}
          <section className="app-card p-6">
            <h2 className="text-lg font-semibold mb-3">{t('lesson.learnMode.notesTitle')}</h2>
            <div className="space-y-5">
              {lesson.sections.map((section, index) => {
                const sectionType = (section?.type || 'text').toLowerCase();
                const sectionTitle = section?.title || t('lesson.learnMode.sectionLabel', { index: index + 1 });

                if (sectionType === 'code') {
                  return (
                    <article key={`section-${index}`} className="rounded-xl border border-cyan-300/35 bg-cyan-500/8 p-4">
                      <h3 className="mb-2 text-base font-semibold text-cyan-100">{sectionTitle}</h3>
                      {section?.explanation ? (
                        <p className="mb-3 text-sm text-cyan-100/80 leading-relaxed">{section.explanation}</p>
                      ) : null}
                      <div className="rounded-lg border border-cyan-200/30 bg-black/45 p-3">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-cyan-100/90">
                          <code>{section?.code || ''}</code>
                        </pre>
                      </div>
                    </article>
                  );
                }

                return (
                  <article key={`section-${index}`} className="rounded-xl border border-emerald-500/25 bg-emerald-500/6 p-4">
                    <h3 className="mb-2 text-base font-semibold text-emerald-100">{sectionTitle}</h3>
                    <p className="text-emerald-100/80 leading-relaxed whitespace-pre-line">{section?.content || ''}</p>
                  </article>
                );
              })}

              {lesson.explanation.map((text, index) => (
                <p key={`explanation-${index}`} className="text-emerald-100/80 leading-relaxed">{text}</p>
              ))}
            </div>
          </section>

          {/* Render full lessons table payload */}
          {lessonTableData ? (
            <section className="app-card p-6">
              <h2 className="text-lg font-semibold mb-3">Lesson Table Data</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-emerald-100/85">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Row ID: {lessonTableData.id ?? '-'}</div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Roadmap Node ID: {lessonTableData.roadmapNodeId ?? '-'}</div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Path: {lessonTableData.path ?? '-'}</div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Order: {lessonTableData.order ?? '-'}</div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Difficulty: {lessonTableData.difficulty ?? '-'}</div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">Duration (min): {lessonTableData.durationMinutes ?? '-'}</div>
              </div>
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-black/35 p-3">
                <p className="mb-2 text-xs text-emerald-100/60">Raw lesson.content JSON</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-emerald-100/85">{JSON.stringify(lessonTableData.content || {}, null, 2)}</pre>
              </div>
            </section>
          ) : null}

          {/* Resources */}
          <section className="app-card p-6">
            <h2 className="text-lg font-semibold mb-3">{t('lesson.learnMode.resourcesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.resources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 transition-colors hover:bg-emerald-500/14"
                >
                  <span className="text-sm text-emerald-100/85">{resource.label}</span>
                  <ExternalLink className="w-4 h-4 text-emerald-100/55" />
                </a>
              ))}
            </div>
          </section>

          {/* CTA Button — go to exercises */}
          <div className="pt-4 pb-12">
            <button
              type="button"
              onClick={() => {
                if (shouldRouteToTheoryTest) {
                  navigate(`/lesson-test/${pathId}/${lecture.id}`, {
                    state: {
                      lecture,
                      milestone,
                      pathTitle,
                      theoryQuestions: exercises,
                    },
                  });
                  return;
                }

                setMode('practice');
              }}
              className="app-button-primary flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold"
            >
              <Code className="w-5 h-5" />
              {shouldRouteToTheoryTest
                ? t('lesson.learnMode.startTheory', { count: exercises.length })
                : t('lesson.learnMode.startExercises', { count: exercises.length })}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </PageShell>
    );
  }

  /* ─── PRACTICE MODE: split editor view ─── */
  return (
    <PageShell
      className={isDesktopDevice ? 'h-screen overflow-hidden text-emerald-50' : 'min-h-screen text-emerald-50'}
      wrapperClassName={isDesktopDevice ? 'h-full' : ''}
      contentClassName={isDesktopDevice ? 'flex h-full min-h-0 flex-col p-0' : 'flex min-h-screen flex-col p-0'}
    >
      {/* Header */}
      <header className="app-navbar flex-shrink-0 border-b border-emerald-500/20">
        <div className={isDesktopDevice ? 'px-6 py-3 flex items-center justify-between' : 'flex flex-col gap-2 px-4 py-3 sm:px-6'}>
          <button
            type="button"
            onClick={() => setMode('learn')}
            className={isDesktopDevice
              ? 'hidden'
              : 'order-2 flex items-center gap-2 text-emerald-100/70 transition-colors hover:text-emerald-100'}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('lesson.practiceMode.backToLesson')}
          </button>

          <div className={isDesktopDevice ? 'flex items-center gap-3' : 'order-1 flex items-center gap-2 sm:gap-3'}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center"
              aria-label={t('lesson.header.goDashboard')}
            >
              <BrandLogo className="h-8 w-[155px] shrink-0 text-emerald-200" />
            </button>
            {isDesktopDevice ? (
              <button
                type="button"
                onClick={() => setMode('learn')}
                className="flex items-center gap-2 text-emerald-100/70 transition-colors hover:text-emerald-100"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('lesson.practiceMode.backToLesson')}
              </button>
            ) : null}
            <span className="text-emerald-100/30">|</span>
            <div className="flex items-center gap-2">
              <LectureIcon className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium">{lecture.title}</span>
            </div>
            <span className="text-emerald-100/30">|</span>
            <span className="text-xs text-emerald-100/55">{milestone.title}</span>
          </div>

          {/* Exercise progress dots */}
          <div className={isDesktopDevice ? 'flex items-center gap-2' : 'order-3 flex items-center gap-2'}>
            <span className="mr-1 text-xs text-emerald-100/55">{t('lesson.practiceMode.exerciseProgress', { current: exerciseIndex + 1, total: exercises.length })}</span>
            {exercises.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < exerciseIndex
                    ? 'bg-emerald-400'
                    : i === exerciseIndex
                    ? 'bg-emerald-300 ring-2 ring-emerald-300/40'
                    : 'bg-emerald-900'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main split layout */}
      <div className={isDesktopDevice ? 'flex min-h-0 flex-1 overflow-hidden' : 'flex flex-col'}>
        {/* LEFT PANEL — Problem Description */}
        <div data-lenis-prevent className={`${isDesktopDevice ? 'min-h-0 w-1/2 overflow-y-auto border-r' : 'order-1 w-full border-b'} border-emerald-500/20 ${theme === 'light' ? 'bg-white' : 'bg-black/25'}`}>
          <div className="p-6 space-y-5">
            {/* Problem title & badges */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">{activeProblem.title}</h2>
                <div className="flex items-center gap-2">
                  {activeProblem.language && (
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${theme === 'light' ? 'border border-emerald-500/60 bg-emerald-200 text-emerald-800' : 'border border-lime-500/35 bg-lime-500/15 text-lime-300'}`}>
                      {activeProblem.language}
                    </span>
                  )}
                  <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                    {activeProblem.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-emerald-100/90">{t('lesson.practiceMode.description')}</h3>
              <p className="text-sm leading-relaxed text-emerald-100/78">{activeProblem.prompt}</p>
            </div>

            {isTheoryExercise && activeProblem?.question && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-emerald-100/90">{t('lesson.practiceMode.question')}</h3>
                <p className="text-sm leading-relaxed text-emerald-100/78">{activeProblem.question}</p>
              </div>
            )}

            {/* Input / Output */}
            <div className="space-y-2 text-sm text-emerald-100/78">
              <p><span className="font-semibold text-emerald-100/95">{t('lesson.practiceMode.input')}</span> {activeProblem.inputDescription}</p>
              <p><span className="font-semibold text-emerald-100/95">{t('lesson.practiceMode.output')}</span> {activeProblem.outputDescription}</p>
            </div>

            {/* Constraints */}
            {activeProblem.constraints && activeProblem.constraints.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-emerald-100/90">{t('lesson.practiceMode.constraints')}</h3>
                <ul className="list-inside list-disc space-y-1.5 text-sm text-emerald-100/65">
                  {activeProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-emerald-100/90">{t('lesson.practiceMode.examples')}</h3>
              <div className={`rounded-lg border border-emerald-500/25 p-3 ${theme === 'light' ? 'bg-white' : 'bg-black/45'}`}>
                <span className="text-xs text-emerald-100/55">{t('lesson.practiceMode.input')}</span>
                <pre data-lenis-prevent className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap text-sm text-emerald-100/85">{activeProblem.exampleInput}</pre>
              </div>
              <div className={`rounded-lg border border-emerald-500/25 p-3 ${theme === 'light' ? 'bg-white' : 'bg-black/45'}`}>
                <span className="text-xs text-emerald-100/55">{t('lesson.practiceMode.output')}</span>
                <pre data-lenis-prevent className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap text-sm text-emerald-100/85">{activeProblem.exampleOutput}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Code Editor */}
        <div className={`${isDesktopDevice ? 'flex min-h-0 w-1/2 flex-col overflow-hidden' : 'order-2 mt-4 flex w-full flex-col overflow-visible'} ${theme === 'light' ? 'bg-white' : 'bg-black/20'}`}>
          {/* Editor toolbar */}
          <div className={`flex-shrink-0 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between ${theme === 'light' ? 'bg-white' : 'bg-black/35'}`}>
            <div className="flex items-center gap-3">
              <Code className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-medium">{isTheoryExercise ? t('lesson.practiceMode.testResponse') : t('lesson.practiceMode.editor')}</span>
            </div>
          </div>

          {saveError && (
            <div className="flex-shrink-0 mx-4 mt-2 flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-xs">
              <span>{saveError}</span>
              <button type="button" onClick={() => setSaveError(null)} aria-label="Dismiss save error" className="ml-2 text-red-400 hover:text-red-200 font-bold">&times;</button>
            </div>
          )}

          {improvementTips && (
            <div
              data-lenis-prevent
              className={`mx-4 mt-2 max-h-48 flex-shrink-0 overflow-y-auto overscroll-contain rounded-lg p-3 ${tipsVariant === 'success' ? 'border border-emerald-500/30 bg-emerald-500/10' : 'border border-red-500/30 bg-red-500/10'}`}
            >
              <p className={`mb-1 text-xs font-semibold ${tipsVariant === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                {tipsVariant === 'success' ? t('lesson.practiceMode.successTitle') : t('lesson.practiceMode.tipsTitle')}
              </p>
              <pre className={`overflow-x-auto whitespace-pre-wrap text-xs ${tipsVariant === 'success' ? 'text-emerald-100/85' : 'text-red-100/85'}`}>{improvementTips}</pre>
            </div>
          )}

          {/* Textarea */}
          <div className={isDesktopDevice ? 'flex-1 p-4 overflow-hidden flex flex-col' : 'flex flex-col p-4'}>
            {isTheoryExercise ? (
              <div className={`${isDesktopDevice ? 'flex-1 overflow-y-auto' : ''} space-y-3 rounded-lg border border-emerald-500/25 p-4 ${theme === 'light' ? 'bg-white' : 'bg-black/60'}`}>
                {theoryOptions.length > 0 ? (
                  theoryOptions.map((option) => {
                    const optionId = option?.id || '';
                    const isSelected = code === optionId;

                    return (
                      <button
                        key={optionId}
                        type="button"
                        onClick={() => setCode(optionId)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'border-emerald-400/60 bg-emerald-500/20'
                            : theme === 'light'
                              ? 'border-emerald-500/25 bg-white hover:bg-emerald-500/10'
                              : 'border-emerald-500/25 bg-black/25 hover:bg-emerald-500/10'
                        }`}
                      >
                        <p className="text-sm font-semibold text-emerald-200">{optionId}</p>
                        <p className="mt-1 text-sm text-emerald-100/80">{option?.text || ''}</p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-emerald-100/70">{t('lesson.practiceMode.noOptions')}</p>
                )}
              </div>
            ) : (
              <>
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  className={`w-full resize-none rounded-lg border border-emerald-500/25 p-4 font-mono text-sm text-emerald-100/90 focus:border-emerald-400/60 focus:outline-none ${theme === 'light' ? 'bg-white' : 'bg-black/60'} ${shouldShowLivePreview ? (isDesktopDevice ? 'h-[45%] min-h-[180px]' : 'h-[24vh] min-h-[140px] sm:h-64') : 'min-h-[220px] flex-1'}`}
                />

                {shouldShowLivePreview && (
                  <div data-lenis-prevent className={`mt-3 ${isDesktopDevice ? 'flex-1 min-h-[180px]' : 'h-[30vh] min-h-[170px] sm:h-80'} overflow-hidden rounded-lg border border-emerald-500/25 ${theme === 'light' ? 'bg-white' : 'bg-black/60'}`}>
                    <div className={`flex items-center justify-between border-b border-emerald-500/20 px-3 py-2 text-xs ${theme === 'light' ? 'bg-slate-50 text-slate-600' : 'bg-black/35 text-emerald-100/75'}`}>
                      <span>{t('lesson.practiceMode.livePreview')}</span>
                      <span>{isCssTask && !isHtmlTask ? 'CSS task preview' : 'HTML task preview'}</span>
                    </div>
                    <iframe
                      data-lenis-prevent
                      title="Live HTML/CSS preview"
                      srcDoc={livePreviewDocument}
                      sandbox=""
                      className="h-[calc(100%-33px)] w-full border-0 bg-white"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit bar */}
          <div className={`flex-shrink-0 border-t border-emerald-500/20 px-4 py-3 ${theme === 'light' ? 'bg-white' : 'bg-black/35'}`}>
            {submitted ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">
                  {exerciseIndex >= exercises.length - 1
                    ? t('lesson.practiceMode.allComplete')
                    : t('lesson.practiceMode.loadingNext')}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={submitSolution}
                disabled={submitLoading || !code.trim()}
                className="app-button-primary w-full flex items-center justify-center gap-2 px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-45"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('lesson.practiceMode.checking')}
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    {isTheoryExercise
                      ? t('lesson.practiceMode.submitAnswer', { current: exerciseIndex + 1, total: exercises.length })
                      : t('lesson.practiceMode.submitSolution', { current: exerciseIndex + 1, total: exercises.length })}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
