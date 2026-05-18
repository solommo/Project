import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import { ArrowRight, Play, Pause, Volume2, VolumeX, Minimize, Maximize, Settings, ChevronLeft, ChevronRight, CheckCircle2, User, Loader2, Zap, BookOpen, ClipboardList } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

function buildTheme(dark) {
  return dark ? {
    bg:"#0B1120", bgPanel:"#0D1526", bgCard:"rgba(255,255,255,0.035)", border:"rgba(255,255,255,0.08)",
    borderAccent:"rgba(79,70,229,0.38)", accent:"#4F46E5", accentDim:"rgba(79,70,229,0.14)",
    iconA:"#38BDF8", iconBgA:"rgba(56,189,248,0.10)", iconBorderA:"rgba(56,189,248,0.22)",
    iconB:"#818CF8", iconBgB:"rgba(129,140,248,0.11)", iconBorderB:"rgba(129,140,248,0.25)",
    textPrimary:"#F8FAFC", textMuted:"#94A3B8", textDim:"#475569",
    shadowCard:"0 1px 1px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.35)",
    green:"#34D399", greenDim:"rgba(52,211,153,0.12)", greenBorder:"rgba(52,211,153,0.22)",
    purple:"#A78BFA", purpleDim:"rgba(167,139,250,0.12)", purpleBorder:"rgba(167,139,250,0.22)",
    redDim:"rgba(248,113,113,0.10)", redBorder:"rgba(248,113,113,0.20)", redIcon:"#F87171",
    trackBg:"rgba(255,255,255,0.06)",
  } : {
    bg:"#F8FAFC", bgPanel:"#FFFFFF", bgCard:"#FFFFFF", border:"#E2E8F0",
    borderAccent:"rgba(15,76,129,0.28)", accent:"#0F4C81", accentDim:"rgba(15,76,129,0.08)",
    iconA:"#0F4C81", iconBgA:"rgba(15,76,129,0.08)", iconBorderA:"rgba(15,76,129,0.18)",
    iconB:"#2563EB", iconBgB:"rgba(37,99,235,0.07)", iconBorderB:"rgba(37,99,235,0.16)",
    textPrimary:"#0F172A", textMuted:"#64748B", textDim:"#94A3B8",
    shadowCard:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",
    green:"#059669", greenDim:"rgba(5,150,105,0.08)", greenBorder:"rgba(5,150,105,0.18)",
    purple:"#7C3AED", purpleDim:"rgba(124,58,237,0.08)", purpleBorder:"rgba(124,58,237,0.18)",
    redDim:"rgba(239,68,68,0.08)", redBorder:"rgba(239,68,68,0.18)", redIcon:"#EF4444",
    trackBg:"#E2E8F0",
  };
}
const card=(T,x)=>({background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"16px",boxShadow:T.shadowCard,...x});
const tr={transition:"background 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease"};
const iw=(bg,bd,sz="48px",r="8px")=>({...tr,width:sz,height:sz,borderRadius:r,background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0});

// يحلل رابط الفيديو ويحدد نوعه (youtube / vimeo / direct / generic)
const parseVideoUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { type: 'direct' };
  // ✅ Fallback: attempt to render any URL as generic iframe
  return { type: 'generic', embedUrl: url };
};

const LessonInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const T = buildTheme(isDark);

  // ── Auth guard: إذا المستخدم مش مسجّل → وجّهه لتسجيل الدخول مع رابط العودة ──
  const isLoggedIn = !!localStorage.getItem('token');
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname), { replace: true });
    }
  }, [isLoggedIn, navigate]);
  
  // 1. حالات التحكم (State)
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [activeTeacher, setActiveTeacher] = useState(null); // ✅ Start with null, set from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_completingLesson, setCompletingLesson] = useState(false);
  const [lessonCompleteToast, setLessonCompleteToast] = useState(false);

  // بيانات من الـ API (single source: /teachers/{teacher}/lessons/{lesson}/content)
  const [teachers, setTeachers] = useState([]);
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set()); // per-user
  const [currentVideo, setCurrentVideo] = useState(null);
  const [fetchedDuration, setFetchedDuration] = useState(0);
  const [lessonQuizzes, setLessonQuizzes] = useState([]);
  const [teacherImageError, setTeacherImageError] = useState(false);
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  const [videoDetails, setVideoDetails] = useState({
    url: null,
    thumbnail: null,
    duration: 0
  });

  const queryParams = new URLSearchParams(location.search);
  const queryLessonId = queryParams.get('lessonId');
  const queryTeacherId = queryParams.get('teacherId');
  const querySubjectId = queryParams.get('subjectId');

  // ✅ Clean lesson ID - remove any ":1" suffix from hasManyThrough
  const rawLessonId = location.state?.lesson?.id ?? location.state?.lessonId ?? queryLessonId ?? null;
  const lessonId = rawLessonId != null
    ? (typeof rawLessonId === 'string' && rawLessonId.includes(':')
        ? parseInt(rawLessonId.split(':')[0], 10)
        : parseInt(rawLessonId, 10))
    : null;
  const subjectId        = location.state?.subjectId   ?? querySubjectId ?? 1;
  const stateSubjectName = location.state?.subjectName ?? ''; // للـ mock fallback
  const stateTeacherName = location.state?.teacherName ?? '';
  const autoScrollToQuiz = location.state?.autoScrollToQuiz ?? false;
  const preSelectedTeacherId = location.state?.teacherId ?? queryTeacherId;
  const stateLesson = location.state?.lesson || null;
  const rawTeacherId =
    preSelectedTeacherId ??
    stateLesson?.teacher_id ??
    stateLesson?.teacherId ??
    location.state?.teacher?.id ??
    null;
  const teacherIdForRequest =
    rawTeacherId != null && rawTeacherId !== ''
      ? parseInt(String(rawTeacherId).split(':')[0], 10)
      : null;

  const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');
    const safeUrl = encodePath(url);

    const laravelBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';
    if (safeUrl.startsWith('/storage/')) return `${laravelBaseUrl}${safeUrl}`;
    if (safeUrl.startsWith('storage/')) return `${laravelBaseUrl}/${safeUrl}`;
    if (safeUrl.startsWith('/')) return `${laravelBaseUrl}${safeUrl}`;
    return `${laravelBaseUrl}/storage/${safeUrl}`;
  };

  const formatSecondsToMMSS = (val) => {
    if (val == null || val === '--') return val ?? '--';
    const secs = Number(val);
    if (!Number.isFinite(secs) || secs <= 0) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  const formatDuration = (totalSeconds) => {
    const secs = Number(totalSeconds);
    if (!Number.isFinite(secs) || secs <= 0) return '00:00';
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // ✅ Single source of truth fetch
  // Guard: prevents the view-increment side-effect on the backend from firing
  // twice under React 18 StrictMode double-mount or rapid re-renders.
  const hasTrackedView = useRef(false);
  const videoRef = useRef(null);

  // ── Custom player controls state ──────────────────────────────────────────
  const playerContainerRef = useRef(null); // for fullscreen
  const progressTrackRef   = useRef(null); // for scrubbing
  const hideTimerRef       = useRef(null); // auto-hide controls

  const [ctrlsVisible,  setCtrlsVisible]  = useState(true);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [isMuted,       setIsMuted]       = useState(false);
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);
  const [hoverTime,     setHoverTime]     = useState(null);
  const [hoverX,        setHoverX]        = useState(0);

  // format seconds → m:ss
  const fmtTime = (secs) => {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // show controls then auto-hide after 3 s
  const showControls = () => {
    setCtrlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setCtrlsVisible(false), 3000);
  };

  // wire video element events once the player is active
  useEffect(() => {
    const video = videoRef.current;
    if (!isPlayerActive || !video) return;

    const onTime   = () => { if (!isDragging) setCurrentTime(video.currentTime); };
    const onMeta   = () => setDuration(video.duration || 0);
    const onPlay   = () => setIsPlaying(true);
    const onPause  = () => setIsPlaying(false);
    const onEnded  = () => setIsPlaying(false);
    const onVol    = () => setIsMuted(video.muted);

    video.addEventListener('timeupdate',     onTime);
    video.addEventListener('durationchange', onMeta);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('play',   onPlay);
    video.addEventListener('pause',  onPause);
    video.addEventListener('ended',  onEnded);
    video.addEventListener('volumechange', onVol);

    // fullscreen change
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);

    // initially show controls
    showControls();

    return () => {
      video.removeEventListener('timeupdate',     onTime);
      video.removeEventListener('durationchange', onMeta);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('play',   onPlay);
      video.removeEventListener('pause',  onPause);
      video.removeEventListener('ended',  onEnded);
      video.removeEventListener('volumechange', onVol);
      document.removeEventListener('fullscreenchange', onFs);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerActive, isDragging]);

  // auto-play once activated (kept from original)
  useEffect(() => {
    if (!isPlayerActive || !videoRef.current) return;
    videoRef.current.play?.().catch(() => {});
  }, [isPlayerActive]);

  // scrubber helpers
  const getProgress = (e) => {
    const track = progressTrackRef.current;
    if (!track || !duration) return 0;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const seekTo = (progress) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const t = progress * duration;
    video.currentTime = t;
    setCurrentTime(t);
  };

  const handleTrackMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    seekTo(getProgress(e));
    const onMove = (me) => seekTo(getProgress(me));
    const onUp   = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  const handleTrackMouseMove = (e) => {
    const track = progressTrackRef.current;
    if (!track || !duration) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverTime((x / rect.width) * duration);
    setHoverX(x);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) container.requestFullscreen();
    else document.exitFullscreen();
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  // ✅ Fetch STRICTLY from /api/videos/${videoId} for specific fields (url, duration, thumbnail)
  useEffect(() => {
    const vId = currentVideo?.video_id ?? currentVideo?.id;
    if (!vId) return;

    let cancelled = false;
    const fetchVideoDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch explicit video details. api.js baseURL already contains /api
        const response = await api.get(`/videos/${vId}`, {
          headers: { Authorization: `Bearer ${token}` } // Ensure Token is explicitly included to avoid 403 Forbidden
        });
        
        if (!cancelled && response.data) {
          const data = response.data;
          setVideoDetails({
            url: data.url || data.video_url || null,
            thumbnail: data.thumbnail || data.video_thumbnail || null,
            duration: Number(data.duration) || 0
          });
          setFetchedDuration(Number(data.duration) || 0); // Keep existing duration state updated
          console.log('[LessonInterface] Video details explicitly fetched:', data);
        }
      } catch (err) {
        console.error('[LessonInterface] Failed to fetch explicit video details from /api/videos endpoint:', err);
      }
    };

    fetchVideoDetails();
    return () => { cancelled = true; };
  }, [currentVideo?.video_id, currentVideo?.id]);

  useEffect(() => {
    // Old local duration logic is removed as we now fetch it via /api/videos
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLessonContent = async () => {
      if (!lessonId || !teacherIdForRequest) {
        console.error('[LessonInterface] Missing lesson/teacher IDs for course-details route.', {
          lessonId,
          teacherIdForRequest,
        });
        setError('تعذر تحديد الدرس أو المدرس.');
        setLoading(false);
        return;
      }

      // ── Deduplication guard ──────────────────────────────────────────
      // Set the flag BEFORE the await so a concurrent second call (StrictMode
      // unmount/remount) hits `true` and returns without firing the request again.
      if (hasTrackedView.current) return;
      hasTrackedView.current = true;
      // ────────────────────────────────────────────────────────────────────

      try {
        setLoading(true);
        setError(null);
        setCurrentVideo(null);
        setLessonQuizzes([]);

        // Keep local completion progress (local only, no API calls)
        const completionData = JSON.parse(localStorage.getItem('lessonCompletions') || '{}');
        const doneSet = new Set(
          Object.keys(completionData)
            .filter((k) => completionData[k]?.subjectId === String(subjectId) && completionData[k]?.completed)
            .map((k) => Number(k))
        );
        if (!cancelled) setCompletedIds(doneSet);

        const res = await api.get(`/teachers/${teacherIdForRequest}/lessons/${lessonId}/content`);
        // Bind directly to the documented payload shape: { teacher, videos: { lesson_title, video_url, quizzes_count, quizzes: [] } }
        const payload = res.data ?? {};
        const teacherPayload = payload.teacher ?? {};
        // videos is a direct object — NOT an array or paginated response (.data sub-key no longer exists)
        const videosObj = payload.videos ?? {};
        const videoRaw = Object.keys(videosObj).length > 0 ? { ...videosObj } : null;
        if (videoRaw?.video_url) videoRaw.video_url = videoRaw.video_url;
        if (videoRaw?.url) videoRaw.url = videoRaw.url;

        // hasQuiz is driven by quizzes_count from the payload
        const hasQuiz = (videosObj.quizzes_count ?? 0) > 0;
        // quizData is the first element of the quizzes array on the videos object
        const rawQuizzes = Array.isArray(videosObj.quizzes) ? videosObj.quizzes : [];
        const mappedQuizzes = hasQuiz
          ? rawQuizzes.map((quiz, idx) => {
              const q = typeof quiz === 'object' ? quiz : { quiz_id: quiz };
              const qId = q?.quiz_id ?? q?.id ?? idx + 1;
              const totalMarks = q?.total_marks ?? null;
              const rawScore = q?.score ?? null;
              const derivedPercentage =
                totalMarks && rawScore != null
                  ? Math.round((Number(rawScore) / Number(totalMarks)) * 100)
                  : null;
              return {
                id: qId,
                quiz_id: qId,
                teacher_id: teacherPayload?.teacher_id ?? teacherIdForRequest,
                // attempted flag comes from the quizzes array item per the new payload spec
                has_attempted: Boolean(q?.attempted ?? q?.has_attempted),
                score: rawScore,
                total_marks: totalMarks,
                percentage: q?.percentage ?? derivedPercentage,
              };
            })
          : [];

        const mappedTeacher = {
          id: teacherPayload?.teacher_id ?? teacherIdForRequest,
          name: teacherPayload?.teacher_name || stateTeacherName || `مدرس ${teacherIdForRequest}`,
          rating: teacherPayload?.rating ?? null,
          subject: teacherPayload?.subject_name || stateSubjectName || '',
          teacher_profile_picture: teacherPayload?.teacher_profile_picture ?? teacherPayload?.profile_picture ?? null,
        };

        const mappedLesson = {
          id: lessonId,
          // lesson_title lives on the videos object in the new payload
          title: videoRaw?.lesson_title || stateLesson?.title || `الدرس ${lessonId}`,
          // prefer backend-provided duration (seconds), fallback to stateLesson
          duration: videoRaw?.duration ?? stateLesson?.duration ?? '--',
          chapter: stateLesson?.chapter ?? '',
          description: stateLesson?.description ?? '',
          completed: doneSet.has(lessonId),
        };

        if (cancelled) return;

        setTeachers([mappedTeacher]);
        setActiveTeacher(mappedTeacher.id);
        setCourse({
          subjectName: mappedTeacher.subject || stateSubjectName || 'غير محدد',
          lessons: [mappedLesson],
        });
        setLessons([mappedLesson]);
        setCurrentLesson(mappedLesson);
        setCurrentVideo(videoRaw);
        setLessonQuizzes(mappedQuizzes);
      } catch (err) {
        console.error('[LessonInterface] Failed to load consolidated content:', err);
        if (!cancelled) {
          setError('تعذر تحميل بيانات الدرس.');
          setTeachers([]);
          setLessons([]);
          setCurrentLesson(null);
          setCourse(null);
          setCurrentVideo(null);
          setLessonQuizzes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLessonContent();
    return () => { cancelled = true; };
  }, [lessonId, teacherIdForRequest, subjectId, stateSubjectName, stateTeacherName, stateLesson?.title, stateLesson?.duration, stateLesson?.chapter, stateLesson?.description]);

  // تأثير التمرير التلقائي لقسم الاختبارات
  useEffect(() => {
    if (autoScrollToQuiz && !loading && lessonQuizzes.length > 0) {
      setTimeout(() => {
        const el = document.getElementById('quizzes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [autoScrollToQuiz, loading, lessonQuizzes.length]);

  const completedCount = completedIds.size;
  const totalCount = lessons.length;
  const progressPercent = totalCount ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  const mainQuiz = lessonQuizzes?.[0] ?? null;
  const quizData = mainQuiz ? {
    ...mainQuiz,
    has_attempted: Boolean(mainQuiz?.has_attempted),
    score: mainQuiz?.score ?? null,
    percentage: mainQuiz?.percentage ?? null
  } : null;
  const scoreText = quizData?.total_marks
    ? `${quizData?.score} / ${quizData?.total_marks} (${quizData?.percentage ?? 0}%)`
    : `${quizData?.score ?? '-'}`;
  const buttonLabel = `تم الاختبار - درجتك: ${scoreText}`;

  const routeLessonId = currentLesson?.id ?? lessonId;
  const activeTeacherInfo = teachers.find((t) => String(t.id) === String(activeTeacher));
  const activeTeacherPictureUrl = activeTeacherInfo?.teacher_profile_picture
    ? (() => {
        const picturePath = activeTeacherInfo.teacher_profile_picture;
        if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) return picturePath;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '');
        if (picturePath.startsWith('/storage/')) return `${baseUrl}${picturePath}`;
        if (picturePath.startsWith('storage/')) return `${baseUrl}/${picturePath}`;
        if (picturePath.startsWith('/')) return `${baseUrl}${picturePath}`;
        return `${baseUrl}/storage/${picturePath}`;
      })()
    : null;

  useEffect(() => {
    setTeacherImageError(false);
  }, [activeTeacherInfo?.id, activeTeacherInfo?.teacher_profile_picture]);

  // التنقل بين الدروس
  const currentIndex    = lessons.findIndex(l => l.id === currentLesson?.id);
  const parsedVideoUrl  = videoDetails.url || currentVideo?.video_url ? parseVideoUrl(videoDetails.url || currentVideo.video_url) : null;
  const videoPosterUrl = videoDetails.thumbnail || currentVideo?.video_thumbnail || undefined;
  const rawVideoSrc = videoDetails.url || currentVideo?.video_url || currentVideo?.url || '';
  const resolvedVideoSrc = rawVideoSrc
    ? (rawVideoSrc.startsWith('http://') || rawVideoSrc.startsWith('https://')
        ? rawVideoSrc
        : `http://127.0.0.1:8000/storage/${rawVideoSrc.replace(/^\/+/, '')}`)
    : '';
  const displayDuration = formatDuration(videoDetails.duration || fetchedDuration || 0);

  const handlePreviousLesson = () => {
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    videoRef.current.play?.().catch(() => {});
  };
  const handleActivatePlayer = () => {
    setIsPlayerActive(true);
  };
  const handleNextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const _handleCompleteLesson = async () => {
    if (!currentLesson || completedIds.has(currentLesson.id)) return;
    setCompletingLesson(true);
    try {
      // حفظ إتمام الدرس في localStorage
      const completionData = JSON.parse(localStorage.getItem('lessonCompletions') || '{}');
      completionData[currentLesson.id] = {
        subjectId: String(subjectId),
        completed: true,
        completedAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem('lessonCompletions', JSON.stringify(completionData));

      // حدّث completedIds محلياً
      const newDone = new Set([...completedIds, currentLesson.id]);
      setCompletedIds(newDone);
      setLessons(prev => prev.map(l => l.id === currentLesson.id ? { ...l, completed: true } : l));
      setCurrentLesson(prev => ({ ...prev, completed: true }));

      setLessonCompleteToast(true);
      setTimeout(() => setLessonCompleteToast(false), 3000);
    } catch (err) {
      console.error('Complete lesson error:', err);
    } finally {
      setCompletingLesson(false);
    }
  };

  if (loading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{...tr,background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif"}}>
        <Loader2 style={{color:T.accent,width:"48px",height:"48px",marginBottom:"16px"}} className="animate-spin" />
        <p style={{...tr,color:T.textPrimary,fontSize:"1.1rem",fontWeight:700}}>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{...tr,background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif"}}>
        <div style={{...tr,...card(T),border:`1px solid ${T.redBorder}`,padding:"40px",textAlign:"center",maxWidth:"420px",width:"100%"}}>
          <p style={{...tr,color:T.redIcon,fontSize:"0.9rem",marginBottom:"16px"}}>{error}</p>
          <button onClick={() => navigate('/dashboard')} style={{...tr,background:"transparent",border:"none",color:T.textDim,fontSize:"0.85rem",cursor:"pointer",textDecoration:"underline"}}>
            {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{...tr,background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif"}}>
        <div style={{...tr,...card(T),padding:"48px",textAlign:"center",maxWidth:"420px",width:"100%"}}>
          <p style={{fontSize:"2.5rem",marginBottom:"16px"}}>📭</p>
          <h2 style={{...tr,color:T.textPrimary,fontSize:"1.2rem",fontWeight:700,marginBottom:"8px"}}>لا توجد دروس متاحة</h2>
          <p style={{...tr,color:T.textMuted,fontSize:"0.85rem",marginBottom:"24px"}}>
            {teachers.length === 0 ? 'لا يوجد مدرسون مرتبطون بهذه المادة بعد.' : 'المدرس لم يرفع دروساً بعد. جرّب اختيار مدرس آخر.'}
          </p>
          <button onClick={() => navigate('/dashboard')} style={{...tr,padding:"12px 28px",borderRadius:"12px",fontSize:"0.9rem",fontWeight:700,background:T.accent,color:"#FFF",border:"none",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.opacity="0.88"}} onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}>
            {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  console.log("Current Lesson Attempt Data:", quizData);
  console.log("DEBUG - RAW VIDEO DATA:", currentVideo);
  console.log("DEBUG - RESOLVED POSTER URL:", videoPosterUrl);
  console.log("FINAL VIDEO SRC:", currentVideo?.video_url || currentVideo?.url);
  console.log("🚨 REAL RENDER DATA:", currentVideo);
  console.log("📺 FETCHED DURATION VALUE:", fetchedDuration);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="w-full flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Toast */}
      {lessonCompleteToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "#34D399",
            color: "#FFF",
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="animate-bounce"
        >
          <CheckCircle2 style={{ width: "18px", height: "18px" }} />
          تمّ تسجيل إتمام الدرس بنجاح! ✅
        </div>
      )}

      {/* ══ Sidebar — desktop: fixed rail | mobile: slide-up drawer ══ */}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className="flex-shrink-0 flex flex-col z-40
          md:h-full md:static md:translate-y-0 md:transform-none
          fixed bottom-0 inset-x-0 max-h-[70vh]
          transition-transform duration-300 ease-in-out
          md:transition-none"
        style={{
          width: '30%',
          minWidth: '260px',
          maxWidth: '340px',
          backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
          // mobile: slide off-screen by default; desktop: md:static overrides position so translateY has no effect
          transform: `translateY(${sidebarOpen ? '0%' : '100%'})`,
          borderRadius: sidebarOpen ? '20px 20px 0 0' : undefined,
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-10 h-1.5 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.18)' : '#CBD5E1' }}
            aria-label="إغلاق القائمة"
          />
        </div>

        {/* Sidebar Header */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={15} style={{ color: isDark ? '#4f8ef5' : '#2563EB' }} />
            <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '11px', letterSpacing: '0.08em' }}>
              محتويات الكورس
            </span>
          </div>
          <h2 style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontSize: '14px', fontWeight: 600, lineHeight: 1.4 }}>
            {course.subjectName}
          </h2>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto focus-scrollbar py-3">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.id === currentLesson.id;
            const lessonDuration = isCurrent
              ? videoDetails.duration || fetchedDuration || currentLesson?.duration || 0
              : lesson.duration || 0;
            const showSection = lesson.chapter && (index === 0 || lessons[index - 1].chapter !== lesson.chapter);

            return (
              <div key={lesson.id}>
                {showSection && (
                  <div className="px-5 py-2 flex items-center gap-2" style={{ marginTop: index > 0 ? '8px' : '0' }}>
                    <div style={{ height: '1px', flex: 1, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                    <span style={{ color: isDark ? '#475569' : '#64748B', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {lesson.chapter}
                    </span>
                    <div style={{ height: '1px', flex: 1, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                  </div>
                )}

                <button
                  onClick={() => { setCurrentLesson(lesson); setSidebarOpen(false); }}
                  className="w-full text-right px-4 py-3 mx-1 flex items-start gap-3 transition-all duration-300 rounded-xl cursor-pointer hover:opacity-80"
                  style={{
                    width: 'calc(100% - 8px)',
                    marginBottom: '2px',
                    backgroundColor: isCurrent ? (isDark ? 'rgba(79,70,229,0.15)' : '#EFF6FF') : 'transparent',
                    border: `1px solid ${isCurrent ? (isDark ? 'rgba(79,70,229,0.3)' : '#BFDBFE') : 'transparent'}`,
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {lesson.completed ? (
                      <CheckCircle2 size={17} style={{ color: isDark ? '#34D399' : '#059669' }} />
                    ) : isCurrent ? (
                      <Play size={17} style={{ color: isDark ? '#818CF8' : '#2563EB' }} />
                    ) : (
                      <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${isDark ? '#475569' : '#CBD5E1'}`, marginTop: '4px' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p style={{
                        fontSize: '12px',
                        color: isCurrent ? (isDark ? '#F8FAFC' : '#1E293B') : lesson.completed ? (isDark ? '#94A3B8' : '#94A3B8') : (isDark ? '#CBD5E1' : '#475569'),
                        fontWeight: isCurrent ? 600 : 400,
                        lineHeight: 1.4,
                        textAlign: lang === 'ar' ? 'right' : 'left',
                      }}>
                        {lesson.title}
                      </p>
                      {isCurrent && <ChevronLeft size={13} style={{ flexShrink: 0, color: isDark ? '#818CF8' : '#2563EB', transform: lang === 'en' ? 'rotate(180deg)' : 'none' }} />}
                    </div>
                    <span style={{ fontSize: '10px', color: isDark ? '#475569' : '#64748B', marginTop: '2px', display: 'block' }}>
                      {formatDuration(lessonDuration)}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Progress Section (commented-out, preserved) */}
        {/* <div className="px-5 py-5 flex-shrink-0" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` }}>
          ... progress bar ...
        </div> */}
      </aside>

      {/* Mobile — floating "lesson list" toggle pill ══════════════════════ */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 md:hidden
            flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg
            transition-all duration-200 active:scale-95"
          style={{
            background: isDark ? 'rgba(15,21,40,0.92)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(79,142,245,0.3)' : '#BFDBFE'}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <BookOpen size={15} style={{ color: isDark ? '#4f8ef5' : '#2563EB' }} />
          <span style={{ color: isDark ? '#e2e8f0' : '#1E293B', fontSize: '13px', fontWeight: 600 }}>
            قائمة الدروس ({lessons.length})
          </span>
          <ChevronRight size={14} style={{ color: isDark ? '#4f8ef5' : '#2563EB', transform: 'rotate(-90deg)' }} />
        </button>
      )}

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto focus-scrollbar px-3 sm:px-6 py-4 sm:py-5 flex flex-col gap-3 sm:gap-5 relative z-10"
          style={{ paddingBottom: '80px' }}
        >
          
          {/* Back Button */}
          <div className="flex justify-start mb-1">
            <button
              onClick={() => {
                // SubjectPage reads `subjectId` from useParams() and
                // auto-selects a teacher via the `?teacherId=` query param
                // (see SubjectPage line ~596 — it does NOT read location.state).

                // 1. Resolve subjectId — prefer state (explicitly passed on navigation),
                //    then query string, never fall back to the hardcoded default of 1.
                const resolvedSubjectId =
                  location.state?.subjectId ?? querySubjectId ?? null;

                // 2. Resolve teacherId — prefer the already-parsed & cleaned
                //    teacherIdForRequest, then walk back through state / query.
                const resolvedTeacherId =
                  teacherIdForRequest ??
                  location.state?.teacherId ??
                  queryTeacherId ??
                  null;

                if (resolvedSubjectId) {
                  // Append ?teacherId= so SubjectPage's useEffect auto-selects
                  // the correct teacher and scrolls to the lessons section.
                  const qs = resolvedTeacherId ? `?teacherId=${resolvedTeacherId}` : '';
                  navigate(`/subject/${resolvedSubjectId}${qs}`);
                } else {
                  // Ultimate fallback — IDs are genuinely unavailable
                  navigate('/dashboard');
                }
              }}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 dark:backdrop-blur-md shadow-sm dark:shadow-none text-slate-600 dark:text-[#8a9ec0] hover:text-blue-600 dark:hover:text-[#4f8ef5] transition-all focus:outline-none font-semibold text-sm dark:hover:neon-glow-hover"
            >
              <ArrowRight size={16} className={`transition-transform group-hover:-translate-x-1 ${lang === 'en' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
              العودة للمادة
            </button>
          </div>

          {/* Teacher & Lesson Info Panel */}
          <div className="bg-white dark:bg-[#0B1120]/80 border border-gray-200 dark:border-blue-500/20 rounded-xl dark:backdrop-blur-xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm dark:shadow-[0_0_20px_rgba(79,142,245,0.1)] dark:neon-glow">
            {/* Right side: Teacher Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#0c1424] border border-gray-200 dark:border-[#1a2438] flex items-center justify-center dark:neon-glow">
                {activeTeacherPictureUrl && !teacherImageError ? (
                  <img
                    src={activeTeacherPictureUrl}
                    alt={activeTeacherInfo?.name || 'مدرس'}
                    onError={() => setTeacherImageError(true)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="text-[#4f8ef5] w-5 h-5 drop-shadow-[0_0_8px_rgba(79,142,245,0.8)]" />
                )}
              </div>
              <div>
                <p className="text-[#4a6080] text-[10px] uppercase tracking-wider mb-0.5">المدرس</p>
                <h3 className="text-slate-900 dark:text-[#e8f0ff] font-bold text-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                  {activeTeacherInfo?.name || (loading ? 'جاري التحميل...' : 'غير محدد')}
                </h3>
              </div>
            </div>

            {/* Left side: Lesson Title / Badge */}
            <div className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <span className="text-xs font-semibold drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                {currentLesson.title}
              </span>
            </div>
          </div>

          {/* Lesson Title + Breadcrumb */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ color: isDark ? "#3a4a65" : "#475569", fontSize: "12px" }}>الكورس</span>
              <span style={{ color: isDark ? "#2a3a55" : "#94A3B8", fontSize: "12px" }}>/</span>
              <span style={{ color: isDark ? "#3a4a65" : "#475569", fontSize: "12px" }}>{course.subjectName}</span>
              <span style={{ color: isDark ? "#2a3a55" : "#94A3B8", fontSize: "12px" }}>/</span>
              <span style={{ color: isDark ? "#5a7aaa" : "#3B82F6", fontSize: "12px" }}>{currentLesson.title}</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0"
              style={{
                background: "rgba(79,142,245,0.07)",
                border: "1px solid rgba(79,142,245,0.15)",
              }}
            >
              <Zap size={11} style={{ color: "#4f8ef5" }} />
              <span style={{ color: "#4f8ef5", fontSize: "11px" }}>
                درس {currentIndex + 1} من {totalCount}
              </span>
            </div>
          </div>

          {/* ══ Video Player Box — Premium Glassmorphism ══ */}
          <div
            className="relative rounded-2xl overflow-hidden shrink-0 select-none"
            style={{
              aspectRatio: "16/9",
              maxHeight: "65vh",
              background: "#050810",
              boxShadow: isDark
                ? "0 0 0 1px rgba(255,255,255,0.07), 0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(79,142,245,0.08)"
                : "0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* ── Loading state ── */}
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(5,8,16,0.85)", backdropFilter: "blur(8px)" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(79,142,245,0.9) 0%, rgba(155,108,247,0.9) 100%)",
                  boxShadow: "0 0 28px rgba(79,142,245,0.5), 0 0 56px rgba(79,142,245,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Loader2 style={{ width: "24px", height: "24px", color: "#ffffff" }} className="animate-spin" />
                </div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" }}>
                  جاري تحميل الفيديو…
                </span>
              </div>
            )}

            {/* ── YouTube embed ── */}
            {!loading && parsedVideoUrl?.type === 'youtube' && (
              <iframe
                key={currentVideo?.video_id}
                src={parsedVideoUrl.embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={currentVideo?.video_title || currentLesson.title}
              />
            )}

            {/* ── Vimeo embed ── */}
            {!loading && parsedVideoUrl?.type === 'vimeo' && (
              <iframe
                key={currentVideo?.video_id}
                src={parsedVideoUrl.embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={currentVideo?.video_title || currentLesson.title}
              />
            )}

            {/* ── Generic iframe embed ── */}
            {!loading && parsedVideoUrl?.type === 'generic' && (
              <iframe
                key={currentVideo?.video_id}
                src={parsedVideoUrl.embedUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                title={currentVideo?.video_title || currentLesson.title}
              />
            )}

            {/* ── Direct MP4 player ── */}
            {!loading && parsedVideoUrl?.type === 'direct' && (
              <>
                {/* Poster / Play overlay — shown before activation */}
                {!isPlayerActive && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleActivatePlayer}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivatePlayer(); }}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                    style={{
                      backgroundImage: videoPosterUrl ? `url("${encodeURI(videoPosterUrl)}")` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: "#050810",
                    }}
                  >
                    {/* Dark scrim over poster */}
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.05) 100%)" }} />

                    {/* Lesson badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full z-10"
                      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Zap size={11} style={{ color: "#4f8ef5" }} />
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", letterSpacing: "0.06em" }}>
                        درس {currentIndex + 1} من {totalCount}
                      </span>
                    </div>

                    {/* Duration pill — bottom left */}
                    {displayDuration && displayDuration !== '00:00' && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full z-10"
                        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{displayDuration}</span>
                      </div>
                    )}

                    {/* Play button orb */}
                    <div
                      className="relative z-10 flex items-center justify-center rounded-full transition-transform duration-300 group-hover/play:scale-110"
                      style={{
                        width: "72px", height: "72px",
                        background: "linear-gradient(135deg, rgba(79,142,245,0.92) 0%, rgba(155,108,247,0.92) 100%)",
                        boxShadow: "0 0 0 12px rgba(79,142,245,0.12), 0 0 40px rgba(79,142,245,0.45), 0 0 80px rgba(79,142,245,0.15)",
                      }}
                    >
                      <Play style={{ width: "26px", height: "26px", color: "#ffffff", marginLeft: "3px" }} fill="white" />
                    </div>

                    {/* No poster label */}
                    {!videoPosterUrl && (
                      <span className="absolute bottom-16 z-10"
                        style={{ color: "rgba(255,255,255,0.28)", fontSize: "12px", letterSpacing: "0.06em" }}>
                        شاهد الدرس
                      </span>
                    )}
                  </div>
                )}

                {/* Active native video — NO browser controls, custom overlay below */}
                {isPlayerActive && (
                  <div
                    ref={playerContainerRef}
                    className="absolute inset-0"
                    onMouseMove={showControls}
                    onMouseEnter={showControls}
                    onClick={(e) => { e.stopPropagation(); togglePlayPause(); showControls(); }}
                  >
                    <video
                      key={currentVideo?.video_id}
                      ref={videoRef}
                      poster={videoPosterUrl}
                      className="w-full h-full"
                      style={{ display: 'block', objectFit: 'contain', background: '#050810' }}
                      playsInline
                      preload="metadata"
                      onClick={(e) => e.stopPropagation()}
                      onError={(e) => console.error('Video Load Error:', e.target.error)}
                    >
                      <source src={resolvedVideoSrc} type="video/mp4" />
                    </video>

                    {/* ── Floating Glassmorphism Controls ── */}
                    <div
                      className="absolute inset-x-3 bottom-3 transition-all duration-300"
                      style={{
                        opacity: ctrlsVisible ? 1 : 0,
                        transform: ctrlsVisible ? 'translateY(0)' : 'translateY(6px)',
                        pointerEvents: ctrlsVisible ? 'auto' : 'none',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="flex flex-col gap-2 px-4 pt-3 pb-2.5 rounded-2xl"
                        style={{
                          background: 'rgba(5,8,20,0.55)',
                          backdropFilter: 'blur(18px)',
                          WebkitBackdropFilter: 'blur(18px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                        }}
                      >
                        {/* Progress scrubber */}
                        <div
                          ref={progressTrackRef}
                          className="relative w-full cursor-pointer"
                          style={{ height: '18px', display: 'flex', alignItems: 'center' }}
                          onMouseDown={handleTrackMouseDown}
                          onMouseMove={handleTrackMouseMove}
                          onMouseLeave={() => setHoverTime(null)}
                        >
                          {/* Track rail */}
                          <div
                            className="absolute inset-x-0 rounded-full overflow-hidden"
                            style={{ height: '3px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${progressPct}%`,
                                background: 'linear-gradient(to right, #4f8ef5, #9b6cf7)',
                                boxShadow: '0 0 8px rgba(155,108,247,0.6)',
                                transition: isDragging ? 'none' : 'width 0.1s linear',
                              }}
                            />
                          </div>
                          {/* Scrubber thumb */}
                          <div
                            className="absolute top-1/2 rounded-full pointer-events-none"
                            style={{
                              left: `${progressPct}%`,
                              transform: 'translate(-50%, -50%)',
                              width: '11px', height: '11px',
                              background: '#ffffff',
                              boxShadow: '0 0 0 2px rgba(155,108,247,0.7), 0 0 10px rgba(155,108,247,0.5)',
                              opacity: isDragging ? 1 : 0,
                              transition: 'opacity 0.15s ease',
                            }}
                          />
                          {/* Hover tooltip */}
                          {hoverTime !== null && (
                            <div
                              className="absolute bottom-full mb-2 px-2 py-0.5 rounded pointer-events-none"
                              style={{
                                left: hoverX, transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.82)',
                                color: '#e2e8f0', fontSize: '11px',
                                fontFamily: 'system-ui, sans-serif',
                                whiteSpace: 'nowrap', letterSpacing: '0.02em',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }}
                            >
                              {fmtTime(hoverTime)}
                            </div>
                          )}
                        </div>

                        {/* Controls row */}
                        <div className="flex items-center gap-3" style={{ height: '28px' }} dir="ltr">
                          {/* Play / Pause */}
                          <button
                            onClick={togglePlayPause}
                            className="flex-shrink-0 flex items-center justify-center transition-all duration-150 hover:scale-110"
                            style={{ width: '32px', height: '32px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff', padding: 0 }}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying
                              ? <Pause  size={20} fill="currentColor" stroke="none" />
                              : <Play   size={20} fill="currentColor" stroke="none" style={{ marginLeft: '2px' }} />
                            }
                          </button>

                          {/* Time */}
                          <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'system-ui, sans-serif', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em', whiteSpace: 'nowrap', userSelect: 'none' }}>
                            <span style={{ color: '#e2e8f0' }}>{fmtTime(currentTime)}</span>
                            <span style={{ margin: '0 3px', color: '#475569' }}>/</span>
                            {fmtTime(duration)}
                          </span>

                          <div className="flex-1" />

                          {/* Mute */}
                          <button
                            onClick={toggleMute}
                            className="flex-shrink-0 flex items-center justify-center transition-all duration-150 hover:text-white"
                            style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? <VolumeX size={17} strokeWidth={1.75} /> : <Volume2 size={17} strokeWidth={1.75} />}
                          </button>

                          {/* Fullscreen */}
                          <button
                            onClick={toggleFullscreen}
                            className="flex-shrink-0 flex items-center justify-center transition-all duration-150 hover:text-white"
                            style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                          >
                            {isFullscreen ? <Minimize size={16} strokeWidth={1.75} /> : <Maximize size={16} strokeWidth={1.75} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── No video source / fallback ── */}
            {!loading && !parsedVideoUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                {/* Ambient glow */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse 55% 45% at 50% 55%, rgba(79,142,245,0.07) 0%, transparent 70%)" }} />

                {/* Icon orb */}
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #a855f7 100%)",
                  boxShadow: "0 0 32px rgba(124,58,237,0.45), 0 0 64px rgba(124,58,237,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Play style={{ width: "26px", height: "26px", color: "#ffffff", marginLeft: "3px" }} fill="white" />
                </div>

                {/* Lesson title */}
                <div className="flex flex-col items-center gap-2 text-center px-6">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-1"
                    style={{ background: "rgba(79,142,245,0.10)", border: "1px solid rgba(79,142,245,0.20)" }}>
                    <Zap size={11} style={{ color: "#4f8ef5" }} />
                    <span style={{ color: "#4f8ef5", fontSize: "11px", letterSpacing: "0.08em" }}>
                      درس {currentIndex + 1} من {totalCount}
                    </span>
                  </div>
                  <h3 style={{ color: "rgba(200,216,240,0.9)", fontSize: "17px", fontWeight: 600, lineHeight: 1.5, maxWidth: "380px" }}>
                    {currentVideo?.video_title || currentLesson.title}
                  </h3>
                  <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "12px", marginTop: "2px" }}>
                    {displayDuration && displayDuration !== '00:00' ? displayDuration : 'لا يوجد مصدر فيديو'}
                  </span>
                </div>

                {/* Play / Pause toggle (for non-direct sources) */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105 hover:brightness-110"
                  style={{
                    width: "56px", height: "56px",
                    background: "linear-gradient(135deg, rgba(79,142,245,0.88), rgba(155,108,247,0.88))",
                    boxShadow: "0 0 24px rgba(79,142,245,0.4), 0 0 48px rgba(79,142,245,0.12)",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {isPlaying
                    ? <Pause size={22} className="text-white" fill="white" />
                    : <Play size={22} className="text-white" fill="white" style={{ marginLeft: "2px" }} />
                  }
                </button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Prev */}
            <button
              onClick={handlePreviousLesson}
              disabled={currentIndex === 0}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 flex-1 sm:flex-none ${currentIndex !== 0 ? 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-[#8a9ec0] dark:neon-glow-hover' : 'bg-slate-100 border-gray-200 text-slate-400 dark:bg-white/5 dark:border-white/5 dark:text-[#2a3a55] opacity-50 cursor-not-allowed'}`} style={{ borderWidth: "1px", fontSize: "13px" }}
            >
              <ChevronRight size={16} className={lang === 'en' ? 'rotate-180' : ''} />
              <span>{t('prev_lesson')}</span>
            </button>

            {/* Quiz CTA */}
            <div className="flex-1 flex justify-center w-full sm:w-auto order-last sm:order-none mt-2 sm:mt-0">
              {quizData?.has_attempted ? (
                <div
                  className="flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-center"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.2)",
                    color: "#34d399",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <Zap size={15} />
                  <span>{buttonLabel}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (lessonQuizzes.length === 0 || !quizData) return;
                    if (!isLoggedIn) {
                      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname), {
                        replace: true,
                      });
                      return;
                    }
                    const qId = quizData.quiz_id ?? quizData.id;
                    navigate(`/quiz/${routeLessonId}/${activeTeacher}/${qId}`);
                  }}
                  disabled={lessonQuizzes.length === 0}
                  className={`flex items-center justify-center gap-2.5 px-8 py-2.5 rounded-xl transition-all duration-300 w-full sm:w-auto font-semibold text-[13px] ${lessonQuizzes.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-br dark:from-[#4f8ef5]/20 dark:to-[#9b6cf7]/20 dark:text-[#c8dcff] dark:neon-glow cursor-pointer' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-[#5a6a8a] cursor-not-allowed opacity-60'}`}
                  onMouseEnter={(e) => { if (isDark && lessonQuizzes.length > 0) e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,245,0.28) 0%, rgba(155,108,247,0.22) 100%)"; }} onMouseLeave={(e) => { if (isDark && lessonQuizzes.length > 0) e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,245,0.18) 0%, rgba(155,108,247,0.14) 100%)"; }}
                >
                  <ClipboardList
                    size={15}
                    className={lessonQuizzes.length > 0 ? "text-[#9b6cf7]" : ""}
                  />
                  <span>{lessonQuizzes.length > 0 ? 'بدء الاختبار' : 'لا يوجد اختبار'}</span>
                </button>
              )}
            </div>

            {/* Next */}
            <button
              onClick={handleNextLesson}
              disabled={currentIndex === lessons.length - 1}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 flex-1 sm:flex-none ${currentIndex !== lessons.length - 1 ? 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-[#8a9ec0] dark:neon-glow-hover' : 'bg-slate-100 border-gray-200 text-slate-400 dark:bg-white/5 dark:border-white/5 dark:text-[#2a3a55] opacity-50 cursor-not-allowed'}`} style={{ borderWidth: "1px", fontSize: "13px" }}
            >
              <span>{t('next_lesson')}</span>
              <ChevronLeft size={16} className={lang === 'en' ? 'rotate-180' : ''} />
            </button>
          </div>

          {/* Extra Quizzes */}
          {lessonQuizzes.length > 1 && (
            <div id="quizzes-section" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {lessonQuizzes.map((quiz, qIdx) =>
                quiz.has_attempted ? (
                  <div
                    key={quiz.quiz_id || quiz.id || qIdx}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl"
                    style={{
                      background: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.2)",
                      color: "#34d399",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    <Zap size={14} />
                    <span>
                      {quiz.percentage != null
                        ? `اختبار ${qIdx + 1} — ${quiz.percentage}%`
                        : `اختبار ${qIdx + 1} — تم`}
                    </span>
                  </div>
                ) : (
                  <button
                    key={quiz.quiz_id || quiz.id || qIdx}
                    onClick={() => {
                      if (!isLoggedIn) {
                        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname), {
                          replace: true,
                        });
                        return;
                      }
                      const qId = quiz.quiz_id || quiz.id;
                      navigate(`/quiz/${routeLessonId}/${activeTeacher}/${qId}`);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl neon-glow transition-all hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(155,108,247,0.15) 0%, rgba(79,142,245,0.15) 100%)",
                      border: "1px solid rgba(155,108,247,0.3)",
                      color: "#c8dcff",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    <Zap size={14} className="text-[#9b6cf7]" />
                    <span>بدء اختبار {qIdx + 1}</span>
                  </button>
                )
              )}
            </div>
          )}

          {/* Lesson Description */}
          <div className="rounded-2xl p-6 mt-2 shrink-0 bg-white border border-gray-200 dark:bg-white/5 dark:border-white/5 shadow-sm dark:shadow-none">
            <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#e8f0ff]">
              <BookOpen size={18} className="text-blue-600 dark:text-[#4f8ef5]" /> وصف الدرس
            </h3>
            <p className="text-[13px] leading-[1.8] mb-5 text-slate-600 dark:text-[#8a9ec0]">
              {currentLesson.description || 'لا يوجد وصف متاح لهذا الدرس.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentLesson.chapter && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-[#4f8ef5]/5 dark:border-[#4f8ef5]/10">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-[#4f8ef5]/10 shrink-0">
                    <BookOpen size={16} className="text-blue-600 dark:text-[#4f8ef5]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold mb-0.5 text-blue-600 dark:text-[#4f8ef5]">
                      الفصل
                    </h4>
                    <p style={{ color: isDark ? "#c8d8f0" : "#0F172A", fontSize: "13px" }}>{currentLesson.chapter}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-[#34d399]/5 dark:border-[#34d399]/10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-[#34d399]/10 shrink-0">
                  <CheckCircle2 size={16} className="text-emerald-500 dark:text-[#34d399]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold mb-0.5 text-emerald-600 dark:text-[#34d399]">
                    الحالة والمدة
                  </h4>
                  <p style={{ color: isDark ? "#c8d8f0" : "#0F172A", fontSize: "13px" }}>
                    {currentLesson.completed ? 'مكتمل' : 'قيد التنفيذ'} • {displayDuration}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: "16px" }} className="shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default LessonInterface;
