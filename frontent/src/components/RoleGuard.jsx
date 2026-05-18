import { Navigate } from 'react-router-dom';

/**
 * RoleGuard — protects routes based on user role.
 *
 * Props:
 *   allowedRoles  string[]   e.g. ['student'] or ['teacher', 'admin']
 *   children      ReactNode  the route component to render if access is allowed
 *
 * Redirect rules (in priority order):
 *   1. No token / no user  → /login
 *   2. Role is 'teacher' or 'admin' but route requires 'student'  → /teacher-dashboard
 *   3. Role is 'student' but route requires 'teacher'             → /dashboard
 *   4. Any other unexpected role mismatch                        → /login
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  // --- resolve current user ---
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) user = JSON.parse(raw);
  } catch {
    // corrupted data — treat as unauthenticated
  }

  const token    = localStorage.getItem('token');
  const userRole = user?.role ?? null;

  // 1. Not logged in at all
  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role is allowed — render children
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // 3. Role mismatch — send to the correct home for this role
  if (userRole === 'teacher' || userRole === 'admin') {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  if (userRole === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Unknown role
  return <Navigate to="/login" replace />;
};

export default RoleGuard;
