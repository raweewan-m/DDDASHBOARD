import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, ExternalLink, FileCode, CheckCircle2 } from 'lucide-react';

export const StandaloneCodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'survey' | 'dashboard'>('survey');
  const [surveyCode, setSurveyCode] = useState<string>('กำลังโหลดโค้ด...');
  const [dashboardCode, setDashboardCode] = useState<string>('กำลังโหลดโค้ด...');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch standalone public files
    fetch('/survey.html')
      .then((res) => res.text())
      .then((text) => setSurveyCode(text))
      .catch((err) => setSurveyCode(`<!-- Error loading survey.html: ${err.message} -->`));

    fetch('/dashboard.html')
      .then((res) => res.text())
      .then((text) => setDashboardCode(text))
      .catch((err) => setDashboardCode(`<!-- Error loading dashboard.html: ${err.message} -->`));
  }, []);

  const currentCode = activeFile === 'survey' ? surveyCode : dashboardCode;
  const currentFileName = activeFile === 'survey' ? 'survey.html' : 'dashboard.html';
  const liveUrl = activeFile === 'survey' ? '/survey.html' : '/dashboard.html';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">
            <FileCode className="w-4 h-4" />
            <span>STANDALONE SOURCE CODE (แยก 2 ไฟล์พร้อมใช้งาน)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ซอร์สโค้ดแยก 2 ไฟล์ (HTML + JS + Firebase Realtime DB)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            สามารถคัดลอกหรือดาวน์โหลดไปเปิดใช้งานได้ทันทีโดยไม่ต้องผ่านกระบวนการ build
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition border border-indigo-200 dark:border-indigo-800 cursor-pointer"
          >
            <span>ทดสอบเปิด {currentFileName} ในแท็บใหม่</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* File Selector Tabs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveFile('survey')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeFile === 'survey'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>📱 ไฟล์ที่ 1: survey.html</span>
            <span className="text-[10px] opacity-75 font-normal">(หน้าตอบมือถือ)</span>
          </button>
          <button
            onClick={() => setActiveFile('dashboard')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeFile === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>📊 ไฟล์ที่ 2: dashboard.html</span>
            <span className="text-[10px] opacity-75 font-normal">(หน้าจอโปรเจกเตอร์)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>คัดลอกสำเร็จแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอกโค้ดทั้งหมด</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด {currentFileName}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Code header bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-slate-300 font-semibold">{currentFileName}</span>
          </div>
          <div>{currentCode.split('\n').length} บรรทัด</div>
        </div>

        {/* Code body */}
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed scrollbar-thin">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>โครงสร้างของ 2 ไฟล์นี้:</strong> ทั้ง 2 ไฟล์ถูกเขียนให้เป็น Standalone HTML ที่รวม CSS (Tailwind CDN) และ JavaScript (Firebase 10 SDK & Chart.js) ไว้ในตัว ท่านสามารถดาวน์โหลดไฟล์ไปวางบน Web Server ใดๆ หรืออัปโหลดขึ้น Firebase Hosting / GitHub Pages ได้ทันทีโดยไม่ต้องติดตั้ง Node.js หรือ build เครื่องมือใดๆ เพิ่มเติม
        </div>
      </div>
    </div>
  );
};
