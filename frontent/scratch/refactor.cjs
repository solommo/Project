const fs = require('fs');
let content = fs.readFileSync('src/pages/LessonInterface.jsx', 'utf8');

// The goal is to replace hardcoded styles with Tailwind dark: variants and light defaults.

// 1. Root container
content = content.replace(
  /className="w-full flex h-\[calc\(100vh-64px\)\] overflow-hidden"/g,
  `className="w-full flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#060c1a] text-slate-900 dark:text-white"`
).replace(
  /style={{\s*background:\s*"#060c1a",\s*fontFamily:\s*"'Cairo', sans-serif",\s*}}/g,
  `style={{ fontFamily: "'Cairo', sans-serif" }}`
);

// 2. Sidebar container
content = content.replace(
  /className="flex-shrink-0 flex flex-col h-full z-20"/g,
  `className="flex-shrink-0 flex flex-col h-full z-20 bg-white border-l border-gray-200 dark:bg-[#07101f] dark:border-white/5"`
).replace(
  /style={{\s*width:\s*"30%",\s*minWidth:\s*"260px",\s*maxWidth:\s*"340px",\s*background:\s*"#07101f",\s*borderLeft:\s*"1px solid rgba\(255,255,255,0\.05\)",\s*}}/g,
  `style={{ width: "30%", minWidth: "260px", maxWidth: "340px" }}`
);

// 3. Sidebar Header
content = content.replace(
  /className="px-5 py-5 flex-shrink-0"\s*style={{ borderBottom: "1px solid rgba\(255,255,255,0\.05\)" }}/g,
  `className="px-5 py-5 flex-shrink-0 border-b border-gray-200 dark:border-white/5"`
);

// Text colors in Sidebar
content = content.replace(/className="text-\[#4f8ef5\]"/g, 'className="text-blue-600 dark:text-[#4f8ef5]"')
  .replace(/color: "#4a6080"/g, 'color: isDark ? "#4a6080" : "#64748B"')
  .replace(/color: "#c8d8f0"/g, 'color: isDark ? "#c8d8f0" : "#0F172A"')
  .replace(/color: "#3a4a65"/g, 'color: isDark ? "#3a4a65" : "#475569"')
  .replace(/color: "#2a3a55"/g, 'color: isDark ? "#2a3a55" : "#94A3B8"')
  .replace(/color: "#5a7aaa"/g, 'color: isDark ? "#5a7aaa" : "#3B82F6"');

// Lesson Button background
content = content.replace(
  /className={`w-full text-right px-4 py-3 mx-1 flex items-start gap-3 transition-all duration-300 rounded-xl \${(.*?)isCurrent \? "neon-glow" : "neon-glow-hover"(.*?)} cursor-pointer`}/g,
  'className={`w-full text-right px-4 py-3 mx-1 flex items-start gap-3 transition-all duration-300 rounded-xl cursor-pointer ${isCurrent ? "bg-blue-50 dark:bg-transparent dark:neon-glow border border-blue-200 dark:border-transparent" : "bg-transparent dark:neon-glow-hover hover:bg-slate-100 dark:hover:bg-transparent border border-transparent dark:border-white/5"}`}'
).replace(
  /style={{\s*width:\s*"calc\(100% - 8px\)",\s*background:\s*isCurrent\s*\?\s*"linear-gradient\(135deg, rgba\(79,142,245,0\.1\) 0%, rgba\(155,108,247,0\.06\) 100%\)"\s*:\s*"transparent",\s*marginBottom:\s*"2px",\s*\.\.\.\(isCurrent \? {} : { borderColor: "rgba\(255,255,255,0\.04\)" }\),\s*}}/g,
  `style={{ width: "calc(100% - 8px)", marginBottom: "2px" }}`
);

// Icons
content = content.replace(
  /<CheckCircle2 size={17} className="text-emerald-400" \/>/g,
  '<CheckCircle2 size={17} className="text-emerald-500 dark:text-emerald-400" />'
).replace(
  /<Play size={17} className="text-blue-400" \/>/g,
  '<Play size={17} className="text-blue-600 dark:text-blue-400" />'
);

// Lesson row text
content = content.replace(
  /color: isCurrent\s*\?\s*"#e8f0ff"\s*:\s*lesson\.completed\s*\?\s*"#7a90b0"\s*:\s*"#8a9ec0",/g,
  `color: isCurrent ? (isDark ? "#e8f0ff" : "#1E293B") : lesson.completed ? (isDark ? "#7a90b0" : "#94A3B8") : (isDark ? "#8a9ec0" : "#475569"),`
).replace(
  /className=\{`flex-shrink-0 text-blue-400 \${/g,
  `className={\`flex-shrink-0 text-blue-600 dark:text-blue-400 \${`
);

// Progress section
content = content.replace(
  /className="px-5 py-5 flex-shrink-0"\s*style={{ borderTop: "1px solid rgba\(255,255,255,0\.05\)" }}/g,
  `className="px-5 py-5 flex-shrink-0 border-t border-gray-200 dark:border-white/5"`
);

content = content.replace(
  /style={{\s*height:\s*"6px",\s*background:\s*"rgba\(255,255,255,0\.05\)",\s*border:\s*"1px solid rgba\(255,255,255,0\.04\)",\s*}}/g,
  `className="h-[6px] bg-gray-200 dark:bg-white/5 border border-transparent dark:border-white/5"`
);

// Teacher Panel
content = content.replace(
  /className="bg-white\/5 border border-white\/10 rounded-xl backdrop-blur-md p-4 flex flex-wrap justify-between items-center gap-4 shadow-\[0_0_15px_rgba\(79,142,245,0\.05\)\]"/g,
  `className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl dark:backdrop-blur-md p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm dark:shadow-[0_0_15px_rgba(79,142,245,0.05)]"`
).replace(
  /className="w-10 h-10 rounded-full bg-\[#0c1424\] border border-\[#1a2438\] flex items-center justify-center neon-glow"/g,
  `className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#0c1424] border border-gray-200 dark:border-[#1a2438] flex items-center justify-center dark:neon-glow"`
).replace(
  /className="text-\[#e8f0ff\] font-bold text-sm drop-shadow-\[0_0_5px_rgba\(255,255,255,0\.3\)\]"/g,
  `className="text-slate-900 dark:text-[#e8f0ff] font-bold text-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"`
).replace(
  /className="px-3 py-1\.5 rounded-full bg-blue-500\/10 text-blue-400 border border-blue-500\/20 shadow-\[0_0_10px_rgba\(59,130,246,0\.2\)\]"/g,
  `className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]"`
);

// Video Player Box
content = content.replace(
  /className="relative rounded-2xl overflow-hidden neon-glow group shrink-0"\s*style={{ aspectRatio: "16\/9", background: "#030810", maxHeight: "65vh" }}/g,
  `className="relative rounded-2xl overflow-hidden dark:neon-glow group shrink-0 border border-gray-200 dark:border-none shadow-sm dark:shadow-none bg-black"\n            style={{ aspectRatio: "16/9", maxHeight: "65vh" }}`
).replace(
  /className="absolute inset-0 opacity-20 pointer-events-none"/g,
  `className="absolute inset-0 opacity-20 pointer-events-none hidden dark:block"`
).replace(
  /className="absolute inset-0 pointer-events-none"/g,
  `className="absolute inset-0 pointer-events-none hidden dark:block"`
);

// Buttons (Prev/Next/Quiz)
content = content.replace(
  /className=\{`flex items-center justify-center gap-2 px-5 py-2\.5 rounded-xl transition-all duration-300 \$\{\s*currentIndex !== 0 \? 'neon-glow-hover' : ''\s*\} flex-1 sm:flex-none`\}\s*style={{\s*background: "rgba\(255,255,255,0\.03\)",\s*border: "1px solid rgba\(255,255,255,0\.07\)",\s*color: currentIndex !== 0 \? "#8a9ec0" : "#2a3a55",\s*opacity: currentIndex !== 0 \? 1 : 0\.4,\s*cursor: currentIndex !== 0 \? "pointer" : "not-allowed",\s*fontSize: "13px",\s*}}/g,
  `className={\`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 flex-1 sm:flex-none \${currentIndex !== 0 ? 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-[#8a9ec0] dark:neon-glow-hover' : 'bg-slate-100 border-gray-200 text-slate-400 dark:bg-white/5 dark:border-white/5 dark:text-[#2a3a55] opacity-50 cursor-not-allowed'}\`} style={{ borderWidth: "1px", fontSize: "13px" }}`
).replace(
  /className=\{`flex items-center justify-center gap-2 px-5 py-2\.5 rounded-xl transition-all duration-300 \$\{\s*currentIndex !== lessons\.length - 1 \? 'neon-glow-hover' : ''\s*\} flex-1 sm:flex-none`\}\s*style={{\s*background: "rgba\(255,255,255,0\.03\)",\s*border: "1px solid rgba\(255,255,255,0\.07\)",\s*color: currentIndex !== lessons\.length - 1 \? "#8a9ec0" : "#2a3a55",\s*opacity: currentIndex !== lessons\.length - 1 \? 1 : 0\.4,\s*cursor: currentIndex !== lessons\.length - 1 \? "pointer" : "not-allowed",\s*fontSize: "13px",\s*}}/g,
  `className={\`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 flex-1 sm:flex-none \${currentIndex !== lessons.length - 1 ? 'bg-white hover:bg-slate-50 border-gray-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-[#8a9ec0] dark:neon-glow-hover' : 'bg-slate-100 border-gray-200 text-slate-400 dark:bg-white/5 dark:border-white/5 dark:text-[#2a3a55] opacity-50 cursor-not-allowed'}\`} style={{ borderWidth: "1px", fontSize: "13px" }}`
);

// Quiz Button
content = content.replace(
  /className=\{`flex items-center justify-center gap-2\.5 px-8 py-2\.5 rounded-xl transition-all duration-300 w-full sm:w-auto \$\{\s*lessonQuizzes\.length > 0 \? 'neon-glow' : ''\s*\}`\}\s*style={{\s*background:\s*lessonQuizzes\.length > 0\s*\?\s*"linear-gradient\(135deg, rgba\(79,142,245,0\.18\) 0%, rgba\(155,108,247,0\.14\) 100%\)"\s*:\s*"rgba\(255,255,255,0\.03\)",\s*color: lessonQuizzes\.length > 0 \? "#c8dcff" : "#5a6a8a",\s*fontSize: "13px",\s*fontWeight: 600,\s*cursor: lessonQuizzes\.length > 0 \? "pointer" : "not-allowed",\s*opacity: lessonQuizzes\.length > 0 \? 1 : 0\.6,\s*}}/g,
  `className={\`flex items-center justify-center gap-2.5 px-8 py-2.5 rounded-xl transition-all duration-300 w-full sm:w-auto font-semibold text-[13px] \${lessonQuizzes.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-br dark:from-[#4f8ef5]/20 dark:to-[#9b6cf7]/20 dark:text-[#c8dcff] dark:neon-glow cursor-pointer' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-[#5a6a8a] cursor-not-allowed opacity-60'}\`}`
);

content = content.replace(
  /onMouseEnter=\{\(e\) => \{\s*if \(lessonQuizzes\.length > 0\) \{\s*e\.currentTarget\.style\.background =\s*"linear-gradient\(135deg, rgba\(79,142,245,0\.28\) 0%, rgba\(155,108,247,0\.22\) 100%\)";\s*\}\s*\}\}\s*onMouseLeave=\{\(e\) => \{\s*if \(lessonQuizzes\.length > 0\) \{\s*e\.currentTarget\.style\.background =\s*"linear-gradient\(135deg, rgba\(79,142,245,0\.18\) 0%, rgba\(155,108,247,0\.14\) 100%\)";\s*\}\s*\}\}/g,
  `onMouseEnter={(e) => { if (isDark && lessonQuizzes.length > 0) e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,245,0.28) 0%, rgba(155,108,247,0.22) 100%)"; }} onMouseLeave={(e) => { if (isDark && lessonQuizzes.length > 0) e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,142,245,0.18) 0%, rgba(155,108,247,0.14) 100%)"; }}`
);

fs.writeFileSync('src/pages/LessonInterface.jsx', content);
console.log('Script completed');
