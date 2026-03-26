import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteHeader from '../components/layout/SiteHeader';
import PageBackground from '../components/layout/PageBackground';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const parseLines = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const parseResources = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split('|').map((part) => part.trim());
      return { label: label || 'Resource', url: url || '' };
    });

const resourcesToText = (resources = []) =>
  resources
    .map((resource) => `${resource.label || 'Resource'}|${resource.url || ''}`)
    .join('\n');

export default function Admin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = useMemo(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, []);

  const [adminKeyInput, setAdminKeyInput] = useState(localStorage.getItem('admin_panel_key') || '');
  const [adminKey, setAdminKey] = useState(localStorage.getItem('admin_panel_key') || '');
  const [authError, setAuthError] = useState('');

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState('');
  const [roadmapDraft, setRoadmapDraft] = useState({
    title: '',
    description: '',
    color: '',
    milestones: [],
  });

  const [lessons, setLessons] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [lessonDraft, setLessonDraft] = useState({
    overview: '',
    goal: '',
    topicsText: '',
    explanationText: '',
    resourcesText: '',
  });

  const [tasks, setTasks] = useState([]);
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    assessment_kind: 'coding',
    sort_order: 1,
    difficulty: 'Easy',
    is_required: true,
    description: '',
    payloadText: '{}',
  });

  const [jobDraft, setJobDraft] = useState({
    title: '',
    company: '',
    profession: '',
    location: '',
    description: '',
    salary: '',
    job_type: 'full-time',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [roleChecking, setRoleChecking] = useState(true);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [adminDeniedMessage, setAdminDeniedMessage] = useState('');

  const clearAdminSession = () => {
    localStorage.removeItem('admin_panel_key');
    setAdminKey('');
    setAdminKeyInput('');
  };

  const parseApiResponse = async (response) => {
    const data = await response.json();
    if (response.status === 401) {
      clearAdminSession();
      throw new Error('Admin session expired. Please enter your admin key again.');
    }
    return data;
  };

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    }),
    [adminKey]
  );

  useEffect(() => {
    const verifyAdminRole = async () => {
      if (!currentUser?.id) {
        setRoleChecking(false);
        setAdminAllowed(false);
        setAdminDeniedMessage('You must be logged in to access the admin page.');
        return;
      }

      try {
        setRoleChecking(true);
        const response = await fetch(`${BACKEND_URL}/user/${currentUser.id}`);
        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          throw new Error(data.message || 'Unable to verify admin access.');
        }

        const refreshedUser = data.user;
        localStorage.setItem('user', JSON.stringify(refreshedUser));

        if (refreshedUser.isAdmin === true) {
          setAdminAllowed(true);
          setAdminDeniedMessage('');
        } else {
          setAdminAllowed(false);
          setAdminDeniedMessage('You cannot enter this page. Your account is not marked as admin.');
        }
      } catch (error) {
        setAdminAllowed(false);
        setAdminDeniedMessage(error.message || 'Unable to verify admin access.');
      } finally {
        setRoleChecking(false);
      }
    };

    verifyAdminRole();
  }, [currentUser?.id]);

  const loadRoadmaps = async (keyToUse) => {
    const response = await fetch(`${BACKEND_URL}/admin/roadmaps`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': keyToUse,
      },
    });

    const data = await parseApiResponse(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Unauthorized admin key');
    }

    setRoadmaps(data.roadmaps || []);
    setSelectedPathId('');
    setSelectedLectureId('');
    setLessons([]);

    return '';
  };

  const loadRoadmapDetails = async (pathId, keyToUse = adminKey) => {
    if (!pathId) return;
    const response = await fetch(`${BACKEND_URL}/admin/roadmaps/${pathId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': keyToUse,
      },
    });
    const data = await parseApiResponse(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load roadmap details');
    }

    setRoadmapDraft(data.roadmap);
    setLessons(data.lessons || []);

    const firstLectureId = data.lessons?.[0]?.lectureId;
    if (firstLectureId) {
      setSelectedLectureId(String(firstLectureId));
    } else {
      setSelectedLectureId('');
      setTasks([]);
    }
  };

  const loadTasks = async (pathId, lectureId) => {
    if (!pathId || !lectureId) return;

    const response = await fetch(`${BACKEND_URL}/admin/tasks/${pathId}/${lectureId}`, {
      headers: authHeaders,
    });
    const data = await parseApiResponse(response);
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load tasks');
    }

    setTasks(data.tasks || []);
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setAuthError('');
    setStatusMessage('');

    try {
      await loadRoadmaps(adminKeyInput);
      localStorage.setItem('admin_panel_key', adminKeyInput);
      setAdminKey(adminKeyInput);
      setStatusMessage('Admin access granted.');
    } catch (error) {
      setAuthError(error.message || 'Failed to login as admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) return;

    const initialize = async () => {
      try {
        setLoading(true);
        setAuthError('');
        const response = await fetch(`${BACKEND_URL}/admin/roadmaps`, { headers: authHeaders });
        const data = await parseApiResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unauthorized admin key');
        }

        setRoadmaps(data.roadmaps || []);
        setSelectedPathId((current) => {
          const stillExists = data.roadmaps?.some((roadmap) => String(roadmap.pathId) === String(current));
          return stillExists ? current : '';
        });
      } catch (error) {
        setAuthError(error.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    if (!selectedPathId || !adminKey) return;

    loadRoadmapDetails(selectedPathId).catch((error) => {
      setStatusMessage(error.message || 'Failed to load roadmap details');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPathId]);

  useEffect(() => {
    const lesson = lessons.find((item) => String(item.lectureId) === String(selectedLectureId));
    if (!lesson) {
      setLessonDraft({
        overview: '',
        goal: '',
        topicsText: '',
        explanationText: '',
        resourcesText: '',
      });
      setTasks([]);
      return;
    }

    setLessonDraft({
      overview: lesson.overview || '',
      goal: lesson.goal || '',
      topicsText: (lesson.topics || []).join('\n'),
      explanationText: (lesson.explanation || []).join('\n'),
      resourcesText: resourcesToText(lesson.resources || []),
    });

    loadTasks(selectedPathId, selectedLectureId).catch((error) => {
      setStatusMessage(error.message || 'Failed to load tasks');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLectureId, lessons, selectedPathId]);

  const updateMilestoneField = (milestoneIndex, field, value) => {
    setRoadmapDraft((current) => {
      const next = { ...current, milestones: [...current.milestones] };
      next.milestones[milestoneIndex] = {
        ...next.milestones[milestoneIndex],
        [field]: value,
      };
      return next;
    });
  };

  const updateLectureField = (milestoneIndex, lectureIndex, field, value) => {
    setRoadmapDraft((current) => {
      const next = { ...current, milestones: [...current.milestones] };
      const milestone = { ...next.milestones[milestoneIndex] };
      const lectures = [...milestone.lectures];
      lectures[lectureIndex] = {
        ...lectures[lectureIndex],
        [field]: value,
      };
      milestone.lectures = lectures;
      next.milestones[milestoneIndex] = milestone;
      return next;
    });
  };

  const addMilestone = () => {
    setRoadmapDraft((current) => ({
      ...current,
      milestones: [
        ...current.milestones,
        {
          title: 'New milestone',
          description: '',
          lectures: [],
        },
      ],
    }));
  };

  const addLecture = (milestoneIndex) => {
    setRoadmapDraft((current) => {
      const next = { ...current, milestones: [...current.milestones] };
      const milestone = { ...next.milestones[milestoneIndex] };
      milestone.lectures = [
        ...(milestone.lectures || []),
        {
          title: 'New lesson',
          duration: '20 min',
          type: 'video',
        },
      ];
      next.milestones[milestoneIndex] = milestone;
      return next;
    });
  };

  const saveRoadmap = async () => {
    if (!selectedPathId) return;
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/admin/roadmaps/${selectedPathId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(roadmapDraft),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save roadmap');
      }

      await loadRoadmapDetails(selectedPathId);
      setStatusMessage('Roadmap and lessons structure updated.');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to save roadmap');
    } finally {
      setLoading(false);
    }
  };

  const saveLessonContent = async () => {
    if (!selectedPathId || !selectedLectureId) return;
    setLoading(true);
    setStatusMessage('');

    try {
      const payload = {
        overview: lessonDraft.overview,
        goal: lessonDraft.goal,
        topics: parseLines(lessonDraft.topicsText),
        explanation: parseLines(lessonDraft.explanationText),
        resources: parseResources(lessonDraft.resourcesText),
      };

      const response = await fetch(`${BACKEND_URL}/admin/lessons/${selectedPathId}/${selectedLectureId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save lesson content');
      }

      setStatusMessage('Lesson content updated.');
      await loadRoadmapDetails(selectedPathId);
    } catch (error) {
      setStatusMessage(error.message || 'Failed to save lesson content');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (task) => {
    setLoading(true);
    setStatusMessage('');

    try {
      const payload = {
        title: task.title,
        assessment_kind: task.assessment_kind,
        sort_order: Number(task.sort_order) || 1,
        difficulty: task.difficulty,
        is_required: Boolean(task.is_required),
        description: task.description,
        payload: task.payload || {},
      };

      const response = await fetch(`${BACKEND_URL}/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update task');
      }

      await loadTasks(selectedPathId, selectedLectureId);
      setStatusMessage('Task updated.');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedPathId || !selectedLectureId) return;
    setLoading(true);
    setStatusMessage('');

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(taskDraft.payloadText || '{}');
      } catch {
        throw new Error('Task payload must be valid JSON');
      }

      const response = await fetch(`${BACKEND_URL}/admin/tasks/${selectedPathId}/${selectedLectureId}`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: taskDraft.title,
          assessment_kind: taskDraft.assessment_kind,
          sort_order: Number(taskDraft.sort_order) || 1,
          difficulty: taskDraft.difficulty,
          is_required: Boolean(taskDraft.is_required),
          description: taskDraft.description,
          payload: parsedPayload,
        }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create task');
      }

      await loadTasks(selectedPathId, selectedLectureId);
      setTaskDraft({
        title: '',
        assessment_kind: 'coding',
        sort_order: 1,
        difficulty: 'Easy',
        is_required: true,
        description: '',
        payloadText: '{}',
      });
      setStatusMessage('Task created.');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const postJobOffer = async () => {
    setLoading(true);
    setStatusMessage('');

    try {
      const response = await fetch(`${BACKEND_URL}/admin/jobs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(jobDraft),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to post job');
      }

      setJobDraft({
        title: '',
        company: '',
        profession: '',
        location: '',
        description: '',
        salary: '',
        job_type: 'full-time',
      });
      setStatusMessage('Job offer posted successfully.');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (roleChecking) {
    return (
      <div className="relative min-h-screen overflow-hidden text-emerald-50">
        <PageBackground />
        <div className="relative">
          <SiteHeader onBrandClick={() => navigate('/dashboard')} />
          <main className="mx-auto w-full max-w-xl px-6 py-12">
            <section className="app-card p-6">
              <h1 className="text-2xl font-black">{t('admin.roleCheck.title')}</h1>
              <p className="mt-2 text-sm text-emerald-100/70">{t('admin.roleCheck.subtitle')}</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (!adminAllowed) {
    return (
      <div className="relative min-h-screen overflow-hidden text-emerald-50">
        <PageBackground />
        <div className="relative">
          <SiteHeader onBrandClick={() => navigate('/dashboard')} />
          <main className="mx-auto w-full max-w-xl px-6 py-12">
            <section className="app-card p-6">
              <h1 className="text-2xl font-black">{t('admin.denied.title')}</h1>
              <p className="mt-2 text-sm text-red-300">{adminDeniedMessage || t('admin.denied.default')}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="app-button-primary mt-4 w-full py-3 font-semibold"
              >
                {t('admin.denied.back')}
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (!adminKey) {
    return (
      <div className="relative min-h-screen overflow-hidden text-emerald-50">
        <PageBackground />
        <div className="relative">
          <SiteHeader onBrandClick={() => navigate('/dashboard')} />
          <main className="mx-auto w-full max-w-xl px-6 py-12">
            <section className="app-card p-6">
              <h1 className="text-2xl font-black">{t('admin.login.title')}</h1>
              <p className="mt-2 text-sm text-emerald-100/70">{t('admin.login.subtitle')}</p>
              <input
                value={adminKeyInput}
                onChange={(event) => setAdminKeyInput(event.target.value)}
                placeholder={t('admin.login.placeholder')}
                className="mt-4 w-full rounded-xl border border-emerald-500/35 bg-black/35 px-4 py-3 text-emerald-100 outline-none"
              />
              {authError && <p className="mt-3 text-sm text-red-300">{authError}</p>}
              <button onClick={handleAdminLogin} disabled={loading} className="app-button-primary mt-4 w-full py-3 font-semibold">
                {loading ? t('admin.login.checking') : t('admin.login.open')}
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-emerald-50">
      <PageBackground />

      <div className="relative">
        <SiteHeader
          onBrandClick={() => navigate('/dashboard')}
          right={(
            <>
              <button
                onClick={() => {
                  clearAdminSession();
                }}
                className="app-button-secondary px-4 py-2 text-sm font-semibold"
              >
                {t('admin.panel.logoutAdmin')}
              </button>
            </>
          )}
        />

        <main className="mx-auto w-full max-w-7xl px-6 py-8 space-y-6">
          <section className="app-card p-6">
            <h1 className="text-3xl font-black">{t('admin.panel.title')}</h1>
            <p className="mt-2 text-emerald-100/70">{t('admin.panel.subtitle')}</p>
            {statusMessage && <p className="mt-3 text-sm text-emerald-300">{statusMessage}</p>}
          </section>

          <section className="app-card p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-sm text-emerald-100/70">{t('admin.panel.roadmap')}</label>
              <select
                value={selectedPathId}
                onChange={(event) => setSelectedPathId(event.target.value)}
                className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
              >
                <option value="">{t('admin.panel.selectRoadmap')}</option>
                {roadmaps.map((roadmap) => (
                  <option key={roadmap.pathId} value={roadmap.pathId}>
                    {roadmap.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button onClick={saveRoadmap} disabled={loading || !selectedPathId} className="app-button-primary px-4 py-2 text-sm font-semibold">
                  {t('admin.panel.saveRoadmap')}
                </button>
                {loading && (
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent"
                    aria-label="Loading"
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={roadmapDraft.title || ''}
                onChange={(event) => setRoadmapDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Roadmap title"
                className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <input
                value={roadmapDraft.description || ''}
                onChange={(event) => setRoadmapDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Roadmap description"
                className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <input
                value={roadmapDraft.color || ''}
                onChange={(event) => setRoadmapDraft((current) => ({ ...current, color: event.target.value }))}
                placeholder="Roadmap color"
                className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
            </div>

            <div className="mt-6 space-y-4">
              {roadmapDraft.milestones?.map((milestone, milestoneIndex) => (
                <div key={`${milestone.id || 'new'}-${milestoneIndex}`} className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={milestone.title || ''}
                      onChange={(event) => updateMilestoneField(milestoneIndex, 'title', event.target.value)}
                      placeholder="Milestone title"
                      className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                    />
                    <input
                      value={milestone.description || ''}
                      onChange={(event) => updateMilestoneField(milestoneIndex, 'description', event.target.value)}
                      placeholder="Milestone description"
                      className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    {milestone.lectures?.map((lecture, lectureIndex) => (
                      <div key={`${lecture.id || 'new-lecture'}-${lectureIndex}`} className="grid gap-2 md:grid-cols-4">
                        <input
                          value={lecture.title || ''}
                          onChange={(event) => updateLectureField(milestoneIndex, lectureIndex, 'title', event.target.value)}
                          placeholder="Lesson title"
                          className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                        />
                        <input
                          value={lecture.duration || ''}
                          onChange={(event) => updateLectureField(milestoneIndex, lectureIndex, 'duration', event.target.value)}
                          placeholder="Duration"
                          className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                        />
                        <select
                          value={lecture.type || 'video'}
                          onChange={(event) => updateLectureField(milestoneIndex, lectureIndex, 'type', event.target.value)}
                          className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
                        >
                          <option value="video">video</option>
                          <option value="interactive">interactive</option>
                          <option value="project">project</option>
                        </select>
                        <div className="rounded-lg border border-emerald-500/30 bg-black/20 px-3 py-2 text-sm text-emerald-100/70">
                          ID: {lecture.id || 'new'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => addLecture(milestoneIndex)} className="app-button-secondary px-3 py-2 text-sm font-semibold">
                    {t('admin.panel.addLesson')}
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addMilestone} className="app-button-secondary mt-4 px-4 py-2 text-sm font-semibold">
              {t('admin.panel.addMilestone')}
            </button>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="app-card p-6 space-y-4">
              <h2 className="text-xl font-black">{t('admin.panel.lessonContent')}</h2>
              <select
                value={selectedLectureId}
                onChange={(event) => setSelectedLectureId(event.target.value)}
                className="w-full rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
              >
                {lessons.map((lesson) => (
                  <option key={lesson.lectureId} value={lesson.lectureId}>
                    {lesson.lectureId} - {lesson.title}
                  </option>
                ))}
              </select>

              <textarea
                value={lessonDraft.overview}
                onChange={(event) => setLessonDraft((current) => ({ ...current, overview: event.target.value }))}
                rows={3}
                placeholder="Overview"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <textarea
                value={lessonDraft.goal}
                onChange={(event) => setLessonDraft((current) => ({ ...current, goal: event.target.value }))}
                rows={2}
                placeholder="Goal"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <textarea
                value={lessonDraft.topicsText}
                onChange={(event) => setLessonDraft((current) => ({ ...current, topicsText: event.target.value }))}
                rows={4}
                placeholder="Topics (one per line)"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <textarea
                value={lessonDraft.explanationText}
                onChange={(event) => setLessonDraft((current) => ({ ...current, explanationText: event.target.value }))}
                rows={4}
                placeholder="Explanation points (one per line)"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <textarea
                value={lessonDraft.resourcesText}
                onChange={(event) => setLessonDraft((current) => ({ ...current, resourcesText: event.target.value }))}
                rows={4}
                placeholder="Resources as label|url (one per line)"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />

              <button onClick={saveLessonContent} disabled={loading} className="app-button-primary px-4 py-2 text-sm font-semibold">
                {t('admin.panel.saveLesson')}
              </button>
            </div>

            <div className="app-card p-6 space-y-4">
              <h2 className="text-xl font-black">{t('admin.panel.postJobOffer')}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={jobDraft.title} onChange={(event) => setJobDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Job title" className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2" />
                <input value={jobDraft.company} onChange={(event) => setJobDraft((current) => ({ ...current, company: event.target.value }))} placeholder="Company" className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2" />
                <input value={jobDraft.profession} onChange={(event) => setJobDraft((current) => ({ ...current, profession: event.target.value }))} placeholder="Profession (frontend/backend...)" className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2" />
                <input value={jobDraft.location} onChange={(event) => setJobDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2" />
                <input value={jobDraft.salary} onChange={(event) => setJobDraft((current) => ({ ...current, salary: event.target.value }))} placeholder="Salary" className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2" />
                <select value={jobDraft.job_type} onChange={(event) => setJobDraft((current) => ({ ...current, job_type: event.target.value }))} className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent">
                  <option value="full-time">full-time</option>
                  <option value="internship">internship</option>
                  <option value="contract">contract</option>
                  <option value="part-time">part-time</option>
                </select>
              </div>
              <textarea
                value={jobDraft.description}
                onChange={(event) => setJobDraft((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                placeholder="Job description"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <button onClick={postJobOffer} disabled={loading} className="app-button-primary px-4 py-2 text-sm font-semibold">
                {t('admin.panel.postJob')}
              </button>
            </div>
          </section>

          <section className="app-card p-6 space-y-4">
            <h2 className="text-xl font-black">{t('admin.panel.tasks')}</h2>
            {tasks.map((task) => (
              <TaskEditor key={task.id} task={task} onSave={updateTask} />
            ))}

            <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 space-y-3">
              <h3 className="font-bold">{t('admin.panel.createTask')}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={taskDraft.title}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Task title"
                  className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                />
                <input
                  value={taskDraft.description}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Task description"
                  className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                />
                <select
                  value={taskDraft.assessment_kind}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, assessment_kind: event.target.value }))}
                  className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
                >
                  <option value="coding">coding</option>
                  <option value="theory">theory</option>
                </select>
                <input
                  value={taskDraft.sort_order}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, sort_order: event.target.value }))}
                  placeholder="Sort order"
                  className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                />
                <input
                  value={taskDraft.difficulty}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, difficulty: event.target.value }))}
                  placeholder="Difficulty"
                  className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
                />
              </div>
              <textarea
                value={taskDraft.payloadText}
                onChange={(event) => setTaskDraft((current) => ({ ...current, payloadText: event.target.value }))}
                rows={5}
                placeholder="Task payload JSON"
                className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
              />
              <button onClick={createTask} disabled={loading} className="app-button-secondary px-4 py-2 text-sm font-semibold">
                {t('admin.panel.addTask')}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TaskEditor({ task, onSave }) {
  const [draft, setDraft] = useState({
    ...task,
    payloadText: JSON.stringify(task.payload || {}, null, 2),
  });

  useEffect(() => {
    setDraft({
      ...task,
      payloadText: JSON.stringify(task.payload || {}, null, 2),
    });
  }, [task]);

  const handleSave = async () => {
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(draft.payloadText || '{}');
    } catch {
      return;
    }

    await onSave({
      ...draft,
      payload: parsedPayload,
    });
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={draft.title || ''}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
          placeholder="Title"
        />
        <input
          value={draft.description || ''}
          onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
          placeholder="Description"
        />
        <select
          value={draft.assessment_kind || 'coding'}
          onChange={(event) => setDraft((current) => ({ ...current, assessment_kind: event.target.value }))}
          className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 px-4 py-2.5 text-emerald-100 font-medium transition-all duration-200 hover:border-emerald-500/60 hover:bg-gradient-to-b hover:from-emerald-950/60 hover:to-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-transparent"
        >
          <option value="coding">coding</option>
          <option value="theory">theory</option>
        </select>
        <input
          value={draft.sort_order || 1}
          onChange={(event) => setDraft((current) => ({ ...current, sort_order: event.target.value }))}
          className="rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
          placeholder="Sort order"
        />
      </div>

      <textarea
        value={draft.payloadText}
        onChange={(event) => setDraft((current) => ({ ...current, payloadText: event.target.value }))}
        rows={5}
        className="w-full rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2"
        placeholder="Payload JSON"
      />

      <button onClick={handleSave} className="app-button-secondary px-4 py-2 text-sm font-semibold">
        Save Task #{task.id}
      </button>
    </div>
  );
}
