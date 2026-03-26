import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleX, HelpCircle } from 'lucide-react';
import PageBackground from '../components/layout/PageBackground';
import BrandLogo from '../components/layout/BrandLogo';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function TheoryTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { pathId, lectureId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [lessonBundle, setLessonBundle] = useState(null);

  const lecture = lessonBundle?.lesson || location.state?.lecture || { id: Number(lectureId), title: t('lesson.learnMode.overviewTitle') };
  const milestone = lessonBundle?.lesson?.milestone || location.state?.milestone || { id: 0, title: '' };
  const pathTitle = lessonBundle?.lesson?.pathTitle || location.state?.pathTitle || t('dashboard.cards.currentPath');

  useEffect(() => {
    fetch(`${BACKEND_URL}/learning/roadmaps/${pathId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.roadmap) {
          setRoadmap(data.roadmap);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch roadmap for theory navigation:', error);
      });
  }, [pathId]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/learning/lesson/${pathId}/${lectureId}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.lesson) {
          setLessonBundle(data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch theory lesson bundle:', error);
      });
  }, [pathId, lectureId]);
  const preloadedQuestions = useMemo(() => {
    const fromState = Array.isArray(location.state?.theoryQuestions) ? location.state.theoryQuestions : [];
    const theoryFromState = fromState.filter((item) => item?.kind === 'theoretical' || item?.language === 'Theory');
    return theoryFromState;
  }, [location.state?.theoryQuestions, lecture]);

  const [questions, setQuestions] = useState(preloadedQuestions);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(preloadedQuestions.length === 0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState({ correct: 0, wrong: 0, total: 0, passed: false });

  useEffect(() => {
    const lessonTheoryQuestions = lessonBundle?.lesson?.theoryTest?.questions;
    if (Array.isArray(lessonTheoryQuestions) && lessonTheoryQuestions.length > 0) {
      const normalized = lessonTheoryQuestions.map((item, index) => ({
        id: item.id || `db-theory-${lecture.id}-${index + 1}`,
        title: lessonBundle?.lesson?.theoryTest?.title || `Theory Test ${index + 1}`,
        difficulty: lessonBundle?.lesson?.theoryTest?.difficulty || 'Easy',
        language: 'Theory',
        kind: 'theoretical',
        prompt: lessonBundle?.lesson?.theoryTest?.title || `Theory question ${index + 1}`,
        question: item.question,
        options: item.options || [],
        correctOption: item.correctOption,
      }));

      setQuestions(normalized);
      setLoading(false);
      return;
    }

    if (preloadedQuestions.length > 0) {
      setQuestions(preloadedQuestions);
      setLoading(false);
      return;
    }

    setLoading(true);
    setQuestions([]);
    setLoading(false);
  }, [pathId, lecture.id, preloadedQuestions, lecture, lessonBundle]);

  const getNextLecture = () => {
    if (!roadmap?.milestones) return null;

    const allLectures = roadmap.milestones.flatMap((m) => m.lectures.map((l) => ({ lecture: l, milestone: m })));
    const currentIndex = allLectures.findIndex((item) => item.lecture.id === lecture.id);

    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      return allLectures[currentIndex + 1];
    }

    return null;
  };

  const handleSelectAnswer = (questionIndex, optionId) => {
    if (submitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionId,
    }));
  };

  const submitTest = async () => {
    let correct = 0;

    questions.forEach((question, index) => {
      const selected = selectedAnswers[index];
      if (selected && question.correctOption && selected === question.correctOption) {
        correct += 1;
      }
    });

    const total = questions.length;
    const wrong = total - correct;
    const passed = total > 0 && correct === total;

    setResult({ correct, wrong, total, passed });
    setSubmitted(true);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    let updatedUser = {
      ...userData,
      currentLecture: passed ? Math.max(userData.currentLecture || 1, lecture.id + 1) : (userData.currentLecture || 1),
    };

    if (userData?.id) {
      try {
        const theoryRes = await fetch(`${BACKEND_URL}/learning/progress/complete-theory-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            pathId,
            lessonId: lecture.id,
            score: correct,
            totalQuestions: total,
            passed,
          }),
        });
        const theoryResult = await theoryRes.json();
        if (theoryResult?.success && theoryResult?.currentLecture) {
          updatedUser.currentLecture = theoryResult.currentLecture;
        }
      } catch (error) {
        console.error('Failed to persist theory test result:', error);
      }
    }

    if (!passed) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    if (userData?.id) {
      try {
        const streakRes = await fetch(`${BACKEND_URL}/update-streak`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id }),
        });
        const streakResult = await streakRes.json();
        if (streakResult.success) {
          updatedUser.streakCount = streakResult.streakCount;
          updatedUser.lastActiveDate = streakResult.lastActiveDate;
        }
      } catch (error) {
        console.error('Failed to update streak for test submission:', error);
      }
    }

    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const nextLecture = getNextLecture();

  const retryTest = () => {
    setSubmitted(false);
    setSelectedAnswers({});
    setResult({ correct: 0, wrong: 0, total: 0, passed: false });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative">
        <header className="app-navbar sticky top-0 z-10 border-b border-emerald-500/20">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-4">
            <button
              onClick={() => navigate(`/lesson/${pathId}/${lecture.id}`, {
                state: { lecture, milestone, pathTitle },
              })}
              className="order-2 flex items-center gap-2 text-emerald-100/70 transition-colors hover:text-emerald-100 lg:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('theoryTest.headerBack')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="order-1 flex items-center lg:order-2"
              aria-label="Go to dashboard"
            >
              <BrandLogo className="h-9 w-[165px] shrink-0 text-emerald-200" />
            </button>
            <div className="order-3 text-sm text-emerald-100/55">{pathTitle}</div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black">{t('theoryTest.title', { lesson: lecture.title })}</h1>
            <p className="mt-2 text-emerald-100/70">{t('theoryTest.subtitle')}</p>
          </div>

          {loading ? (
            <div className="app-card p-6">
              <p className="text-emerald-100/70">{t('theoryTest.loading')}</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="app-card p-6">
              <p className="text-emerald-100/70">{t('theoryTest.empty')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {questions.map((question, index) => {
                  const selected = selectedAnswers[index] || '';
                  const options = Array.isArray(question.options) ? question.options : [];

                  return (
                    <section key={question.id || `${lecture.id}-${index}`} className="app-card p-5">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="mt-0.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                          Q{index + 1}
                        </div>
                        <p className="text-emerald-100/90">{question.question || question.prompt}</p>
                      </div>

                      <div className="space-y-2">
                        {options.map((option) => {
                          const optionId = option?.id || '';
                          const isSelected = selected === optionId;

                          return (
                            <button
                              key={`${index}-${optionId}`}
                              type="button"
                              onClick={() => handleSelectAnswer(index, optionId)}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                                isSelected
                                  ? 'border-emerald-300/50 bg-emerald-500/10'
                                  : 'border-emerald-500/25 bg-black/25 hover:bg-emerald-500/10'
                              }`}
                              disabled={submitted}
                            >
                              <p className="text-sm font-semibold text-emerald-200">{optionId}</p>
                              <p className="mt-1 text-sm text-emerald-100/80">{option?.text || ''}</p>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-8">
                {!submitted ? (
                  <button
                    onClick={submitTest}
                    disabled={Object.keys(selectedAnswers).length !== questions.length}
                    className="app-button-primary w-full rounded-xl px-6 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('theoryTest.submit')}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="app-card p-5">
                      <h2 className="text-xl font-bold">{t('theoryTest.results.title')}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-3 py-1.5 text-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('theoryTest.results.score', { correct: result.correct, total: result.total })}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/8 px-3 py-1.5 text-emerald-100/80">
                          <HelpCircle className="w-4 h-4" />
                          {result.passed ? t('theoryTest.results.passed') : t('theoryTest.results.notPassed')}
                        </div>
                      </div>
                      {!result.passed && (
                        <p className="mt-3 text-sm text-red-300/90">
                          {t('theoryTest.results.allCorrectHint')}
                        </p>
                      )}
                    </div>

                    {result.passed ? (
                      <button
                        onClick={() => {
                          if (nextLecture) {
                            navigate(`/lesson/${pathId}/${nextLecture.lecture.id}`, {
                              state: {
                                lecture: nextLecture.lecture,
                                milestone: nextLecture.milestone,
                                pathTitle,
                              },
                            });
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                        className="app-button-primary w-full rounded-xl px-6 py-3 font-bold inline-flex items-center justify-center gap-2"
                      >
                        {t('theoryTest.actions.continue')}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={retryTest}
                        className="app-button-primary w-full rounded-xl px-6 py-3 font-bold inline-flex items-center justify-center gap-2"
                      >
                        {t('theoryTest.actions.tryAgain')}
                        <CircleX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
