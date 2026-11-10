/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { surveyService } from './services/storage';
import { SurveyResponse, OverallStats } from './types/survey';
import { MobileSurvey } from './components/MobileSurvey';
import { ProjectorDashboard } from './components/ProjectorDashboard';
import { StandaloneCodeViewer } from './components/StandaloneCodeViewer';
import { FirebaseGuide } from './components/FirebaseGuide';
import { QRCodeModal } from './components/QRCodeModal';
import {
  QrCode,
  LayoutDashboard,
  Smartphone,
  FileCode,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'survey' | 'code' | 'guide'>('dashboard');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<OverallStats>(() => surveyService.calculateStats([]));
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');

  // Check URL parameters for direct view routing (e.g., if mobile scanner opens ?view=survey)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'survey') {
        setActiveTab('survey');
      } else if (viewParam === 'dashboard') {
        setActiveTab('dashboard');
      } else if (viewParam === 'code') {
        setActiveTab('code');
      } else if (viewParam === 'guide') {
        setActiveTab('guide');
      }

      // Build survey link for QR code (points to /survey.html or ?view=survey)
      const origin = window.location.origin;
      const pathName = window.location.pathname;
      const targetSurveyUrl = `${origin}${pathName}?view=survey`;
      setSurveyUrl(targetSurveyUrl);
    }
  }, []);

  // Subscribe to real-time survey updates
  useEffect(() => {
    const unsubscribe = surveyService.subscribe((updatedResponses) => {
      setResponses(updatedResponses);
      setStats(surveyService.calculateStats(updatedResponses));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSurveySuccess = () => {
    // Optionally switch to dashboard or remain on completion screen
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* 
        Top Bar Contract (Section 2 of Frontend Design Constitution):
        Zone 1: Single text element wordmark
        Zone 2: 4-5 single-line clean navigation links
        Zone 3: 1 primary CTA
      */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TP
            </span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition cursor-pointer text-left"
            >
              TrainingPulse Live
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : ''
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>แดชบอร์ดสด</span>
              {responses.length > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {responses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('survey')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'survey'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : ''
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>หน้าตอบแบบสอบถาม</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : ''
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>โค้ดแยก 2 ไฟล์</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : ''
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>วิธีตั้งค่า Firebase & Deploy</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsQrOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>สแกน QR Code</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 px-2 py-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            แดชบอร์ด ({responses.length})
          </button>
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'survey'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ตอบแบบประเมิน
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            โค้ด 2 ไฟล์
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            คู่มือ Firebase
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <ProjectorDashboard
            responses={responses}
            stats={stats}
            onOpenQR={() => setIsQrOpen(true)}
            surveyUrl={surveyUrl}
          />
        )}

        {activeTab === 'survey' && (
          <div className="py-6 px-4">
            <div className="max-w-xl mx-auto mb-4 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                โหมดตอบแบบประเมิน (Mobile View)
              </span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                ← กลับสู่แดชบอร์ด
              </button>
            </div>
            <MobileSurvey onSuccessSubmit={handleSurveySuccess} />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <StandaloneCodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <FirebaseGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ระบบประเมินความพึงพอใจการอบรมสด (Training Satisfaction Real-time)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Tech: HTML5 + JS + Firebase Realtime DB</span>
            <span>·</span>
            <span>ฟรี 100% Spark Plan</span>
          </div>
        </div>
      </footer>

      {/* QR Code Modal Overlay */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        surveyUrl={surveyUrl}
        totalResponses={responses.length}
      />
    </div>
  );
}
