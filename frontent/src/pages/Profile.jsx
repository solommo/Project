import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
  ArrowRight, User, Mail, Lock, Loader2, CheckCircle2, AlertCircle, Settings,
  Camera, Trash2
} from 'lucide-react';
import { isValidEmail, isValidPassword, isValidFullName } from '../utils/validation';
import { useLanguage } from '../context/LanguageContext';
import SkeletonLoader from '../components/SkeletonLoader';

const Profile = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const fileInputRef = useRef(null);
  
  // بيانات المستخدم من localStorage
  const [user, setUser] = useState(null);
  
  // حالات التعديل
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  
  // حالات الصورة الشخصية
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // حالات تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // حالات التحميل والرسائل
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const userJson = localStorage.getItem('user');
      if (!userJson) { navigate('/login'); return; }

      const cached = JSON.parse(userJson);
      setUser(cached);
      setName(cached.name   || '');
      setEmail(cached.email || '');
      setGrade(cached.grade || '');

      // تحديد مفتاح الصورة بناءً على الدور وعرضها مبدئياً
      const cachedPicKey = cached.role === 'student' ? 'student_profile_picture' : 'profile_picture';
      if (cached[cachedPicKey]) {
        setAvatarPreview(cached[cachedPicKey]);
      }

      // جلب أحدث بيانات من GET /api/me باستخدام JWT token
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data: fresh } = await api.get('/me');
        const merged = { ...cached, name: fresh.name, email: fresh.email };
        
        // تحديث الصورة لو الباك إند باعتها محدثة في /me
        const freshPic = fresh.student_profile_picture || fresh.profile_picture;
        if (freshPic) {
          setAvatarPreview(freshPic);
          merged[cachedPicKey] = freshPic;
        }

        setUser(merged);
        setName(fresh.name   || '');
        setEmail(fresh.email || '');
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {
        // نفضل على البيانات المحلية في حالة الخطأ
      }
    };

    loadUserData();
  }, [navigate]);

  // التعامل مع اختيار صورة جديدة من الجهاز
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // التأكد من أنها صورة
    if (!file.type.startsWith('image/')) {
      setError('يُرجى اختيار ملف صورة صحيح (PNG, JPG).');
      return;
    }

    setAvatarFile(file);
    
    // عمل رابط مؤقت لعرض المعاينة فوراً للطالب/المدرس
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // حفظ التغييرات (الاسم، البريد، والصورة الشخصية) ومزامنتها مع قاعدة البيانات
  const handleSaveProfile = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // حيلة لارافل السحرية

    // 🌟 تشكيل الحقول ديناميكياً حسب هو طالب ولا مدرس
    if (user?.role === 'student') {
      formData.append('student_name', name);
      formData.append('student_email', email);
      if (avatarFile) {
        formData.append('student_profile_picture', avatarFile);
      }
    } else {
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('profile_picture', avatarFile);
      }
    }

    // إرسال الطلب كـ POST
    const response = await api.post('/user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setSuccess('تم تحديث البيانات بنجاح في قاعدة البيانات!');
  } catch (err) {
    console.error('Error details:', err.response?.data);
    // عرض رسالة الخطأ الدقيقة القادمة من الباك إند
    setError(err.response?.data?.message || 'فشل الحفظ في السيرفر.');
  } finally {
    setLoading(false);
  }
};

  // تغيير كلمة المرور
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('أدخل كلمة المرور الحالية.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور وتأكيدها غير متطابقتين.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/user', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      setPasswordSuccess('تم تغيير كلمة المرور بنجاح!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update error:', err);
      const backendError = err.response?.data?.message || err.response?.data?.error;
      setPasswordError(backendError || 'فشل تغيير كلمة المرور. تأكد من كلمة المرور الحالية.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col pt-12 px-6 bg-gray-50 dark:bg-gray-900 transition-colors" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <SkeletonLoader type="card" height="150px" />
          <SkeletonLoader type="bento" height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-['Cairo'] transition-colors" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#103B66] dark:hover:text-blue-400 transition-colors font-bold"
            >
              <ArrowRight className={`w-5 h-5 ${lang === 'en' ? 'rotate-180' : ''}`} />
              {t('back')}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-[#103B66] dark:bg-blue-600 p-2 rounded-lg transition-colors">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#103B66] dark:text-white transition-colors">{t('profile_title')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                title={t('settings')}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden md:inline">{t('settings')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ══ معلومات الحساب ومعاينة الصورة ══ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <User className="w-6 h-6 text-[#103B66] dark:text-blue-400 transition-colors" />
            {t('edit_profile')}
          </h2>

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2 transition-colors">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* ══ حقل تحميل وتغيير الصورة الشخصية (Avatar Picker UI) ══ */}
            <div className="flex flex-col items-center justify-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange} 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group w-28 w-28 h-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-700 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <User className="w-14 h-14" />
                  </div>
                )}
                
                {/* طبقة الـ Hover الشفافة لتنبيه المستخدم */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-1">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] font-bold">تغيير الصورة</span>
                </div>
              </div>
              
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => { setAvatarFile(null); setAvatarPreview(user?.student_profile_picture || user?.profile_picture || ''); }}
                  className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> إلغاء اختيار الصورة
                </button>
              )}
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 flex items-center gap-2 transition-colors">
                <User className="w-4 h-4" />
                {t('full_name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500 disabled:opacity-60 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 flex items-center gap-2 transition-colors">
                <Mail className="w-4 h-4" />
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500 text-left disabled:opacity-60 transition-colors"
                dir="ltr"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#103B66] dark:bg-blue-600 hover:bg-[#0c2d4d] dark:hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors duration-300 shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save_changes')
              )}
            </button>
          </form>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <Lock className="w-6 h-6 text-[#103B66] dark:text-blue-400 transition-colors" />
            {t('change_password')}
          </h2>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2 transition-colors">
              <AlertCircle className="w-4 h-4" />
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 transition-colors">{t('current_password')}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500 text-left placeholder:text-right dark:placeholder:text-gray-400 disabled:opacity-60 transition-colors"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 transition-colors">{t('new_password')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500 text-left placeholder:text-right dark:placeholder:text-gray-400 disabled:opacity-60 transition-colors"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2 transition-colors">{t('confirm_new_password')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#103B66] dark:focus:ring-blue-500 text-left placeholder:text-right dark:placeholder:text-gray-400 disabled:opacity-60 transition-colors"
                dir="ltr"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#103B66] dark:bg-blue-600 hover:bg-[#0c2d4d] dark:hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors duration-300 shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('updating')}
                </>
              ) : (
                t('update_password')
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;