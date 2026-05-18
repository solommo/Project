import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Brain, Home, Trophy, BookOpen } from 'lucide-react';

const WeaknessReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔍 أول ما الصفحة تفتح، اطبع الداتا اللي وصلت فعلياً في شاشة الـ Console
  useEffect(() => {
    console.log("📥 [FRONTLOG] الداتا الواصلة لصفحة التقرير (location.state):", location.state);
  }, [location.state]);

  const state = location.state || {};
  const score = state.score ?? 0;
  const totalMarks = state.total_marks || state.total || 40; 
  const aiEvaluation = state.aiEvaluation || state.ai_evaluation || [];

  const overallPercentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = overallPercentage >= 50;

  const getEvaluationColor = (evalScore) => {
    if (evalScore >= 75) return 'text-green-400 bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]';
    if (evalScore >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
    return 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
  };

  const getProgressBarColor = (evalScore) => {
    if (evalScore >= 75) return 'bg-gradient-to-r from-green-600 to-green-400';
    if (evalScore >= 50) return 'bg-gradient-to-r from-yellow-600 to-yellow-400';
    return 'bg-gradient-to-r from-red-600 to-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white font-['Cairo'] p-4 sm:p-8 transition-colors duration-300" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* الهيدر */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-purple-400">
            <Brain className="w-8 h-8 text-indigo-500" />
            تقرير الذكاء الاصطناعي للموضوعات
          </h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            الرئيسية <Home className="w-5 h-5" />
          </button>
        </div>

        {/* كارت النتيجة الإجمالية */}
        <div className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl ${passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'} flex flex-col items-center justify-center shadow-lg`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
          <Trophy className={`w-20 h-20 mb-4 drop-shadow-lg ${passed ? 'text-green-400' : 'text-red-400'}`} />
          <h2 className="text-5xl font-black mb-2 tracking-tight">{score} <span className="text-2xl text-slate-500 dark:text-slate-400 font-bold">/ {totalMarks}</span></h2>
          <div className={`mt-2 px-6 py-2 rounded-full border ${passed ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
            <p className="text-lg font-bold">
              نسبة الأداء الإجمالية: {overallPercentage}%
            </p>
          </div>
        </div>

        {/* قسم تحليل الذكاء الاصطناعي */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Target className="w-6 h-6 text-indigo-500" />
            تحليل الموضوعات الفرعية من واقع إجاباتك
          </h2>

          {aiEvaluation && aiEvaluation.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {aiEvaluation.map((item, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131B2F] backdrop-blur-md shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-5 gap-4">
                    <h3 className="font-bold text-lg max-w-[75%] leading-snug text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.subtopic_title}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black border ${getEvaluationColor(item.subtopic_evaluation)}`}>
                      {item.subtopic_evaluation}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(item.subtopic_evaluation)}`}
                      style={{ width: `${item.subtopic_evaluation}%` }}
                    />
                  </div>
                  
                  {/* Stats Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">الإجابات الصحيحة:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-black text-lg text-slate-700 dark:text-slate-200">{item.correct_count ?? 0}</span>
                      <span className="text-sm font-medium text-slate-400">من {item.question_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md">
              <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400">لم يتم استلام مصفوفة التقييم بعد أو أنها فارغة.</p>
              <p className="text-xs text-slate-400 mt-2">افتح كونسول المتصفح (F12) لمشاهدة الداتا القادمة من الـ Router.</p>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-center pt-6">
           <button 
             onClick={() => navigate('/dashboard')}
             className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
           >
             <BookOpen className="w-5 h-5" />
             العودة لوحة التحكم لمتابعة الدروس
           </button>
        </div>

      </div>
    </div>
  );
};

export default WeaknessReport;