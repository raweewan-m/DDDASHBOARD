import React, { useState } from 'react';
import { SurveyResponse, OverallStats } from '../types/survey';
import { surveyService } from '../services/storage';
import {
  Download,
  QrCode,
  Sparkles,
  RotateCcw,
  MessageSquareQuote,
  TrendingUp,
  Award,
  Users,
  Sun,
  Moon,
  Clock,
  PieChart,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

const TOPIC_COLORS = [
  { fill: '#4f46e5', hover: '#4338ca', stroke: '#3730a3', bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500' },
  { fill: '#059669', hover: '#047857', stroke: '#065f46', bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  { fill: '#0284c7', hover: '#0369a1', stroke: '#075985', bg: 'bg-sky-600', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500' },
  { fill: '#d97706', hover: '#b45309', stroke: '#92400e', bg: 'bg-amber-600', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500' },
  { fill: '#8b5cf6', hover: '#7c3aed', stroke: '#6d28d9', bg: 'bg-violet-600', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500' },
];

function createDonutSlicePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const angleDelta = Math.min(359.99, Math.max(0.01, endAngle - startAngle));
  const effectiveEndAngle = startAngle + angleDelta;

  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((effectiveEndAngle - 90) * Math.PI) / 180;

  const x1 = cx + rOuter * Math.cos(startRad);
  const y1 = cy + rOuter * Math.sin(startRad);
  const x2 = cx + rOuter * Math.cos(endRad);
  const y2 = cy + rOuter * Math.sin(endRad);

  const x3 = cx + rInner * Math.cos(endRad);
  const y3 = cy + rInner * Math.sin(endRad);
  const x4 = cx + rInner * Math.cos(startRad);
  const y4 = cy + rInner * Math.sin(startRad);

  const largeArcFlag = angleDelta > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
}

interface ProjectorDashboardProps {
  responses: SurveyResponse[];
  stats: OverallStats;
  onOpenQR: () => void;
  surveyUrl: string;
}

export const ProjectorDashboard: React.FC<ProjectorDashboardProps> = ({
  responses,
  stats,
  onOpenQR,
  surveyUrl: _surveyUrl,
}) => {
  const [projectorDark, setProjectorDark] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'distribution'>('overview');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleDownloadCSV = () => {
    surveyService.exportToCSV(responses);
  };

  const handleSimulate = () => {
    surveyService.seedSampleData();
  };

  const handleResetAll = () => {
    if (window.confirm('คุณต้องการล้างข้อมูลคำตอบทั้งหมดเพื่อเริ่มรอบการอบรมใหม่หรือไม่?')) {
      surveyService.clearAllResponses();
    }
  };

  // Find best performing question
  const topQuestion = stats.questionStats.length > 0
    ? [...stats.questionStats].sort((a, b) => b.average - a.average)[0]
    : null;

  // Compute pie chart slices
  const sumAverages = stats.questionStats.reduce((acc, q) => acc + q.average, 0);
  let currentAngle = 0;
  const pieSlices = stats.questionStats.map((q, idx) => {
    const fraction = sumAverages > 0 ? q.average / sumAverages : 0.2;
    const sweep = fraction * 360;
    const start = currentAngle;
    const end = currentAngle + sweep;
    currentAngle = end;
    const colorObj = TOPIC_COLORS[idx % TOPIC_COLORS.length];
    return {
      ...q,
      idx,
      fraction,
      percentText: (fraction * 100).toFixed(1),
      startAngle: start,
      endAngle: end,
      color: colorObj,
    };
  });
  const activeHoveredItem = hoveredSlice !== null ? pieSlices[hoveredSlice] : null;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        projectorDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Control Bar for Projector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <span>LIVE TRAINING DASHBOARD</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">เรียลไทม์จอโปรเจกเตอร์</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              สรุปผลความพึงพอใจการอบรมสด
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Show QR on Projector */}
            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>แสดง QR Code ขึ้นจอ</span>
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              disabled={responses.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ดาวน์โหลด CSV</span>
            </button>

            {/* Quick Demo Data Simulation */}
            <button
              onClick={handleSimulate}
              title="สุ่มข้อมูลจำลองเพิ่ม 3 รายการเพื่อทดสอบการแสดงผล"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">จำลองคนตอบ (+3)</span>
            </button>

            {/* Theme Toggle for Projector readability */}
            <button
              onClick={() => setProjectorDark(!projectorDark)}
              title="สลับโหมดมืด/สว่างสำหรับโปรเจกเตอร์"
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              {projectorDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Reset */}
            <button
              onClick={handleResetAll}
              title="ล้างข้อมูลทั้งหมด"
              className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Key Stat Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Respondents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>ผู้เข้าร่วมตอบแบบประเมิน</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.totalResponses}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">คน</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ซิงค์สดแบบเรียลไทม์</span>
            </div>
          </div>

          {/* 2. Overall Satisfaction Score */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>คะแนนความพึงพอใจเฉลี่ยรวม</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.overallAverage > 0 ? stats.overallAverage.toFixed(2) : '-.--'}
              </span>
              <span className="text-sm font-medium text-slate-400">/ 5.00</span>
            </div>
            <div className="mt-2">
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${stats.overallLevel.badgeBg} ${stats.overallLevel.badgeText}`}
              >
                ระดับ: {stats.overallLevel.label}
              </span>
            </div>
          </div>

          {/* 3. Highest Rated Topic */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>หัวข้อที่ได้คะแนนสูงสุด</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {topQuestion ? topQuestion.shortLabel : '-'}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
              คะแนนเฉลี่ย:{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                {topQuestion ? topQuestion.average.toFixed(2) : '0.00'}
              </span>{' '}
              / 5.00
            </div>
          </div>

          {/* 4. Total Suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
              <span>ข้อเสนอแนะที่ได้รับ</span>
              <MessageSquareQuote className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {stats.recentSuggestions.length}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">ความเห็น</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              ข้อเสนอแนะเพื่อการพัฒนา
            </div>
          </div>
        </div>

        {/* Tab selection for projector views */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 text-indigo-500" />
              <span>แผนภูมิค่าเฉลี่ยรายข้อ ({chartType === 'pie' ? 'Pie Chart' : 'Bar Chart'})</span>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'suggestions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ข้อเสนอแนะล่าสุด ({stats.recentSuggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'distribution'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              การแจกแจงคะแนน 1-5
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>เกณฑ์ประเมิน 5 ระดับ (Likert Scale)</span>
          </div>
        </div>

        {/* TAB 1: Main Chart Overview (Pie Chart by default, with Bar Chart toggle) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Main Column (2 cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {chartType === 'pie' ? (
                        <>
                          <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span>ค่าเฉลี่ยความพึงพอใจรายหัวข้อ (Pie Chart)</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span>ค่าเฉลี่ยความพึงพอใจรายหัวข้อ (Bar Chart)</span>
                        </>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      คำนวณและอัปเดตสัดส่วนแบบอัตโนมัติทุกครั้งที่มีผู้เข้าอบรมส่งคำตอบ (คะแนนเต็ม 5.00)
                    </p>
                  </div>

                  {/* Chart Style Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setChartType('pie')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        chartType === 'pie'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <PieChart className="w-3.5 h-3.5" />
                      <span>Pie Chart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        chartType === 'bar'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Bar Chart</span>
                    </button>
                  </div>
                </div>

                {/* PIE CHART VIEW */}
                {chartType === 'pie' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Donut SVG Illustration */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                        <svg viewBox="0 0 320 320" className="w-full h-full transform -rotate-90">
                          {sumAverages === 0 ? (
                            <circle
                              cx="160"
                              cy="160"
                              r="105"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="48"
                              className="text-slate-100 dark:text-slate-800"
                            />
                          ) : (
                            pieSlices.map((slice) => {
                              const isHovered = hoveredSlice === slice.idx;
                              const rInner = 80;
                              const rOuter = isHovered ? 138 : 130;
                              const pathData = createDonutSlicePath(
                                160,
                                160,
                                rInner,
                                rOuter,
                                slice.startAngle,
                                slice.endAngle
                              );

                              return (
                                <path
                                  key={slice.id}
                                  d={pathData}
                                  fill={isHovered ? slice.color.hover : slice.color.fill}
                                  stroke={projectorDark ? '#020617' : '#ffffff'}
                                  strokeWidth="3"
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseEnter={() => setHoveredSlice(slice.idx)}
                                  onMouseLeave={() => setHoveredSlice(null)}
                                />
                              );
                            })
                          )}
                        </svg>

                        {/* Center Display in Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                          {activeHoveredItem ? (
                            <div className="animate-in fade-in zoom-in-95 duration-150">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate max-w-[140px]">
                                {activeHoveredItem.shortLabel}
                              </span>
                              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                                {activeHoveredItem.average.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-400 block font-mono">
                                สัดส่วน {activeHoveredItem.percentText}%
                              </span>
                              <span
                                className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${activeHoveredItem.ratingLevel.badgeBg} ${activeHoveredItem.ratingLevel.badgeText}`}
                              >
                                {activeHoveredItem.ratingLevel.label}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block">
                                คะแนนเฉลี่ยรวม
                              </span>
                              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                                {stats.overallAverage > 0 ? stats.overallAverage.toFixed(2) : '0.00'}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 block">
                                เต็ม 5.00 คะแนน
                              </span>
                              {stats.overallAverage > 0 && (
                                <span
                                  className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${stats.overallLevel.badgeBg} ${stats.overallLevel.badgeText}`}
                                >
                                  {stats.overallLevel.label}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-2">
                        แตะหรือชี้ที่ชิ้นแผนภูมิเพื่อดูรายละเอียด
                      </span>
                    </div>

                    {/* Right: Legend Breakdown List */}
                    <div className="md:col-span-7 space-y-2.5">
                      {pieSlices.map((slice) => {
                        const isHovered = hoveredSlice === slice.idx;
                        return (
                          <div
                            key={slice.id}
                            onMouseEnter={() => setHoveredSlice(slice.idx)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                              isHovered
                                ? 'bg-indigo-50/70 dark:bg-slate-800 border-indigo-300 dark:border-indigo-600 shadow-xs scale-[1.01]'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`w-3.5 h-3.5 rounded-md mt-0.5 shrink-0 ${slice.color.bg}`}
                                />
                                <div>
                                  <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                    {slice.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>สัดส่วนใน Pie: <strong className="font-mono text-slate-700 dark:text-slate-300">{slice.percentText}%</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                                  {slice.average > 0 ? slice.average.toFixed(2) : '0.00'}
                                </div>
                                <span
                                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${slice.ratingLevel.badgeBg} ${slice.ratingLevel.badgeText}`}
                                >
                                  {slice.ratingLevel.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BAR CHART VIEW (Optional toggle) */}
                {chartType === 'bar' && (
                  <div className="space-y-5">
                    {stats.questionStats.map((q) => {
                      const percent = Math.min(100, Math.round((q.average / 5) * 100));

                      let barColor = 'bg-indigo-600';
                      if (q.average >= 4.51) barColor = 'bg-emerald-500';
                      else if (q.average >= 3.51) barColor = 'bg-blue-600';
                      else if (q.average >= 2.51) barColor = 'bg-amber-500';
                      else if (q.average >= 1.51) barColor = 'bg-orange-500';
                      else if (q.average > 0) barColor = 'bg-rose-500';
                      else barColor = 'bg-slate-200 dark:bg-slate-700';

                      return (
                        <div key={q.id} className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {q.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums text-sm sm:text-base">
                                {q.average > 0 ? q.average.toFixed(2) : '0.00'}
                              </span>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${q.ratingLevel.badgeBg} ${q.ratingLevel.badgeText}`}
                              >
                                {q.ratingLevel.label}
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-4 sm:h-5 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden p-0.5">
                            <div
                              className={`h-full ${barColor} rounded-md transition-all duration-700 ease-out`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Likert Scale Legend */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                    เกณฑ์การแปลความหมายคะแนนเฉลี่ย (ตามหลักสถิติ Likert Scale):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 block">มากที่สุด</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">4.51 - 5.00</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block">มาก</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">3.51 - 4.50</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                      <span className="font-bold text-amber-700 dark:text-amber-300 block">ปานกลาง</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">2.51 - 3.50</span>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80">
                      <span className="font-bold text-orange-700 dark:text-orange-300 block">น้อย</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">1.51 - 2.50</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80">
                      <span className="font-bold text-rose-700 dark:text-rose-300 block">น้อยที่สุด</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">1.00 - 1.50</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Suggestions Ticker & QR Callout */}
              <div className="space-y-6">
              {/* Scan banner for screen */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/40 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                      สแกนตอบคำถาม
                    </span>
                  </div>
                  <button
                    onClick={onOpenQR}
                    className="text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    ขยาย QR จอใหญ่
                  </button>
                </div>
                <p className="text-xs text-indigo-100/80 leading-relaxed mb-3">
                  ผู้เข้าอบรมสามารถใช้มือถือสแกน QR Code เพื่อร่วมประเมินได้ทันที ไม่ต้องลงแอป
                </p>
                <div className="text-[11px] text-indigo-200/90 font-mono bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span>สถานะการเชื่อมต่อ:</span>
                  <span className="text-emerald-400 font-semibold">● พร้อมรับคำตอบ</span>
                </div>
              </div>

              {/* Mini Recent Suggestions Feed */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col h-[380px]">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      ข้อเสนอแนะล่าสุด
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {stats.recentSuggestions.length} ข้อความ
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {stats.recentSuggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500">
                      <Clock className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">ยังไม่มีข้อเสนอแนะที่ส่งเข้ามา</p>
                      <p className="text-[11px] text-slate-400 mt-1">ข้อเสนอแนะจะแสดงที่นี่ทันที</p>
                    </div>
                  ) : (
                    stats.recentSuggestions.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                      >
                        <p className="font-normal italic">"{item.text}"</p>
                        <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center justify-between">
                          <span>ผู้เข้าอบรม</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString('th-TH')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Full Suggestions Wall */}
        {activeTab === 'suggestions' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  ข้อเสนอแนะและความคิดเห็นจากผู้เข้าอบรมทั้งหมด
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  รวบรวมเพื่อนำไปปรับปรุงและพัฒนาหลักสูตรในการจัดครั้งต่อไป
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                รวมทั้งหมด {stats.recentSuggestions.length} ข้อความ
              </span>
            </div>

            {stats.recentSuggestions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">ยังไม่มีข้อเสนอแนะที่ส่งเข้ามาในขณะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentSuggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                      "{item.text}"
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between font-mono">
                      <span>ความคิดเห็นที่ #{idx + 1}</span>
                      <span>{new Date(item.timestamp).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Score Distribution Grid */}
        {activeTab === 'distribution' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                การแจกแจงคะแนนความถี่ 1 - 5 ในแต่ละข้อ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                แสดงจำนวนผู้ตอบที่ให้คะแนนในแต่ละระดับ (สัดส่วนร้อยละ)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.questionStats.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {q.title}
                    </h3>
                    <span className="shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      เฉลี่ย {q.average.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = q.distribution[star] || 0;
                      const percent =
                        stats.totalResponses > 0
                          ? Math.round((count / stats.totalResponses) * 100)
                          : 0;

                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-14 text-slate-500 dark:text-slate-400 font-mono">
                            {star} คะแนน
                          </span>
                          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 text-[11px]">
                            {count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
