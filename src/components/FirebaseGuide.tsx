import React, { useState } from 'react';
import { surveyService } from '../services/storage';
import {
  Database,
  Flame,
  Globe,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Terminal,
  KeyRound,
  FileCode2,
} from 'lucide-react';

export const FirebaseGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [configInput, setConfigInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleRules = `{
  "rules": {
    "surveys": {
      "training_demo": {
        "responses": {
          ".read": true,
          ".write": true,
          "$response_id": {
            ".validate": "newData.hasChildren(['ratings', 'timestamp'])"
          }
        }
      }
    }
  }
}`;

  const sampleFirebaseConfig = `const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE-KEY-987654",
  authDomain: "my-training-app.firebaseapp.com",
  databaseURL: "https://my-training-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-training-app",
  storageBucket: "my-training-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};`;

  const handleSaveConfig = () => {
    try {
      let parsed = null;
      // extract json object if user pasted the entire javascript snippet
      const clean = configInput.trim();
      if (clean.includes('{') && clean.includes('}')) {
        const jsonCandidate = clean
          .replace(/const\s+firebaseConfig\s*=\s*/, '')
          .replace(/;$/, '')
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // fix unquoted keys
          .replace(/'/g, '"');
        parsed = JSON.parse(jsonCandidate);
      } else {
        parsed = JSON.parse(clean);
      }

      const ok = surveyService.saveFirebaseConfig(parsed);
      if (ok) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wider">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>Firebase Realtime Database Setup & Deployment Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          ขั้นตอนการตั้งค่า Firebase Realtime Database และ Deploy ฟรีทีละขั้น
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          ระบบนี้ทำงานด้วย <strong className="text-slate-900 dark:text-slate-200">Firebase Realtime Database</strong> ซึ่งอยู่ในแพ็กเกจฟรี (Spark Plan) ไม่เสียค่าบริการ ไม่ต้องผูกบัตรเครดิต และไม่ต้องให้ผู้ตอบล็อกอิน
        </p>
      </div>

      {/* Step 1 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            สร้าง Firebase Project (ฟรี 100%)
          </h2>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed pl-11">
          <p>
            1. ไปที่เว็บไซต์{' '}
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              console.firebase.google.com
              <ExternalLink className="w-3.5 h-3.5" />
            </a>{' '}
            และเข้าสู่ระบบด้วย Google Account ของท่าน
          </p>
          <p>
            2. กดปุ่ม <strong className="text-slate-900 dark:text-white">"Add project" (สร้างโปรเจกต์)</strong>
          </p>
          <p>
            3. ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-mono">training-survey-live</code> แล้วกดยืนยันตามขั้นตอน (Google Analytics ปิดไว้หรือไม่เปิดก็ได้)
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            สร้าง Realtime Database & ตั้งค่า Security Rules
          </h2>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed pl-11">
          <p>
            1. ในเมนูด้านซ้าย เลือก <strong className="text-slate-900 dark:text-white">Build &gt; Realtime Database</strong>
          </p>
          <p>
            2. กดปุ่ม <strong className="text-slate-900 dark:text-white">"Create Database"</strong> แล้วเลือกตำแหน่งฐานข้อมูล (เช่น <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Singapore / asia-southeast1</code> หรือ <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">United States</code>)
          </p>
          <p>
            3. ในขั้นตอน Security Rules ให้เลือก <strong className="text-slate-900 dark:text-white">Start in test mode</strong> หรือเข้าไปที่แท็บ <strong className="text-slate-900 dark:text-white">Rules</strong> แล้วใส่กฎด้านล่างนี้เพื่อให้ผู้เข้าอบรมตอบได้ทันทีโดยไม่ต้องล็อกอิน:
          </p>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
              {sampleRules}
            </pre>
            <button
              onClick={() => copyToClipboard(sampleRules, 'rules')}
              className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'rules' ? 'คัดลอกแล้ว' : 'คัดลอกกฎ Rules'}</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>คำแนะนำด้านความปลอดภัย:</strong> กฎข้างต้นอนุญาตให้อ่านและเขียนเฉพาะ path <code className="font-mono">surveys/training_demo/responses</code> และตรวจสอบว่าข้อมูลที่ส่งมามี ratings และ timestamp ครบถ้วน เพื่อป้องกันสแปม
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            รับค่า firebaseConfig และนำไปใส่ใน 2 ไฟล์
          </h2>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed pl-11">
          <p>
            1. ใน Firebase Console ไปที่ไอคอนรูปเฟือง ⚙️ (Project settings) &gt; แท็บ General
          </p>
          <p>
            2. เลื่อนลงมาที่หัวข้อ <strong className="text-slate-900 dark:text-white">Your apps</strong> คลิกไอคอนเว็บ <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">&lt;/&gt;</code> เพื่อสร้าง Web App
          </p>
          <p>
            3. ตั้งชื่อแอป เช่น <code className="font-mono text-xs">Training App</code> แล้วคัดลอกก้อน <code className="font-mono text-xs">const firebaseConfig = &#123; ... &#125;;</code>
          </p>

          <div className="relative">
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
              {sampleFirebaseConfig}
            </pre>
            <button
              onClick={() => copyToClipboard(sampleFirebaseConfig, 'config')}
              className="absolute top-3 right-3 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedSection === 'config' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'config' ? 'คัดลอกตัวอย่าง' : 'คัดลอกตัวอย่าง'}</span>
            </button>
          </div>

          <p>
            4. เปิดไฟล์ <strong className="text-indigo-600 dark:text-indigo-400 font-mono">survey.html</strong> และ <strong className="text-indigo-600 dark:text-indigo-400 font-mono">dashboard.html</strong> แล้วนำค่า firebaseConfig ของท่านไปวางแทนที่ค่าเดิม
          </p>
        </div>
      </div>

      {/* Step 4: Live Config Tester */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                ทดสอบเชื่อมต่อ Firebase ในเว็บนี้ได้ทันที (Interactive Test)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                วางก้อน JSON หรือ Object firebaseConfig เพื่อให้ Dashboard หน้านี้ซิงค์กับ Firebase ของท่าน
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            rows={4}
            value={configInput}
            onChange={(e) => setConfigInput(e.target.value)}
            placeholder={`วาง firebaseConfig ของท่านที่นี่ เช่น:\n{\n  "apiKey": "AIzaSy...",\n  "databaseURL": "https://...-default-rtdb.firebaseio.com",\n  "projectId": "..."\n}`}
            className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              บันทึกและเชื่อมต่อ Firebase
            </button>

            {saveStatus === 'success' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> เชื่อมต่อ Firebase สำเร็จ!
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step 5: How to Deploy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            <Globe className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            วิธี Deploy ขึ้นเว็บไซต์ออนไลน์ฟรี (ฟรีตลอดชีพ & มี HTTPS)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
          {/* Option A: Firebase Hosting */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                วิธีที่ 1: Firebase Hosting (แนะนำที่สุด)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              เสร็จใน 3 คำสั่ง ได้โดเมนฟรี เช่น <code className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-1 rounded">your-app.web.app</code>
            </p>
            <div className="bg-slate-950 text-slate-200 p-3 rounded-lg text-xs font-mono space-y-1">
              <div className="text-slate-400"># 1. ติดตั้ง firebase-tools</div>
              <div className="text-emerald-400">npm install -g firebase-tools</div>
              <div className="text-slate-400 mt-2"># 2. ล็อกอินและตั้งค่า</div>
              <div className="text-emerald-400">firebase login</div>
              <div className="text-emerald-400">firebase init hosting</div>
              <div className="text-slate-400 mt-2"># 3. สั่ง Deploy ขึ้นเว็บ</div>
              <div className="text-emerald-400">firebase deploy</div>
            </div>
          </div>

          {/* Option B: GitHub Pages */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                วิธีที่ 2: GitHub Pages (ฟรี 100%)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              เหมาะมากเพราะไม่ต้องลงโปรแกรมใดๆ แค่อัปโหลดไฟล์ขึ้น GitHub
            </p>
            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal pl-4">
              <li>สร้าง Repository ใหม่บน GitHub เช่น <code className="font-mono text-[11px]">training-survey</code></li>
              <li>อัปโหลดไฟล์ <code className="font-mono text-[11px]">survey.html</code> และ <code className="font-mono text-[11px]">dashboard.html</code> (หรือเปลี่ยนชื่อ survey.html เป็น index.html เพื่อให้เป็นหน้าแรก)</li>
              <li>ไปที่เมนู <strong>Settings &gt; Pages</strong></li>
              <li>เลือก Source: <strong>Deploy from a branch (main)</strong> แล้วกด Save</li>
              <li>รอ 1 นาที จะได้ลิงก์เว็บพร้อมใช้งานทันที!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
