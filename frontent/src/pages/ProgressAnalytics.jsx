import { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import TargetIcon from '../components/TargetIcon';  
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, ArrowRight, Eye, Brain, Activity, BookOpen, BarChart2, Calendar, ClipboardList, Target, CheckCircle2, XCircle
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

// ── Static meta ───────────────────────────────────────────────────────────────

const SUBJECTS_META = [
  { key: 'Physics',     id: '1', name: 'الفيزياء',   emoji: '⚡', color: '#103B66' },
  { key: 'Mathematics', id: '2', name: 'الرياضيات',  emoji: '📐', color: '#7C3AED' },
  { key: 'Chemistry',   id: '3', name: 'الكيمياء',   emoji: '🧪', color: '#059669' },
  { key: 'Biology',     id: '4', name: 'الأحياء',    emoji: '🌿', color: '#D97706' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getMasteryBadge = (pct) => {
  if (pct >= 80) return { dot: '🟢', label: 'قوي', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/20' };
  if (pct >= 60) return { dot: '🟡', label: 'متوسط', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/20' };
  return { dot: '🔴', label: 'يحتاج مراجعة', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' };
};

const barColor = (acc) => acc >= 80 ? '#4ade80' : acc >= 60 ? '#facc15' : '#f87171';

// ── Subcomponents ─────────────────────────────────────────────────────────────

/** Tiny SVG sparkline from last ≤5 quiz scores */
const Sparkline = ({ quizzes, color }) => {
  const pts = quizzes.slice(-5);
  if (pts.length < 2) return null;
  const W = 64, H = 26, PAD = 3;
  const xs = pts.map((_, i) => PAD + (i / (pts.length - 1)) * (W - PAD * 2));
  const scores = pts.map(q => q.score);
  const lo = Math.min(...scores), hi = Math.max(...scores);
  const range = hi - lo || 1;
  const ys = scores.map(s => PAD + (1 - (s - lo) / range) * (H - PAD * 2));
  const d = pts.map((_, i) => `${i === 0 ? 'M' : 'L'}${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={color} />
    </svg>
  );
};

/** Recharts custom tooltip for score-over-time chart */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const plottedPercentage = payload[0].value || 0;
    const safeRawScore = data.score ?? 0;
    const maxScore = data.totalMarks ?? 0;
    const subjectName = data.subjectName || data.subject_name || data.subjectId || 'المادة الحالية';
    return (
      <div className="rounded-xl px-4 py-3 bg-white dark:bg-[#0f1623] border border-indigo-200 dark:border-indigo-500/30 shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.25)] text-right font-['Cairo'] min-w-[160px]" dir="rtl">
        <p className="text-indigo-600 dark:text-indigo-400 text-[0.8rem] mb-1 font-bold">التاريخ: {label || data.displayDate}</p>
        <p className="text-slate-500 dark:text-slate-400 text-[0.78rem] mb-2">المادة: {subjectName}</p>
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
          <span className="text-[0.75rem] text-slate-500 dark:text-slate-400">الدرجة:</span>
          <span className="text-lg">{safeRawScore}</span>
          <span className="text-green-500 text-[0.75rem]">/ {maxScore}</span>
          <span className="text-indigo-500 text-[0.75rem]">({plottedPercentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

/** Recharts custom tooltip for bar chart */
const BarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, accuracy } = payload[0].payload;
  const badge = getMasteryBadge(accuracy);
  return (
    <div className="rounded-xl px-4 py-3 bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/10 shadow-lg text-right font-['Cairo'] min-w-[160px]" dir="rtl">
      <p className="text-slate-800 dark:text-white font-bold text-[0.85rem] mb-1">{name}</p>
      <p className={`${badge.color} font-bold text-[0.8rem] flex items-center gap-1`}>
        {accuracy}% — {badge.dot} {badge.label}
      </p>
    </div>
  );
};

const ProgressAnalyticsLoadingSkeleton = ({ lang }) => (
  <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-[#080b14] font-['Cairo']">
    <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <SkeletonLoader type="card" width="52px" height="52px" />
              <div className="flex flex-col gap-2 flex-1">
                <SkeletonLoader type="text" width="72%" height="11px" />
                <SkeletonLoader type="text" width="48%" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <SkeletonLoader type="text" width="38%" height="14px" className="mb-4" />
            <SkeletonLoader type="card" height="280px" className="w-full" />
          </div>
          <div className="bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <SkeletonLoader type="text" width="44%" height="14px" className="mb-4" />
            <SkeletonLoader type="card" height="280px" className="w-full" />
          </div>
        </div>
      </section>
    </main>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const ProgressAnalytics = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isDarkMode } = useTheme(); // Extracted only needed states, ignoring old C object for styling

  const [loading, setLoading]               = useState(true);
  const [overallProgress, setOverallProgress] = useState(null); 
  const [quizResults, setQuizResults]        = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [remGaps, setRemGaps]                = useState([]);
  const [subjectStats, setSubjectStats]      = useState([]);
  const [selectedChartSubject, setSelectedChartSubject] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [subtopicEvaluations, setSubtopicEvaluations] = useState([]);
  
  const activityColors = ['rgba(255,255,255,0.02)', '#0e4429', '#006d32', '#26a641', '#39d353'];

  // ── Fetch from /student/dashboard → lesson_attempts ────────────────────────
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const attemptsRes = await api.get('/student/dashboard');

        const rawOverall = attemptsRes.data?.overall_progress;
        setOverallProgress(rawOverall != null ? Number(rawOverall) : null);
        const rawAttempts = Array.isArray(attemptsRes.data?.lesson_attempts)
          ? attemptsRes.data.lesson_attempts
          : [];

        const allAttempts = rawAttempts.map((att, idx) => {
          const parsedDate = new Date(att.attempted_at ?? '');
          const createdMs = Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
          const score = att.score !== null && att.score !== undefined ? Number(att.score) : null;
          const totalMarks = att.total_marks !== null && att.total_marks !== undefined ? Number(att.total_marks) : null;
          const percentage = att.percentage !== null && att.percentage !== undefined ? Number(att.percentage) : null;
          return {
            attemptId:   idx + 1,
            createdAt:   att.attempted_at ?? '',
            createdMs,
            score,
            totalMarks,
            percentage,
            lessonTitle: att.lesson_title ?? 'درس بدون عنوان',
            subjectName: att.subject_name ?? null,
            subjectId:   att.subject_id  ?? null,
          };
        });

        
        
        
        const scoredAsc = allAttempts
          .filter(a => a.percentage !== null)
          .sort((a, b) => a.createdMs - b.createdMs);

        setAttempts(scoredAsc); 

        
        const sortedDesc = [...scoredAsc].sort((a, b) => b.createdMs - a.createdMs);
        const lastAttempt = sortedDesc[0]; 

        
        setSubjectStats([{
          id:             'all',
          key:            'all-attempts',
          name:           rawAttempts[0]?.subject_name ?? 'جميع المواد',
          emoji:          '📊',
          color:          '#818cf8',
          attemptsCount:  scoredAsc.length,
          lastRawScore:   lastAttempt?.score ?? 0, // أحدث درجة
          lastPercentage: lastAttempt?.percentage ?? 0, // أحدث نسبة
          quizzes:        scoredAsc.slice(-5).map(a => ({ date: a.createdAt, score: a.percentage })),
        }]);
        
        setSelectedChartSubject('all');
        setActiveTab('all');

        
        const tableRows = sortedDesc.map(att => {
            const dateObj = new Date(att.createdAt);
            const formattedDate = Number.isNaN(dateObj.getTime())
              ? '—'
              : dateObj.toLocaleString('ar-EG', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', hour12: false,
                });
            return {
              ...att,
              date: formattedDate,
              displayDate: att.createdAt,
            };
        });

        setQuizResults(tableRows);
        setRemGaps([]);

        /* ── subtopic_evaluations from dashboard ── */
        const rawEvals = Array.isArray(attemptsRes.data?.subtopic_evaluations)
          ? attemptsRes.data.subtopic_evaluations
          : [];
        setSubtopicEvaluations(rawEvals);
      } catch (err) {
        console.error('❌ Failed to fetch student dashboard:', err);
        setAttempts([]);
        setSubjectStats([]);
        setQuizResults([]);
        setRemGaps([]);
        setSelectedChartSubject(null);
        setActiveTab(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  // ── Derived: line chart data ─────────
  const lineData = useMemo(() => {
    if (!attempts.length) return [];

    return [...attempts]
      .filter(att => att.percentage !== null)  
      .sort((a, b) => a.createdMs - b.createdMs)
      .map((att) => {
        const d = new Date(att.createdAt);
        const dateLabel = Number.isNaN(d.getTime())
          ? '—'
          : `${d.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

        return {
          date: dateLabel,
          percentage: att.percentage,
          score: att.score,
          totalMarks: att.totalMarks,
          displayDate: att.createdAt,
          subjectName: att.subjectName || 'المادة الحالية',
        };
      });
  }, [attempts]);

  // ── Derived: subtopic bar data ──────────────────
  const subtopicData = useMemo(() => {
    if (!activeTab) return [];
    return remGaps
      .filter(g => String(g.subjectId) === String(activeTab))
      .map(g => ({
        name:     g.lessonTitle || g.gap,
        accuracy: g.completed ? 70 : g.difficulty === 'hard' ? 25 : 40,
      }));
  }, [remGaps, activeTab]);

  const activityDays = useMemo(() => {
    if (!attempts.length) return [];
    const activityMap = {};
    attempts.forEach(att => {
      try {
        const d = new Date(att.createdAt || Date.now());
        const dateStr = d.toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      } catch {}
    });

    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        count: activityMap[dateStr] || 0,
        dayName: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        weekLabel: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      });
    }
    return days;
  }, [attempts]);

  const barData       = subtopicData;
  const activeTabMeta = subjectStats.find(s => String(s.id) === String(activeTab));
  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

  if (loading) return <ProgressAnalyticsLoadingSkeleton lang={lang} />;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 dark:bg-[#080b14] text-slate-800 dark:text-slate-200 font-['Cairo'] transition-colors duration-300 pb-12">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#080b14]/85 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-all">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20">
              <TargetIcon className="w-7 h-7 text-violet-600 dark:text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{t('progress_title')}</h1>
              <p className="text-[0.75rem] text-slate-500 dark:text-slate-400">{t('progress_subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowRight size={16} className={lang === 'en' ? "rotate-180" : ""} />
            {t('back_to_dashboard')}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        

        {/* Subject Summary Cards */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20">
              <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('mastery_summary')}</h2>
          </div>

          {subjectStats.length === 0 ? (
            <div className="bg-white dark:bg-[#0f1623] rounded-2xl p-4 border border-gray-200 dark:border-white/5 shadow-sm">
              <EmptyState
                icon={BookOpen}
                title={'بداية ممتازة لرحلة التقدّم'}
                description={'لا توجد إحصاءات مواد بعد. ابدأ أول اختبارك وسيظهر ملخص الإتقان هنا تلقائيًا.'}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectStats.map((subject) => {
                const badge = getMasteryBadge(subject.lastPercentage || 0);
                const r = 16, Circ = 2 * Math.PI * r;
                const arc = ((subject.lastPercentage || 0) / 100) * Circ;
                return (
                  <div key={subject.id} className="bg-white dark:bg-[#0f1623] rounded-2xl p-5 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{subject.emoji}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{subject.name}</span>
                      </div>
                      <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.color} ${badge.border}`}>
                        {badge.dot} {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div dir="ltr" className="flex-shrink-0 relative">
                        <svg width="48" height="48" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-slate-100 dark:stroke-white/5" />
                          <circle
                            cx="22" cy="22" r={r} fill="none" strokeWidth="4"
                            stroke={isDarkMode ? '#818cf8' : '#4f46e5'}
                            strokeDasharray={`${arc.toFixed(2)} ${(Circ - arc).toFixed(2)}`}
                            strokeDashoffset={(Circ / 4).toFixed(2)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-[0.65rem] text-slate-700 dark:text-slate-300">
                          {subject.lastPercentage || 0}%
                        </div>
                      </div>
                      <Sparkline quizzes={subject.quizzes} color={isDarkMode ? '#818cf8' : '#4f46e5'} />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 border-t border-gray-100 dark:border-white/5 pt-3">
                      آخر درجة:{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {latestAttempt?.score ?? 0} من {latestAttempt?.totalMarks ?? 0}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Score Over Time (Area Chart) */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/20">
                <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('score_over_time_title')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjectStats.map((sub) => {
                const isActive = String(selectedChartSubject) === String(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedChartSubject(sub.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-transparent border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                    }`}
                  >
                    {sub.emoji} {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1623] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">
            {lineData.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title={'لا توجد بيانات منحنى بعد'}
                description={'عند إكمال اختبارات أكثر، سنعرض هنا تطور درجاتك بمرور الوقت بشكل واضح.'}
              />
            ) : (
              <div dir="ltr" className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDarkMode ? "#818cf8" : "#4f46e5"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isDarkMode ? "#818cf8" : "#4f46e5"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: isDarkMode ? "#64748b" : "#94a3b8", fontFamily: "'Cairo', sans-serif" }} 
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: isDarkMode ? "#64748b" : "#94a3b8", fontFamily: "'Cairo', sans-serif" }}
                      tickFormatter={v => `${v}%`}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDarkMode ? "rgba(129,140,248,0.2)" : "rgba(99,102,241,0.2)", strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke={isDarkMode ? "#818cf8" : "#4f46e5"}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      activeDot={{ r: 6, fill: isDarkMode ? "#818cf8" : "#4f46e5", stroke: isDarkMode ? "#0f1623" : "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* ════════ SECTION 3 — Subtopic Mastery (Horizontal Bar Chart) ════════
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-100 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/20">
              <BarChart2 size={18} className="text-orange-600 dark:text-orange-400" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('subtopic_analysis_title')}</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {subjectStats.map((sub) => {
              const isActive = String(activeTab) === String(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    isActive 
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-transparent shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-transparent border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                  }`}
                >
                  {sub.emoji} {sub.name}
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-[#0f1623] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-5 pb-3 border-b border-gray-100 dark:border-white/5">
              {activeTabMeta?.emoji} {activeTabMeta?.name} — المواضيع التي تحتاج مراجعة
            </p>

            {barData.length === 0 ? (
              <EmptyState
                icon={BarChart2}
                title={'رائع، لا توجد نقاط ضعف حاليًا'}
                description={'أداءك ممتاز في هذه المادة. استمر بنفس الوتيرة للحفاظ على هذا المستوى.'}
              />
            ) : (
              <>
                <div dir="ltr">
                  <ResponsiveContainer width="100%" height={barData.length * 54}>
                    <BarChart
                      layout="vertical"
                      data={barData}
                      margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="4 4" horizontal={false} vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: isDarkMode ? "#64748b" : "#94a3b8", fontFamily: "'Cairo', sans-serif" }}
                        tickFormatter={v => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        width={140}
                        tick={{ fontSize: 11, fill: isDarkMode ? "#cbd5e1" : "#475569", fontFamily: "'Cairo', sans-serif" }}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={20}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={barColor(entry.accuracy)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-white/5 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-red-500">
                    <span className="w-3 h-3 rounded bg-red-400 inline-block shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
                    {t('accuracy_below60')}
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-500">
                    <span className="w-3 h-3 rounded bg-yellow-400 inline-block shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                    {t('accuracy_60_80')}
                  </span>
                  <span className="flex items-center gap-1.5 text-green-500">
                    <span className="w-3 h-3 rounded bg-green-400 inline-block shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
                    {t('accuracy_above80')}
                  </span>
                </div>
              </>
            )}
          </div>
        </section> */}

        {/* Activity Heatmap */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-500/15 border border-green-200 dark:border-green-500/20">
              <Calendar size={18} className="text-green-600 dark:text-green-400" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('activity_title')}</h2>
          </div>

          <div className="bg-white dark:bg-[#0f1623] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">
            {activityDays.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={'لا يوجد نشاط مسجل بعد'}
                description={'ابدأ بحل الاختبارات وسيظهر هنا تقويم نشاطك اليومي وتقدّمك بشكل مرئي.'}
              />
            ) : (
              <div className="flex flex-col items-center mt-2">
                <div className="flex gap-4 direction-rtl items-start">
                  <div className="grid grid-rows-4 gap-2 pt-7 text-slate-400 dark:text-slate-500 text-xs text-left leading-[36px]">
                    {[activityDays[0], activityDays[7], activityDays[14], activityDays[21]].map((day, i) => (
                      day && <div key={i} className="whitespace-nowrap">{day.weekLabel}</div>
                    ))}
                  </div>

                  <div>
                    <div className="grid grid-cols-7 gap-2 text-center text-slate-400 dark:text-slate-500 text-[11px] mb-2 h-[18px]">
                      {activityDays.slice(0, 7).map((d, i) => <div key={i}>{d.dayName}</div>)}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[36px] gap-2">
                      {activityDays.map((d) => {
                        const colorIndex = Math.min(d.count, 4);
                        const bgColor = activityColors[colorIndex];
                        return (
                          <div
                            key={d.dateStr}
                            title={`التاريخ: ${d.dateStr} | الاختبارات: ${d.count}`}
                            className={`w-9 h-9 rounded-lg cursor-pointer transition-transform duration-150 hover:scale-110 border ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}
                            style={{ backgroundColor: isDarkMode ? bgColor : (d.count > 0 ? bgColor : '#f8fafc') }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-3 mt-6 text-xs text-slate-400 dark:text-slate-500 direction-rtl">
                  <span>أقل نشاط</span>
                  <div className="flex gap-1.5">
                    {activityColors.map((color, i) => (
                      <div key={i} title={`مستوى ${i}`} className={`w-4 h-4 rounded border ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`} style={{ backgroundColor: isDarkMode ? color : (i > 0 ? color : '#f8fafc') }} />
                    ))}
                  </div>
                  <span>أعلى نشاط</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ════ Subtopic Mastery — from dashboard subtopic_evaluations ════ */}
        {/* =========================================================================
            قسم تحليل الذكاء الاصطناعي (نقاط الضعف والقوة) - List View & Scrollable
        ========================================================================= */}
        {/* =========================================================================
            قسم تحليل الذكاء الاصطناعي (نقاط الضعف والقوة) - List View & Scrollable
        ========================================================================= */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/20">
              <Target size={18} className="text-violet-600 dark:text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">تحليل نقاط الضعف والموضوعات الفرعية</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">تحليل الأداء التراكمي لكل موضوع فرعي</p>
            </div>
          </div>

          {subtopicEvaluations && subtopicEvaluations.length > 0 ? (
            
            
            <div className="max-h-[450px] overflow-y-auto pr-2 sm:pr-4 space-y-4 
                            [&::-webkit-scrollbar]:w-2 
                            [&::-webkit-scrollbar-track]:bg-slate-100 dark:[&::-webkit-scrollbar-track]:bg-[#0B1120] 
                            [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 
                            [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
              
              {[...subtopicEvaluations]
                
                .sort((a, b) => (a.subtopic_evaluation ?? 0) - (b.subtopic_evaluation ?? 0))
                .map((item, index) => {
                  const evalScore = item.subtopic_evaluation ?? 0;
                  const isGreen = evalScore >= 75;
                  const isYellow = evalScore >= 50 && evalScore < 75;
                  const isRed = evalScore < 50;

                  return (
                    <div 
                      key={index} 
                      className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/40 backdrop-blur-md shadow-sm hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                    >
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {item.subtopic?.title || item.subtopic_title || `موضوع فرعي رقم ${item.subtopic_id}`}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                          {item.correct_count >= item.question_count && item.question_count > 0
                            ? <CheckCircle2 size={16} className="text-green-500" />
                            : <XCircle size={16} className="text-slate-400" />
                          }
                          <span className="font-bold text-slate-600 dark:text-slate-300">{item.correct_count ?? 0}</span>
                          من {item.question_count} إجابات صحيحة
                        </p>
                      </div>

                      
                      <div className="w-full sm:w-1/3 flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center text-sm font-black">
                          <span className={`${isGreen ? 'text-green-500' : isYellow ? 'text-yellow-500' : 'text-red-500'}`}>
                            {evalScore}%
                          </span>
                        </div>
                        
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                          
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              isGreen ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                              isYellow ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                              'bg-gradient-to-r from-red-500 to-red-400'
                            }`}
                            style={{ width: `${evalScore}%` }}
                          />
                        </div>
                      </div>
                      
                    </div>
                  );
              })}
            </div>
          ) : (
            // حالة عدم وجود بيانات
            <div className="p-8 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/40 backdrop-blur-md">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">لا توجد بيانات كافية لتحليل نقاط الضعف حتى الآن.</p>
              <p className="text-sm text-slate-400 mt-1">أكمل المزيد من الاختبارات ليتمكن الذكاء الاصطناعي من تقييمك.</p>
            </div>
          )}
        </section>

        {/* Recent Quiz History Table */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20">
              <ClipboardList size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('recent_quiz_history')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{quizResults.length} اختبار مكتمل</p>
            </div>
          </div>

          <div className="w-full rounded-2xl overflow-hidden bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/5 shadow-sm">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_2fr_auto] px-6 py-4 bg-slate-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-xs font-bold text-right min-w-[700px]">
                <div>{t('date_label')}</div>
                <div>{t('subject_label')}</div>
                <div>{t('lessons_tab')}</div>
                <div>{t('avg_score')}</div>
                
                {/* <div className="text-center">{t('view_report')}</div> */}
              </div>

              <div className="min-w-[700px]">
                {quizResults.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={Activity}
                      title={'لا يوجد سجل اختبارات بعد'}
                      description={'عند إنهاء أول اختبار، ستظهر هنا كل المحاولات الحديثة مع التفاصيل والتقارير.'}
                    />
                  </div>
                ) : quizResults.map((att, i) => {
                  const percentage = att.percentage ?? 0;
                  const scoreLabel = `${percentage}%`;
                  const badge = getMasteryBadge(percentage);
                  const isLast = i === quizResults.length - 1;

                  return (
                    <div 
                      key={i} 
                      className={`grid grid-cols-[1.5fr_1fr_1.5fr_1fr_2fr_auto] px-6 py-4 items-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${!isLast ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
                    >
                      <div className="text-slate-500 dark:text-slate-400 text-sm">{att.date}</div>
                      
                      <div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 text-xs">
                          {att.subjectName ?? '-'}
                        </span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 text-sm truncate pr-2 max-w-[160px]" title={att.lessonTitle}>
                        {att.lessonTitle}
                      </div>

                      <div className="flex items-center">
                         <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.color} ${badge.border}`}>
                          {scoreLabel}
                        </span>
                      </div>

                      {/* <div className="flex flex-wrap gap-1.5 pr-2">
                        {att.score < 0.5 ? (
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 text-xs">
                            {att.lessonTitle}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 text-xs">
                            ممتاز - لا توجد ملاحظات
                          </span>
                        )}
                      </div> */}

                      <div className="flex justify-end">
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ProgressAnalytics;