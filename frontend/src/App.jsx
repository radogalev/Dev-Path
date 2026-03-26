import './App.css'
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import CheckInbox from "./pages/CheckInbox";
import EmailVerification from "./pages/EmailVerification";
import Paths from "./pages/Paths";
import Events from "./pages/Events";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplicationForm from "./pages/ApplicationForm";
import Lesson from "./pages/Lesson";
import RoadmapFlow from "./pages/RoadmapFlow";
import TheoryTest from "./pages/TheoryTest";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import NotFound from './pages/NotFound';
import { bootstrapLearningData } from './services/learningBootstrap';
import SmoothScrollProvider from './components/effects/SmoothScrollProvider';
import CustomCursor from './components/effects/CustomCursor';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppErrorBoundary from './components/errors/AppErrorBoundary';
import SettingsMenu from './components/layout/SettingsMenu';
import SiteFooter from './components/layout/SiteFooter';


function App() {
  useEffect(() => {
    bootstrapLearningData();
  }, []);

  return (
    <AppErrorBoundary>
      <Router>
        <SmoothScrollProvider />
        <CustomCursor />
        <Routes>
          <Route path = "/" element={<Home />} />
          <Route path = "/login" element={<Login />} />
          <Route path = "/signin" element={<SignIn />} />
          <Route path = "/check-email" element={<CheckInbox />} />
          <Route path = "/verify-email" element={<EmailVerification />} />

          <Route path = "/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path = "/paths" element={<Paths />} />
          <Route path = "/leaderboard" element={<Leaderboard />} />
          <Route path = "/roadmap/:pathId" element={<ProtectedRoute><RoadmapFlow /></ProtectedRoute>} />
          <Route path = "/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path = "/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path = "/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path = "/apply" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path = "/lesson/:pathId/:lectureId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
          <Route path = "/lesson-test/:pathId/:lectureId" element={<ProtectedRoute><TheoryTest /></ProtectedRoute>} />
          <Route path = "/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <SiteFooter />

        <div className="fixed bottom-5 right-5 z-[70]">
          <SettingsMenu compact openUpward />
        </div>
      </Router>
    </AppErrorBoundary>
  )
}

export default App;
