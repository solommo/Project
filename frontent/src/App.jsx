import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AiChat from './pages/AiChat';
import Remediation from './pages/Remediation';
import ForgotPassword from './pages/ForgotPassword';
import LessonInterface from './pages/LessonInterface';
import SubjectPage from './pages/SubjectPage';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import LandingPage from './pages/LandingPage';
import QuizResults from './pages/QuizResults';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import WeaknessReport from './pages/WeaknessReport';
import FocusedQuiz from './pages/FocusedQuiz';
import UploadWizard from './pages/UploadWizard';
import ProgressAnalytics from './pages/ProgressAnalytics';
import TeacherAnalytics from './pages/TeacherAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import VideoDetails from './pages/VideoDetails';
import QuizDetails from './pages/QuizDetails';
import ProtectedRoute from './components/ProtectedRoute';
import { ProtectedLayout, PublicLayout } from './components/Layout';
import EditQuiz from './pages/EditQuiz';
import SearchResults from './pages/SearchResults';
import RoleGuard from './components/RoleGuard';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ══ Public Routes (no auth required) ══════════════════════════════ */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Public Routes WITH PublicLayout (visitor navbar) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/subject/:subjectId" element={<SubjectPage />} />
          <Route path="/search"             element={<SearchResults />} />
        </Route>

        {/* ══ Protected + Layout Routes ═══════════════════════════════════ */}
        <Route element={<ProtectedLayout />}>

          {/* ── Shared (both roles can access) ── */}
          <Route path="/profile"       element={<Profile />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* ── Student-only routes ── */}
          <Route path="/dashboard"      element={<RoleGuard allowedRoles={['student']}><Dashboard /></RoleGuard>} />
          <Route path="/ai-chat"        element={<RoleGuard allowedRoles={['student']}><AiChat /></RoleGuard>} />
          <Route path="/remediation"    element={<RoleGuard allowedRoles={['student']}><Remediation /></RoleGuard>} />
          <Route path="/progress"       element={<RoleGuard allowedRoles={['student']}><ProgressAnalytics /></RoleGuard>} />
          <Route path="/quiz-results"   element={<RoleGuard allowedRoles={['student']}><QuizResults /></RoleGuard>} />
          <Route path="/weakness-report" element={<RoleGuard allowedRoles={['student']}><WeaknessReport /></RoleGuard>} />

          {/* ── Teacher-only routes ── */}
          <Route path="/teacher-dashboard" element={<RoleGuard allowedRoles={['teacher', 'admin']}><TeacherDashboard /></RoleGuard>} />
          <Route path="/teacher-analytics" element={<RoleGuard allowedRoles={['teacher', 'admin']}><TeacherAnalytics /></RoleGuard>} />
          <Route path="/video-details/:id"   element={<RoleGuard allowedRoles={['teacher', 'admin']}><VideoDetails /></RoleGuard>} />
          <Route path="/quizzes-details/:id" element={<RoleGuard allowedRoles={['teacher', 'admin']}><QuizDetails /></RoleGuard>} />
          <Route path="/edit-quiz/:id"       element={<RoleGuard allowedRoles={['teacher', 'admin']}><EditQuiz /></RoleGuard>} />

          {/* ── Admin-only routes ── */}
          <Route path="/admin-dashboard" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />

        </Route>

        {/* ══ Protected Routes WITHOUT Layout (fullscreen flows) ════════════ */}

        {/* Student-only fullscreen */}
        <Route path="/quiz/:lessonId/:teacherId/:quizId"
          element={<ProtectedRoute><RoleGuard allowedRoles={['student']}><Quiz /></RoleGuard></ProtectedRoute>} />
        <Route path="/focused-quiz"
          element={<ProtectedRoute><RoleGuard allowedRoles={['student']}><FocusedQuiz /></RoleGuard></ProtectedRoute>} />
        <Route path="/course-details"
          element={<ProtectedRoute><RoleGuard allowedRoles={['student']}><LessonInterface /></RoleGuard></ProtectedRoute>} />

        {/* Teacher-only fullscreen */}
        <Route path="/upload-wizard"
          element={<ProtectedRoute><RoleGuard allowedRoles={['teacher', 'admin']}><UploadWizard /></RoleGuard></ProtectedRoute>} />

        {/* ══ 404 Catch-All ═══════════════════════════════════════════════ */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;