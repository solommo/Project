import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

// ── Authenticated API Instance ────────────────────────────────────────────────
// يُستخدم للطلبات المحمية التي تتطلب تسجيل دخول
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor لإضافة الـ token تلقائياً مع كل request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor — global 401 / token-expiry handler ─────────────────
// Guards against redirect storms when several requests 401 simultaneously.
let _isRedirecting = false;

api.interceptors.response.use(
  // ✅ Pass all successful responses straight through
  (response) => response,

  // ❌ Handle errors globally
  (error) => {
    if (error.response?.status === 401 && !_isRedirecting) {
      _isRedirecting = true;

      // 1. Wipe auth data so stale credentials don't linger
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 2. Build the redirect URL — preserve where the user was so the login
      //    page can send them straight back after a successful re-auth.
      //    e.g.  /login?redirect=%2Fteacher-dashboard
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl =
        '/login' +
        (currentPath && currentPath !== '/login'
          ? '?redirect=' + encodeURIComponent(currentPath)
          : '');

      // 3. Hard redirect (we're outside React so useNavigate is unavailable)
      window.location.href = loginUrl;
    }

    return Promise.reject(error);
  }
);

// ── Public API Instance ───────────────────────────────────────────────────────
// يُستخدم للطلبات العامة التي لا تتطلب تسجيل دخول (مثل تصفح المواد)
// لا يُضيف Auth header ولا يعيد توجيه المستخدم عند خطأ 401
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor بسيط للـ publicApi - فقط للتعامل مع الأخطاء بدون إعادة توجيه
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // لا نعيد توجيه المستخدم للـ login - فقط نرجع الخطأ
    console.warn('Public API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
