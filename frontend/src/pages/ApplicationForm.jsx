import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  User,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import PageBackground from '../components/layout/PageBackground';
import SiteHeader from '../components/layout/SiteHeader';
import UserHeaderActions from '../components/layout/UserHeaderActions';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const job = location.state?.job || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    yearsExperience: '',
    startDate: '',
    resume: '',
    coverLetter: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState({});

  // Get user data from localStorage
  const currentUser = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('applicationForm.errors.fullNameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('applicationForm.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('applicationForm.errors.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('applicationForm.errors.phoneRequired');
    }
    if (!formData.yearsExperience) {
      newErrors.yearsExperience = t('applicationForm.errors.yearsRequired');
    }
    if (!formData.startDate) {
      newErrors.startDate = t('applicationForm.errors.dateRequired');
    }
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = t('applicationForm.errors.coverRequired');
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!currentUser?.id) {
      setSubmitError(t('applicationForm.errors.mustLogin'));
      return;
    }

    if (!job?.id) {
      setSubmitError(t('applicationForm.errors.jobMissing'));
      return;
    }

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          jobId: job.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          yearsExperience: formData.yearsExperience,
          startDate: formData.startDate,
          resume: formData.resume,
          coverLetter: formData.coverLetter,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || t('applicationForm.errors.submitFailed'));
      }

      setSubmitted(true);

      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/jobs');
      }, 3000);
    } catch (error) {
      setSubmitError(error.message || t('applicationForm.errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-hidden text-emerald-50">
        <PageBackground />

        <div className="relative">
          <SiteHeader
            onBrandClick={() => navigate('/dashboard')}
            right={
              <UserHeaderActions
                currentUser={currentUser}
                onDashboard={() => navigate('/dashboard')}
                onLogout={handleLogout}
                showStreak
              />
            }
          />

          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="app-card p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-500/20">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 animate-bounce" />
                </div>
              </div>

              <h1 className="text-4xl font-black mb-4">{t('applicationForm.success.title')}</h1>
              <p className="text-xl text-emerald-100/80 mb-2">
                {t('applicationForm.success.thanks', { title: job.title, company: job.company })}
              </p>
              <p className="text-emerald-100/65 mb-8">
                {t('applicationForm.success.reviewMsg')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-100/80">
                    {t('applicationForm.success.nextSteps')}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-100/80">
                    {t('applicationForm.success.tip')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/jobs')}
                  className="app-button-primary px-8 py-3 font-bold"
                >
                  {t('applicationForm.success.viewMoreJobs')}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="app-button-secondary px-8 py-3 font-bold"
                >
                  {t('applicationForm.success.backDashboard')}
                </button>
              </div>
            </div>
          </div>
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
          right={
            <UserHeaderActions
              currentUser={currentUser}
              onDashboard={() => navigate('/dashboard')}
              onLogout={handleLogout}
              showStreak
            />
          }
        />

        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
            className="mb-6 flex items-center gap-2 text-emerald-100/65 transition-colors group hover:text-emerald-100"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {t('applicationForm.form.backToJob')}
          </button>

          <div className="app-card mb-8 p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/12 text-2xl">
                {job.logo || '💼'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black mb-2">{job.title}</h1>
                <p className="text-emerald-100/65">{job.company}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError ? (
              <div className="rounded-lg border border-red-500/35 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                {submitError}
              </div>
            ) : null}

            <div className="app-card p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-emerald-300" />
                  {t('applicationForm.form.personalInfo')}
              </h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2">
                    {t('applicationForm.form.fullName')}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 placeholder-emerald-100/40 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('applicationForm.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 placeholder-emerald-100/40 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('applicationForm.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 placeholder-emerald-100/40 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="app-card p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-emerald-300" />
                  {t('applicationForm.form.experienceAvailability')}
              </h2>

              <div className="space-y-5">
                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2">
                    {t('applicationForm.form.yearsExperience')}
                  </label>
                  <select
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none"
                  >
                    <option value="">{t('applicationForm.form.selectExperience')}</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  {errors.yearsExperience && (
                    <p className="mt-1 text-xs text-red-400">{errors.yearsExperience}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('applicationForm.form.startDate')}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-400">{errors.startDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Application Message */}
            <div className="app-card p-8">
              <h2 className="text-2xl font-bold mb-6">{t('applicationForm.form.interestTitle')}</h2>

              <div className="space-y-5">
                {/* Resume/Portfolio */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2">
                    {t('applicationForm.form.portfolioResume')}
                  </label>
                  <textarea
                    name="resume"
                    value={formData.resume}
                    onChange={handleInputChange}
                    placeholder="Link to your portfolio, GitHub, or resume URL (optional)"
                    rows="3"
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 placeholder-emerald-100/40 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none resize-none"
                  />
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-semibold text-emerald-200 mb-2">
                    {t('applicationForm.form.coverLetter')}
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    rows="6"
                    className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-50 placeholder-emerald-100/40 transition focus:border-emerald-500/60 focus:bg-emerald-500/15 focus:outline-none resize-none"
                  />
                  {errors.coverLetter && (
                    <p className="mt-1 text-xs text-red-400">{errors.coverLetter}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="app-card p-8 border-t-2 border-t-emerald-500 flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100/65">
                  {t('applicationForm.form.agreement')}
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="app-button-primary px-12 py-3 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t('applicationForm.form.submitting') : t('applicationForm.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
