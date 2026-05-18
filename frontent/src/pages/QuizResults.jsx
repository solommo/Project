import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, ArrowRight, Home, Award, Brain, BarChart2, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

/* ════════════════════════════════════════════════════
   DESIGN SYSTEM — Extracted from LandingPage.jsx
════════════════════════════════════════════════════ */
function buildTheme(dk){return dk?{bg:"#0B1120",bgCard:"rgba(255,255,255,0.035)",border:"rgba(255,255,255,0.08)",borderAccent:"rgba(79,70,229,0.38)",accent:"#4F46E5",accentDim:"rgba(79,70,229,0.14)",iconA:"#38BDF8",iconBgA:"rgba(56,189,248,0.10)",iconBorderA:"rgba(56,189,248,0.22)",iconB:"#818CF8",iconBgB:"rgba(129,140,248,0.11)",iconBorderB:"rgba(129,140,248,0.25)",textPrimary:"#F8FAFC",textMuted:"#94A3B8",textDim:"#475569",shadowCard:"0 1px 1px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.35)",trackBg:"rgba(255,255,255,0.06)",green:"#34D399",greenDim:"rgba(52,211,153,0.12)",greenBorder:"rgba(52,211,153,0.22)",red:"#F87171",redDim:"rgba(248,113,113,0.10)",redBorder:"rgba(248,113,113,0.20)",yellow:"#FBBF24",yellowDim:"rgba(251,191,36,0.12)",yellowBorder:"rgba(251,191,36,0.22)",headerBg:"rgba(11,17,32,0.88)",purple:"#A78BFA",purpleDim:"rgba(167,139,250,0.12)",purpleBorder:"rgba(167,139,250,0.25)"}:{bg:"#F8FAFC",bgCard:"#FFFFFF",border:"#E2E8F0",borderAccent:"rgba(15,76,129,0.28)",accent:"#0F4C81",accentDim:"rgba(15,76,129,0.08)",iconA:"#0F4C81",iconBgA:"rgba(15,76,129,0.08)",iconBorderA:"rgba(15,76,129,0.18)",iconB:"#2563EB",iconBgB:"rgba(37,99,235,0.07)",iconBorderB:"rgba(37,99,235,0.16)",textPrimary:"#0F172A",textMuted:"#64748B",textDim:"#94A3B8",shadowCard:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",trackBg:"#E2E8F0",green:"#059669",greenDim:"rgba(5,150,105,0.08)",greenBorder:"rgba(5,150,105,0.18)",red:"#EF4444",redDim:"rgba(239,68,68,0.08)",redBorder:"rgba(239,68,68,0.18)",yellow:"#D97706",yellowDim:"rgba(217,119,6,0.08)",yellowBorder:"rgba(217,119,6,0.18)",headerBg:"rgba(248,250,252,0.90)",purple:"#7C3AED",purpleDim:"rgba(124,58,237,0.08)",purpleBorder:"rgba(124,58,237,0.20)"};
}
const _c=(T,x)=>({background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:"16px",boxShadow:T.shadowCard,...x});
const _t={transition:"all 0.25s ease"};
const _iw=(bg,bd,sz="40px",r="10px")=>({..._t,width:sz,height:sz,borderRadius:r,background:bg,border:`1px solid ${bd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0});

/* ─── Helper: colour ramp for subtopic_evaluation (0-100) ─── */
function evalColor(T, val) {
  if (val >= 75) return { color: T.green,  dim: T.greenDim,  border: T.greenBorder  };
  if (val >= 50) return { color: T.yellow, dim: T.yellowDim, border: T.yellowBorder };
  return            { color: T.red,    dim: T.redDim,    border: T.redBorder    };
}

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const T = buildTheme(isDark);
  const savedRef = useRef(false);
  const isRTL = lang === 'ar';

  const stateData = location.state || (() => {
    try {
      const saved = sessionStorage.getItem('lastQuizResults');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  /* ── Destructure — supports BOTH camelCase and snake_case API shapes ── */
  const {
    // Old / shared fields
    total,
    questions,
    userAnswers,
    lesson,
    subjectId,
    teacherId,
    lessonId,
    subjectName,
    quizId,
  } = stateData || {};

  /* CRITICAL: camelCase-first extraction with snake_case fallback */
  const score      = stateData?.score      ?? 0;
  const totalMarks = stateData?.total_marks ?? stateData?.totalMarks ?? total ?? 0;
  const aiEvaluation = stateData?.aiEvaluation || stateData?.ai_evaluation || [];

  const percentage  = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const resolvedLessonTeacherId = teacherId ?? lesson?.teacher_id ?? lesson?.teacherId ?? null;

  useEffect(() => {
    if (!stateData || savedRef.current) return;
    savedRef.current = true;
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = String(storedUser.id || '');
      if (!userId) return;
      if (percentage < 50 && lesson) {
        const gapLabel = `${subjectName || ''} - ${lesson.title || ''}`;
        const gaps = JSON.parse(localStorage.getItem('remediationGaps') || '[]');
        if (!gaps.some(g => g.gap === gapLabel && g.userId === userId)) {
          gaps.push({
            userId,
            gap:        gapLabel,
            subject:    subjectName || '',
            subjectId:  subjectId || '',
            lessonId:   lesson.id || '',
            lessonTitle: lesson.title || '',
            difficulty: percentage < 30 ? 'hard' : 'medium',
            completed:  false,
            date:       new Date().toISOString().split('T')[0],
          });
          localStorage.setItem('remediationGaps', JSON.stringify(gaps));
        }
      }
    } catch (err) {
      console.error('Save quiz result error:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Redirect if no data ── */
  if (!stateData) {
    return (
      <div dir={isRTL?'rtl':'ltr'} style={{..._t,background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Cairo',sans-serif"}}>
        <div style={{..._t,..._c(T),borderColor:T.yellowBorder,padding:"32px",textAlign:"center",maxWidth:"440px"}}>
          <AlertCircle style={{width:"48px",height:"48px",color:T.yellow,margin:"0 auto 16px"}} />
          <p style={{color:T.yellow,marginBottom:"16px",fontWeight:600}}>{t('no_results')}</p>
          <button onClick={() => navigate('/dashboard')} style={{..._t,background:"transparent",border:"none",color:T.accent,cursor:"pointer",fontWeight:700}}>{t('back_home')}</button>
        </div>
      </div>
    );
  }

  /* ── Feedback label ── */
  let feedbackMessage = "";
  let feedbackColor = T.green;
  if (percentage >= 90)      { feedbackMessage = t('excellent');   feedbackColor = T.green;  }
  else if (percentage >= 75) { feedbackMessage = t('very_good');   feedbackColor = T.accent; }
  else if (percentage >= 50) { feedbackMessage = t('good');        feedbackColor = T.yellow; }
  else                       { feedbackMessage = t('needs_work');  feedbackColor = T.red;    }

  /* ── Nav helpers ── */
  const goCourseDetails = () => {
    if (lesson && subjectId && resolvedLessonTeacherId != null) {
      navigate(
        `/course-details?lessonId=${encodeURIComponent(String(lesson.id ?? lessonId ?? ''))}&teacherId=${encodeURIComponent(String(resolvedLessonTeacherId))}&subjectId=${encodeURIComponent(String(subjectId))}`,
        { state: { lesson, subjectId, subjectName, teacherId: resolvedLessonTeacherId } }
      );
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{..._t,background:T.bg,minHeight:"100vh",padding:"32px 16px",fontFamily:"'Cairo',sans-serif"}}>
      <div style={{maxWidth:"800px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"24px"}}>

        {/* ══════════ Score Card ══════════ */}
        <div style={{..._t,..._c(T),padding:"40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          {/* Thin top accent bar */}
          <div style={{position:"absolute",top:0,right:0,width:"100%",height:"3px",background:percentage>=50?T.green:T.red,borderRadius:"3px"}} />

          {/* Circular progress */}
          <div style={{position:"relative",width:"148px",height:"148px",margin:"0 auto 24px"}}>
            <svg style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}} viewBox="0 0 148 148">
              <circle cx="74" cy="74" r="66" stroke={T.trackBg} strokeWidth="10" fill="transparent" />
              <circle cx="74" cy="74" r="66" stroke={percentage>=50?T.green:T.red} strokeWidth="10" fill="transparent"
                strokeDasharray={415} strokeDashoffset={415-(415*percentage)/100}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}} />
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px"}}>
              <span style={{fontSize:"1.9rem",fontWeight:900,color:T.accent,lineHeight:1}}>{percentage}%</span>
              {/* NEW: show actual marks */}
              <span style={{fontSize:"0.78rem",fontWeight:700,color:T.textMuted,letterSpacing:"0.03em"}}>
                {score} / {totalMarks}
              </span>
            </div>
          </div>

          <h1 style={{..._t,fontSize:"1.4rem",fontWeight:800,color:T.textPrimary,marginBottom:"8px"}}>{t('quiz_result')}</h1>
          <p style={{fontSize:"1rem",fontWeight:700,color:feedbackColor,marginBottom:"4px"}}>{feedbackMessage}</p>

          {/* Score summary row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",flexWrap:"wrap",marginBottom:"4px"}}>
            <span style={{color:T.textMuted,fontSize:"0.85rem"}}>{t('correct_of_prefix')}</span>
            <span style={{fontWeight:800,color:T.accent,fontSize:"0.95rem"}}>{score}</span>
            <span style={{color:T.textMuted,fontSize:"0.85rem"}}>{isRTL ? 'من أصل' : 'out of'}</span>
            <span style={{fontWeight:800,color:T.accent,fontSize:"0.95rem"}}>{totalMarks}</span>
            <span style={{color:T.textMuted,fontSize:"0.85rem"}}>{isRTL ? 'درجة' : 'marks'}</span>
          </div>
        </div>

        {/* ══════════ Action Buttons ══════════ */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          <button
            onClick={() => navigate(`/quiz/${quizId}`)}
            style={{..._t,background:T.accent,color:"#FFF",padding:"14px",borderRadius:"12px",fontWeight:700,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontSize:"0.9rem"}}
          >
            <RefreshCcw style={{width:"20px",height:"20px"}} /> {t('retake_quiz')}
          </button>
          <button
            onClick={goCourseDetails}
            style={{..._t,background:"transparent",border:`1px solid ${T.border}`,color:T.textMuted,padding:"14px",borderRadius:"12px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",fontSize:"0.9rem"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderAccent}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border}}
          >
            <ArrowRight style={{width:"20px",height:"20px",...(lang==='en'?{transform:"rotate(180deg)"}:{})}} /> {t('back_to_lesson')}
          </button>
        </div>

        {/* ══════════ Smart CTA ══════════ */}
        {percentage >= 90 ? (
          <button
            onClick={goCourseDetails}
            style={{..._t,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"14px",borderRadius:"12px",fontWeight:700,border:`1px solid ${T.greenBorder}`,background:T.greenDim,color:T.green,cursor:"pointer",fontSize:"0.9rem"}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.green;e.currentTarget.style.color="#FFF"}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.greenDim;e.currentTarget.style.color=T.green}}
          >
            <Award style={{width:"20px",height:"20px"}} />
            {isRTL ? 'إتقان تام! المتابعة للدرس التالي' : 'Mastery Achieved! Continue to Next Lesson'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/weakness-report', { state: { score, total: totalMarks, questions, userAnswers, lesson, subjectId } })}
            style={{..._t,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"14px",borderRadius:"12px",fontWeight:700,border:`1px solid ${T.borderAccent}`,background:T.accentDim,color:T.accent,cursor:"pointer",fontSize:"0.9rem"}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.accent;e.currentTarget.style.color="#FFF"}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.accentDim;e.currentTarget.style.color=T.accent}}
          >
            <Brain style={{width:"20px",height:"20px"}} />
            {t('view_weakness_report')}
          </button>
        )}

        {/* ══════════ AI Evaluation — Subtopic Breakdown ══════════ */}
        {aiEvaluation && aiEvaluation.length > 0 && (
          <div style={{..._t,..._c(T),padding:"32px"}}>
            {/* Section header */}
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px"}}>
              <div style={_iw(T.iconBgB,T.iconBorderB,"38px","10px")}>
                <BarChart2 style={{color:T.iconB,width:"18px",height:"18px"}} strokeWidth={2} />
              </div>
              <div>
                <h2 style={{..._t,color:T.textPrimary,fontSize:"1.15rem",fontWeight:800,marginBottom:"2px"}}>
                  {isRTL ? 'تحليل الأداء بالذكاء الاصطناعي' : 'AI Performance Analysis'}
                </h2>
                <p style={{color:T.textMuted,fontSize:"0.78rem"}}>
                  {isRTL ? 'تفصيل النتائج حسب كل موضوع فرعي' : 'Results broken down per subtopic'}
                </p>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {aiEvaluation.map((item) => {
                const pct    = Math.min(100, Math.max(0, item.subtopic_evaluation ?? 0));
                const ramp   = evalColor(T, pct);
                const acc    = item.question_count > 0
                  ? Math.round((item.correct_count / item.question_count) * 100)
                  : 0;

                return (
                  <div
                    key={item.subtopic_id}
                    style={{
                      ..._t,
                      padding: "18px 20px",
                      borderRadius: "14px",
                      border: `1px solid ${ramp.border}`,
                      background: ramp.dim,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Subtle left/right accent line */}
                    <div style={{
                      position:"absolute",
                      top:0, [isRTL?"right":"left"]:0,
                      width:"3px", height:"100%",
                      background:ramp.color,
                      borderRadius:"4px",
                    }} />

                    {/* Top row: title + badge */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",marginBottom:"12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",flex:1,minWidth:0}}>
                        <div style={_iw(isDark?"rgba(255,255,255,0.05)":ramp.dim, ramp.border,"34px","8px")}>
                          <Target style={{color:ramp.color,width:"16px",height:"16px"}} strokeWidth={2.2} />
                        </div>
                        <span style={{fontWeight:700,color:T.textPrimary,fontSize:"0.9rem",lineHeight:1.35}}>
                          {item.subtopic_title}
                        </span>
                      </div>

                      {/* Percentage badge */}
                      <span style={{
                        flexShrink:0,
                        fontWeight:800,
                        fontSize:"1rem",
                        color:ramp.color,
                        background:isDark?"rgba(0,0,0,0.25)":"rgba(255,255,255,0.7)",
                        border:`1px solid ${ramp.border}`,
                        borderRadius:"8px",
                        padding:"2px 10px",
                        letterSpacing:"0.02em",
                      }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{height:"7px",borderRadius:"6px",background:T.trackBg,overflow:"hidden",marginBottom:"10px"}}>
                      <div style={{
                        height:"100%",
                        width:`${pct}%`,
                        borderRadius:"6px",
                        background:`linear-gradient(90deg, ${ramp.color}cc, ${ramp.color})`,
                        transition:"width 1s ease",
                        boxShadow:`0 0 6px ${ramp.color}66`,
                      }} />
                    </div>

                    {/* Accuracy stats */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
                      <span style={{
                        fontSize:"0.8rem",
                        fontWeight:600,
                        color:T.textMuted,
                        display:"flex",
                        alignItems:"center",
                        gap:"5px",
                      }}>
                        {item.correct_count >= item.question_count && item.question_count > 0
                          ? <CheckCircle2 style={{width:"14px",height:"14px",color:T.green}} />
                          : <XCircle style={{width:"14px",height:"14px",color:ramp.color}} />
                        }
                        <span style={{fontWeight:800,color:ramp.color}}>{item.correct_count}</span>
                        <span style={{color:T.textDim}}>/</span>
                        <span style={{fontWeight:700,color:T.textMuted}}>{item.question_count}</span>
                        <span style={{color:T.textDim}}>{isRTL ? 'إجابات صحيحة' : 'correct answers'}</span>
                      </span>

                      {/* Mini accuracy pill */}
                      <span style={{
                        fontSize:"0.72rem",
                        fontWeight:700,
                        color:ramp.color,
                        background:ramp.dim,
                        border:`1px solid ${ramp.border}`,
                        borderRadius:"20px",
                        padding:"2px 8px",
                      }}>
                        {acc}% {isRTL ? 'دقة' : 'accuracy'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ Answer Review Section (legacy / old shape) ══════════ */}
        {questions && questions.length > 0 && (
          <div style={{..._t,..._c(T),padding:"32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px"}}>
              <div style={_iw(T.iconBgA,T.iconBorderA,"36px","10px")}>
                <Award style={{color:T.iconA,width:"18px",height:"18px"}} strokeWidth={2} />
              </div>
              <h2 style={{..._t,color:T.textPrimary,fontSize:"1.2rem",fontWeight:800}}>{t('review_answers')}</h2>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
              {questions.map((q, index) => {
                const userAnswerIndex = userAnswers[index];
                const isCorrect = userAnswerIndex === q.correct;
                const isSkipped = userAnswerIndex === null || userAnswerIndex === undefined;

                return (
                  <div key={index} style={{..._t,padding:"16px 20px",borderRadius:"12px",border:`1px solid ${isCorrect?T.greenBorder:T.redBorder}`,background:isCorrect?T.greenDim:T.redDim}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:"12px"}}>
                      <div style={{..._t,marginTop:"2px",minWidth:"24px",height:"24px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:"0.7rem",fontWeight:700,background:isCorrect?T.green:T.red}}>
                        {index + 1}
                      </div>
                      <div style={{flex:1}}>
                        <h3 style={{..._t,fontWeight:700,color:T.textPrimary,marginBottom:"12px",fontSize:"0.9rem"}}>{q.question}</h3>
                        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.82rem"}}>
                            <span style={{color:T.textDim}}>{t('your_answer')}:</span>
                            {isSkipped ? (
                              <span style={{color:T.yellow,fontWeight:600,display:"flex",alignItems:"center",gap:"4px"}}>
                                <AlertCircle style={{width:"16px",height:"16px"}} /> {t('not_answered')}
                              </span>
                            ) : (
                              <span style={{fontWeight:700,display:"flex",alignItems:"center",gap:"4px",color:isCorrect?T.green:T.red}}>
                                {isCorrect ? <CheckCircle2 style={{width:"16px",height:"16px"}} /> : <XCircle style={{width:"16px",height:"16px"}} />}
                                {q.options[userAnswerIndex]}
                              </span>
                            )}
                          </div>
                          {!isCorrect && (
                            <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"0.82rem",background:T.greenDim,border:`1px solid ${T.greenBorder}`,padding:"8px 12px",borderRadius:"8px"}}>
                              <span style={{color:T.textDim}}>{t('correct_answer')}:</span>
                              <span style={{fontWeight:700,color:T.green,display:"flex",alignItems:"center",gap:"4px"}}>
                                <CheckCircle2 style={{width:"16px",height:"16px"}} />
                                {q.options[q.correct]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizResults;
