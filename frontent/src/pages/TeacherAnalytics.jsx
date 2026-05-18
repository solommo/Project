import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Brain, ArrowRight, Video, ClipboardList, TrendingUp, Clock,
  ChevronDown, AlertTriangle, BarChart2, Eye, RefreshCcw, Play, FileText, Edit3,
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { TargetIcon } from '../components/TargetIcon';

/* ════════════════════════════════════════════════════
   DESIGN SYSTEM — Extracted from LandingPage.jsx
════════════════════════════════════════════════════ */
function buildTheme(dk){return dk?{bg:"#0B1120",bgPanel:"#0D1526",bgCard:"rgba(255,255,255,0.035)",border:"rgba(255,255,255,0.08)",borderAccent:"rgba(79,70,229,0.38)",accent:"#4F46E5",accentDim:"rgba(79,70,229,0.14)",iconA:"#38BDF8",iconBgA:"rgba(56,189,248,0.10)",iconBorderA:"rgba(56,189,248,0.22)",iconB:"#818CF8",iconBgB:"rgba(129,140,248,0.11)",iconBorderB:"rgba(129,140,248,0.25)",textPrimary:"#F8FAFC",textMuted:"#94A3B8",textDim:"#475569",shadowCard:"0 1px 1px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.35)",trackBg:"rgba(255,255,255,0.06)",green:"#34D399",greenDim:"rgba(52,211,153,0.12)",greenBorder:"rgba(52,211,153,0.22)",red:"#F87171",redDim:"rgba(248,113,113,0.10)",redBorder:"rgba(248,113,113,0.20)",yellow:"#FBBF24",yellowDim:"rgba(251,191,36,0.12)",yellowBorder:"rgba(251,191,36,0.22)",headerBg:"rgba(11,17,32,0.88)"}:{bg:"#F8FAFC",bgPanel:"#FFFFFF",bgCard:"#FFFFFF",border:"#E2E8F0",borderAccent:"rgba(15,76,129,0.28)",accent:"#0F4C81",accentDim:"rgba(15,76,129,0.08)",iconA:"#0F4C81",iconBgA:"rgba(15,76,129,0.08)",iconBorderA:"rgba(15,76,129,0.18)",iconB:"#2563EB",iconBgB:"rgba(37,99,235,0.07)",iconBorderB:"rgba(37,99,235,0.16)",textPrimary:"#0F172A",textMuted:"#64748B",textDim:"#94A3B8",shadowCard:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",trackBg:"#E2E8F0",green:"#059669",greenDim:"rgba(5,150,105,0.08)",greenBorder:"rgba(5,150,105,0.18)",red:"#EF4444",redDim:"rgba(239,68,68,0.08)",redBorder:"rgba(239,68,68,0.18)",yellow:"#D97706",yellowDim:"rgba(217,119,6,0.08)",yellowBorder:"rgba(217,119,6,0.18)",headerBg:"rgba(248,250,252,0.90)"};}
const _c=(T,x)=>({background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"16px",boxShadow:T.shadowCard,...x});
const _t={transition:"all 0.25s ease"};
const _iw=(bg,bd,sz="40px",r="10px")=>({..._t,width:sz,height:sz,borderRadius:r,background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0});
const _input = (T) => ({..._t, width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "14px 16px", color: T.textPrimary, outline: "none", fontSize: "0.95rem"});

// ── Static lookup maps ────────────────────────────
const getSubjectStyle = (subject, T) => {
  const map = {
    Physics:     { bg: T.iconBgA,   text: T.iconA },
    Chemistry:   { bg: T.greenDim,  text: T.green },
    Mathematics: { bg: T.iconBgB,   text: T.iconB },
    Biology:     { bg: T.yellowDim, text: T.yellow },
  };
  return map[subject] || { bg: T.bgCard, text: T.textMuted };
};

const SUBJECT_NAME_KEYS = {
  Physics: 'subject_physics', Chemistry: 'subject_chemistry',
  Mathematics: 'subject_math', Biology: 'subject_biology',
};

const getSubjectLabel = (t, subject) => {
  const key = SUBJECT_NAME_KEYS[subject];
  return key ? t(key) : subject;
};

const SCORE_BUCKETS = ['0–20%', '21–40%', '41–60%', '61–80%', '81–100%'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getDistBarColor = (idx, T) =>
  [T.red, T.yellow, T.iconA, T.green, T.iconB][idx] || T.textMuted;

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLoader = ({ rows = 3, T }) => (
  <div style={{display:"flex",flexDirection:"column",gap:"12px",padding:"16px 0"}}>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonLoader key={i} type="card" height="52px" className="w-full" />
    ))}
  </div>
);

const TeacherAnalyticsLoadingSkeleton = ({ T, lang, glass }) => (
  <div style={{..._t,background:T.bg,minHeight:"100vh",fontFamily:"'Cairo',sans-serif"}} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <main style={{maxWidth:"1152px",margin:"0 auto",padding:"32px 24px",display:"flex",flexDirection:"column",gap:"28px"}}>
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={glass({ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' })}>
              <SkeletonLoader type="card" width="44px" height="44px" />
              <div style={{display:"flex",flexDirection:"column",gap:"8px",flex:1}}>
                <SkeletonLoader type="text" width="62%" height="10px" />
                <SkeletonLoader type="text" width="40%" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={glass({ padding: '20px' })}>
            <SkeletonLoader type="text" width="42%" height="12px" className="mb-4" />
            <SkeletonLoader type="card" height="320px" className="w-full" />
          </div>
          <div style={glass({ padding: '20px' })}>
            <SkeletonLoader type="text" width="36%" height="12px" className="mb-4" />
            <SkeletonLoader type="card" height="320px" className="w-full" />
          </div>
        </div>
      </section>
    </main>
  </div>
);

const SectionError = ({ message, onRetry, T, retryLabel }) => (
  <div style={{padding:"40px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",textAlign:"center"}}>
    <AlertTriangle style={{width:"32px",height:"32px",color:T.yellow}} />
    <p style={{fontSize:"0.9rem",color:T.textDim,fontWeight:600}}>{message}</p>
    <button
      onClick={onRetry}
      style={{..._t,display:"flex",alignItems:"center",gap:"6px",fontSize:"0.9rem",fontWeight:700,color:T.accent,background:"transparent",border:"none",cursor:"pointer"}}
    >
      <RefreshCcw style={{width:"16px",height:"16px"}} />
      {retryLabel}
    </button>
  </div>
);

// ── Custom Tooltips ───────────────────────────────────────────────────────────

const ViewsTooltip = ({ active, payload, label, T, viewsLabel }) => {
  if (!active || !payload?.length || !T) return null;
  return (
    <div style={{..._c(T),padding:"12px",fontSize:"0.875rem"}} dir="rtl">
      <p style={{fontSize:"0.75rem",color:T.textMuted,marginBottom:"4px",fontWeight:700}}>{label}</p>
      <p style={{fontWeight:800,color:T.accent}}>{payload[0].value} {viewsLabel}</p>
    </div>
  );
};

const DistTooltip = ({ active, payload, label, T, studentsLabel }) => {
  if (!active || !payload?.length || !T) return null;
  return (
    <div style={{..._c(T),padding:"12px",fontSize:"0.875rem"}} dir="rtl">
      <p style={{fontSize:"0.75rem",color:T.textMuted,marginBottom:"4px",fontWeight:700}}>{label}</p>
      <p style={{fontWeight:800,color:T.textPrimary}}>{payload[0].value} {studentsLabel}</p>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const { theme, C, glass } = useTheme();
  const toast = useToast();
  const isDark = theme === 'dark';
  const T = buildTheme(isDark);

  // ── Data state ────────────────────────────────────────────────────────────
  const [videos, setVideos] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // ── Selected lesson (for drill-down charts) ───────────────────────────────
  const [selectedId, setSelectedId] = useState(null);

  const openVideoDetails = useCallback((videoId) => {
    if (videoId) {
      navigate(`/video-details/${videoId}`);
      return;
    }
    toast.error(t('teacher_analytics_error_video_id_unavailable'));
  }, [navigate, t, toast]);

  const openQuizDetails = useCallback((quizId) => {
    if (quizId) {
      navigate(`/quizzes-details/${quizId}`);
      return;
    }
    toast.error(t('teacher_analytics_error_quiz_id_unavailable'));
  }, [navigate, t, toast]);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/teachers/dashboard');
      const payload = res.data ?? {};
      const studentAttempts = Array.isArray(payload.student_attempts) ? payload.student_attempts : [];
      const quizAttemptsCount = Array.isArray(payload.quiz_attempts_count) ? payload.quiz_attempts_count : [];

      setDashboardStats({
        videos_count: Number(payload.videos_count ?? 0),
        quizzes_count: Number(payload.quizzes_count ?? 0),
        average_score: payload.average_score ?? null,
      });

      setStudentAttempts(studentAttempts);

      const formattedVideos = studentAttempts.map((attempt, idx) => {
        const lessonTitle = attempt.lesson_title || attempt.video_title || 'درس بدون عنوان';
        const videoId = attempt.video_id ?? null;
        const lessonId = attempt.lesson_id ?? null;
        return {
          id: videoId ?? lessonId ?? `attempt-${idx + 1}`,
          videoId,
          selectionKey: `video:attempt-${idx + 1}`,
          contentType: 'video',
          lessonId,
          lessonTitle,
          videoTitle: attempt.video_title || lessonTitle,
          lesson: lessonTitle,
          subject: payload.teacher?.subject_name || 'Physics',
          views: null,
          quizAttempts: null,
          avgScore: null,
          score: attempt.score ?? 0,
          totalMarks: attempt.total_marks ?? 0,
          topWeakSubtopic: null,
          scoreDistribution: [],
          missedQuestions: [],
        };
      });

      const formattedQuizzes = quizAttemptsCount.map((quiz, idx) => {
        const quizId = quiz.quiz_id ?? null;
        const lessonId = quiz.lesson_id ?? null;
        return {
          id: quizId ?? lessonId ?? `quiz-${idx + 1}`,
          quizId,
          selectionKey: `quiz:attempt-${idx + 1}`,
          contentType: 'quiz',
          title: quiz.title || 'اختبار',
          lessonId,
          lesson: quiz.title || 'اختبار',
          subject: payload.teacher?.subject_name || 'Physics',
          views: null,
          quizAttempts: Number(quiz.quizzes_attempt_count ?? 0) || 0,
          avgScore: null,
          topWeakSubtopic: null,
          scoreDistribution: [],
          missedQuestions: [],
        };
      });

      setVideos(formattedVideos);
      setQuizzes(formattedQuizzes);

      const mergedContent = [...formattedVideos, ...formattedQuizzes];
      setSelectedId((prev) => {
        if (prev != null && mergedContent.some((item) => String(item.selectionKey) === String(prev))) {
          return prev;
        }
        return mergedContent[0]?.selectionKey ?? null;
      });
    } catch (err) {
      console.error('Failed to fetch teacher analytics', err);
      setError(t('teacher_analytics_error_loading_data'));
      setVideos([]);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Derived values ────────────────────────────────────────────────────────
  const content = [...videos, ...quizzes];
  const selected = content.find(c => String(c.selectionKey) === String(selectedId)) ?? content[0] ?? null;
  const distData = Array.isArray(selected?.scoreDistribution)
    ? selected.scoreDistribution.map((count, i) => ({ bucket: SCORE_BUCKETS[i], طلاب: count }))
    : [];
  const safeViewsData = videos
    .filter((video) => Number(video.views) > 0)
    .map((video, idx) => ({
      day: video.lesson || `#${idx + 1}`,
      'مشاهدات': Number(video.views) || 0,
    }));

  const totalViews   = safeViewsData.reduce((s, d) => s + d['مشاهدات'], 0);
  const peakViews    = safeViewsData.length ? Math.max(...safeViewsData.map(d => d['مشاهدات'])) : 0;
  const avgDailyView = safeViewsData.length ? Math.round(totalViews / safeViewsData.length) : 0;

  const totalVideosCount   = dashboardStats?.videos_count ?? 0;
  const totalQuizzesCount  = dashboardStats?.quizzes_count ?? 0;
  const averageScoreDisplay =
    dashboardStats?.average_score != null
      ? (typeof dashboardStats.average_score === 'string'
        ? dashboardStats.average_score
        : `${dashboardStats.average_score}%`)
      : '0%';

  if (!dashboardStats) {
    return <TeacherAnalyticsLoadingSkeleton T={T} lang={lang} glass={glass} />;
  }

  return (
    <div style={{..._t,background:T.bg,minHeight:"100vh",fontFamily:"'Cairo',sans-serif"}} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ═══ HEADER ═══ */}
      <header style={{position:"sticky",top:0,zIndex:20,background:T.headerBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`}}>
        <div className="max-w-[1152px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div style={_iw(T.iconBgB,T.iconBorderB,"40px","10px")}>
              <TargetIcon className="w-7 h-7 text-violet-600 dark:text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold" style={{color:T.textPrimary}}>{t('content_analytics')}</h1>
              <p className="text-xs" style={{color:T.textMuted}}>{t('analytics_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{color:T.textMuted}}
            >
              <ArrowRight className={`w-4 h-4 ${lang==='en'?'rotate-180':''}`} />
              {t('teacher_control')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1152px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">

        {/* ═══ SECTION 1 — KPI Cards ═══ */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { labelKey: 'total_videos', value: totalVideosCount, icon: Video, iconBg: T.iconBgB, iconBorder: T.iconBorderB, iconCls: T.iconB },
              { labelKey: 'total_quizzes', label: 'إجمالي الاختبارات', value: totalQuizzesCount, icon: ClipboardList, iconBg: T.iconBgA, iconBorder: T.iconBorderA, iconCls: T.iconA },
              { labelKey: 'avg_score', value: averageScoreDisplay, icon: TrendingUp, iconBg: T.greenDim, iconBorder: T.greenBorder, iconCls: T.green },
            ].map(({ labelKey, label, value, icon: Icon, iconBg, iconBorder, iconCls }) => (
              <div key={labelKey} style={{..._c(T),padding:"20px"}}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{color:T.textMuted}}>{label || t(labelKey)}</p>
                  <div style={_iw(iconBg,iconBorder,"36px","10px")}>
                    <Icon style={{width:"18px",height:"18px",color:iconCls}} />
                  </div>
                </div>
                {isLoading ? (
                  <SkeletonLoader type="text" width="80px" height="30px" />
                ) : (
                  <p className="text-2xl font-extrabold leading-none" style={{color:T.textPrimary}}>
                    {value ?? '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 2 — Content Performance Table ═══ */}
        <section>
          <h2 className="text-xl font-extrabold mb-5 flex items-center gap-2" style={{color:T.textPrimary}}>
            <BarChart2 className="w-5 h-5" style={{color:T.accent}} />
            {t('content_performance')}
          </h2>

          <div style={{..._c(T),overflow:"hidden"}}>
            {isLoading ? (
              <div className="p-6"><SectionLoader rows={5} T={T} /></div>
            ) : error ? (
              <div className="p-6"><SectionError message={error} onRetry={fetchAnalytics} T={T} retryLabel={t('retry')} /></div>
            ) : (
              <div className="p-4 sm:p-6 flex flex-col gap-8">
                
                {/* Videos Section */}
                <div>
                  <h3 className="text-base font-extrabold mb-4" style={{color:T.textPrimary}}>فيديوهات المادة</h3>
                  {videos.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {videos.map(v => {
                        const subj = getSubjectStyle(v.subject, T);
                        const isSelected = String(selectedId) === String(v.selectionKey);
                        const viewsCount = studentAttempts.filter((a) => String(a.video_id ?? a.videoId) === String(v.videoId)).length || 0;
                        let barColor = T.textDim;
                        if (v.avgScore !== null) {
                          if (v.avgScore < 50) barColor = T.red;
                          else if (v.avgScore < 75) barColor = T.yellow;
                          else barColor = T.green;
                        }

                        return (
                          <div
                            key={v.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openVideoDetails(v.videoId ?? v.lessonId)}
                            onKeyDown={(e) => {
                              if (e.target !== e.currentTarget) return;
                              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                                e.preventDefault();
                                openVideoDetails(v.id);
                              }
                            }}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl cursor-pointer"
                            style={{
                              ..._t,
                              border:`1px solid ${isSelected?T.borderAccent:T.border}`,
                              background:isSelected?T.accentDim:T.bgPanel,
                            }}
                            onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.borderColor=T.textMuted}}
                            onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.borderColor=T.border}}
                          >
                            {/* Left Side: Icon and Title */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div style={_iw(subj.bg,subj.text,"48px","12px")}>
                                <Play style={{width:"24px",height:"24px",color:subj.text}} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis" style={{color:T.textPrimary}}>{v.lesson}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                  <span style={{fontWeight:700,padding:"2px 8px",borderRadius:"12px",background:subj.bg,color:subj.text}}>
                                    {getSubjectLabel(t, v.subject) || '—'}
                                  </span>
                                  <span style={{color:T.textDim,fontWeight:600}} className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" style={{color:T.textMuted}} /> {viewsCount} مشاهدة
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Stats & Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                              <div className="w-full sm:w-48">
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                  <span style={{color:T.textMuted}}>متوسط الدرجات</span>
                                  <span style={{color:T.textPrimary}}>
                                    {v.totalMarks ? `${v.score ?? 0} من ${v.totalMarks}` : '—'}
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full overflow-hidden" style={{background:T.bg}}>
                                  <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{background:barColor, width:`${v.avgScore||0}%`}}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(v.selectionKey);
                                }}
                                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                                style={{..._t,background:isSelected?T.accent:T.bg,color:isSelected?"#FFF":T.textPrimary,border:`1px solid ${isSelected?T.accent:T.border}`}}
                                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background=T.bgCard}}
                                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background=T.bg}}
                              >
                                <BarChart2 className="w-4 h-4" />
                                {isSelected ? t('selected_label') : t('details_label')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={glass({ padding: '8px' })}>
                      <EmptyState
                        icon={Video}
                        title={t('teacher_analytics_no_videos_title')}
                        description={t('teacher_analytics_no_videos_description')}
                      />
                    </div>
                  )}
                </div>

                {/* Quizzes Section */}
                <div>
                  <h3 className="text-base font-extrabold mb-4" style={{color:T.textPrimary}}>اختبارات المادة</h3>
                  {quizzes.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {quizzes.map(q => {
                        const subj = getSubjectStyle(q.subject, T);
                        const isSelected = String(selectedId) === String(q.selectionKey);
                        const rawQuizTitle = typeof q.title === 'string' ? q.title.trim() : '';
                        const resolvedQuizTitle = rawQuizTitle || 'اختبار';
                        
                        return (
                          <div
                            key={q.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openQuizDetails(q.quizId ?? q.lessonId)}
                            onKeyDown={(e) => {
                              if (e.target !== e.currentTarget) return;
                              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                                e.preventDefault();
                                openQuizDetails(q.id);
                              }
                            }}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl cursor-pointer"
                            style={{
                              ..._t,
                              border:`1px solid ${isSelected?T.borderAccent:T.border}`,
                              background:isSelected?T.accentDim:T.bgPanel,
                            }}
                            onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.borderColor=T.textMuted}}
                            onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.borderColor=T.border}}
                          >
                            {/* Left Side: Icon and Title */}
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div style={_iw(subj.bg,subj.text,"48px","12px")}>
                                <FileText style={{width:"24px",height:"24px",color:subj.text}} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis" style={{color:T.textPrimary}}>{resolvedQuizTitle}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                  <span style={{fontWeight:700,padding:"2px 8px",borderRadius:"12px",background:subj.bg,color:subj.text}}>
                                    {getSubjectLabel(t, q.subject) || '—'}
                                  </span>
                                  <span style={{color:T.textDim,fontWeight:600}} className="flex items-center gap-1">
                                    <ClipboardList className="w-3.5 h-3.5" style={{color:T.textMuted}} /> {q.quizAttempts !== null ? q.quizAttempts.toLocaleString() : '—'} محاولة
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Buttons Only (No Progress Bar based on your code) */}
                            <div className="flex flex-row items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/edit-quiz/${q.id}`);
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-3 sm:px-4 py-2 rounded-lg"
                                style={{..._t,border:`1px solid ${T.iconBorderB}`,background:T.iconBgB,color:T.iconB}}
                              >
                                <Edit3 className="w-4 h-4" />
                                تعديل
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(q.selectionKey);
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-3 sm:px-4 py-2 rounded-lg"
                                style={{..._t,background:isSelected?T.accent:T.bg,color:isSelected?"#FFF":T.textPrimary,border:`1px solid ${isSelected?T.accent:T.border}`}}
                                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background=T.bgCard}}
                                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background=T.bg}}
                              >
                                <BarChart2 className="w-4 h-4" />
                                {isSelected ? t('selected_label') : t('details_label')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={glass({ padding: '8px' })}>
                      <EmptyState
                        icon={ClipboardList}
                        title={t('teacher_analytics_no_quizzes_title')}
                        description={t('teacher_analytics_no_quizzes_description')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default TeacherAnalytics;