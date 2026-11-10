import { SurveyResponse, OverallStats, DEFAULT_QUESTIONS, getRatingLevel, FirebaseConfigType } from '../types/survey';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, remove, Database } from 'firebase/database';

const STORAGE_KEY = 'training_survey_responses_v1';
const FIREBASE_CONFIG_KEY = 'training_survey_firebase_config_v1';
const SUBMISSION_FLAG_KEY = 'has_submitted_training_survey_v1';

// Initial sample responses to show off dashboard capabilities immediately
const SAMPLE_RESPONSES: SurveyResponse[] = [
  {
    id: 'sample-1',
    timestamp: Date.now() - 1000 * 60 * 42,
    ratings: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 5 },
    suggestion: 'วิทยากรมีพลังมาก อธิบายเรื่องยากให้เข้าใจง่าย กิจกรรม Workshop ช่วยให้เห็นภาพจริงครับ',
  },
  {
    id: 'sample-2',
    timestamp: Date.now() - 1000 * 60 * 35,
    ratings: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 5 },
    suggestion: 'อยากให้เพิ่มเวลาในการทำแบบฝึกหัดอีกนิด โดยรวมชอบมาก จะนำไปใช้ในทีมแน่นอนค่ะ',
  },
  {
    id: 'sample-3',
    timestamp: Date.now() - 1000 * 60 * 22,
    ratings: { q1: 4, q2: 5, q3: 4, q4: 4, q5: 4 },
    suggestion: 'เอกสารสไลด์ทำได้ประณีตและอ่านง่ายมากครับ ขอบคุณทีมงานที่จัดอบรมดีๆ แบบนี้',
  },
  {
    id: 'sample-4',
    timestamp: Date.now() - 1000 * 60 * 15,
    ratings: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
    suggestion: 'ได้ความรู้ใหม่เยอะมาก สามารถนำไปปรับกระบวนการทำงานได้ทันที เยี่ยมยอดมากครับ',
  },
  {
    id: 'sample-5',
    timestamp: Date.now() - 1000 * 60 * 5,
    ratings: { q1: 4, q2: 5, q3: 5, q4: 4, q5: 5 },
    suggestion: 'ชอบการมีถามตอบแบบสดๆ และตอบคำถามได้ตรงประเด็นมากค่ะ',
  },
];

class SurveyDataService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(responses: SurveyResponse[]) => void> = new Set();
  private firebaseApp: FirebaseApp | null = null;
  private firebaseDb: Database | null = null;
  private isFirebaseConnected = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('training_survey_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SURVEY_UPDATED') {
            const data = this.getLocalResponses();
            this.notifyListeners(data);
          }
        };
      } catch {
        // Fallback if BroadcastChannel is not supported
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          const data = this.getLocalResponses();
          this.notifyListeners(data);
        }
      });

      // Try initializing Firebase if config was saved
      this.initFirebaseFromStorage();
    }
  }

  // --- Local Responses Management ---
  public getLocalResponses(): SurveyResponse[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // seed with sample responses on first load
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_RESPONSES));
        return SAMPLE_RESPONSES;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading responses from localStorage', e);
      return SAMPLE_RESPONSES;
    }
  }

  public subscribe(callback: (responses: SurveyResponse[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getLocalResponses());

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(data: SurveyResponse[]) {
    this.listeners.forEach((cb) => cb(data));
  }

  public async submitResponse(response: Omit<SurveyResponse, 'id' | 'timestamp'>): Promise<SurveyResponse> {
    const newEntry: SurveyResponse = {
      ...response,
      id: 'resp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };

    // 1. Save to local storage
    const current = this.getLocalResponses();
    const updated = [newEntry, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Mark submission in this device
    localStorage.setItem(SUBMISSION_FLAG_KEY, JSON.stringify({
      submittedAt: newEntry.timestamp,
      ratings: newEntry.ratings,
    }));

    // 3. Notify tabs via BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SURVEY_UPDATED' });
    }

    // 4. If Firebase is active, write to Realtime Database /responses node
    if (this.firebaseDb) {
      try {
        const responsesRef = ref(this.firebaseDb, 'surveys/training_demo/responses');
        const newRef = push(responsesRef);
        await set(newRef, newEntry);
      } catch (err) {
        console.warn('Firebase push failed, kept local copy:', err);
      }
    }

    this.notifyListeners(updated);
    return newEntry;
  }

  public checkHasSubmitted(): { hasSubmitted: boolean; submittedData?: { submittedAt: number; ratings: any } } {
    if (typeof window === 'undefined') return { hasSubmitted: false };
    try {
      const item = localStorage.getItem(SUBMISSION_FLAG_KEY);
      if (item) {
        return { hasSubmitted: true, submittedData: JSON.parse(item) };
      }
    } catch {
      // ignore
    }
    return { hasSubmitted: false };
  }

  public clearSubmissionFlag(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SUBMISSION_FLAG_KEY);
    }
  }

  public clearAllResponses(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SURVEY_UPDATED' });
      }
      if (this.firebaseDb) {
        const responsesRef = ref(this.firebaseDb, 'surveys/training_demo/responses');
        remove(responsesRef).catch(console.error);
      }
      this.notifyListeners([]);
    }
  }

  public seedSampleData(): void {
    if (typeof window !== 'undefined') {
      const randomized: SurveyResponse[] = [
        {
          id: 'gen-' + Math.random(),
          timestamp: Date.now() - 1000 * 60 * 3,
          ratings: { q1: 5, q2: 5, q3: 5, q4: 4, q5: 5 },
          suggestion: 'เนื้อหาดีมาก วิทยากรมีตัวอย่างชัดเจน ประทับใจมากค่ะ',
        },
        {
          id: 'gen-' + Math.random(),
          timestamp: Date.now() - 1000 * 60 * 7,
          ratings: { q1: 4, q2: 5, q3: 4, q4: 5, q5: 4 },
          suggestion: 'ระบบตอบแบบสอบถามเรียลไทม์เจ๋งมากครับ เห็นผลขึ้นจอรวดเร็ว',
        },
        {
          id: 'gen-' + Math.random(),
          timestamp: Date.now() - 1000 * 60 * 12,
          ratings: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 },
          suggestion: 'อยากให้จัดคอร์สขั้นสูงต่อเนื่องอีก 1 วันครับ',
        },
      ];
      const current = this.getLocalResponses();
      const updated = [...randomized, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SURVEY_UPDATED' });
      }
      this.notifyListeners(updated);
    }
  }

  // --- Statistics Calculation ---
  public calculateStats(responses: SurveyResponse[]): OverallStats {
    const total = responses.length;

    if (total === 0) {
      return {
        totalResponses: 0,
        overallAverage: 0,
        overallLevel: getRatingLevel(0),
        questionStats: DEFAULT_QUESTIONS.map((q) => ({
          id: q.id,
          title: q.title,
          shortLabel: q.shortLabel,
          average: 0,
          ratingLevel: getRatingLevel(0),
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })),
        recentSuggestions: [],
      };
    }

    const questionStats = DEFAULT_QUESTIONS.map((q) => {
      const key = `q${q.id}` as keyof SurveyResponse['ratings'];
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;

      responses.forEach((r) => {
        const val = r.ratings[key] || 0;
        if (val >= 1 && val <= 5) {
          distribution[val] = (distribution[val] || 0) + 1;
          sum += val;
        }
      });

      const average = Number((sum / total).toFixed(2));
      return {
        id: q.id,
        title: q.title,
        shortLabel: q.shortLabel,
        average,
        ratingLevel: getRatingLevel(average),
        distribution,
      };
    });

    const sumAll = questionStats.reduce((acc, curr) => acc + curr.average, 0);
    const overallAverage = Number((sumAll / questionStats.length).toFixed(2));

    const recentSuggestions = responses
      .filter((r) => r.suggestion && r.suggestion.trim().length > 0)
      .slice(0, 15)
      .map((r) => ({
        text: r.suggestion!.trim(),
        timestamp: r.timestamp,
      }));

    return {
      totalResponses: total,
      overallAverage,
      overallLevel: getRatingLevel(overallAverage),
      questionStats,
      recentSuggestions,
    };
  }

  // --- CSV Export (with UTF-8 BOM for Thai support in Excel) ---
  public exportToCSV(responses: SurveyResponse[]): void {
    const headers = [
      'ลำดับ (No.)',
      'รหัสการตอบ (Response ID)',
      'วันเวลาที่ส่ง (Timestamp)',
      'ข้อ 1 เนื้อหาหลักสูตร (คะแนน)',
      'ข้อ 2 วิทยากรและการถ่ายทอด (คะแนน)',
      'ข้อ 3 กิจกรรมและเทคนิค (คะแนน)',
      'ข้อ 4 สื่อและเอกสาร (คะแนน)',
      'ข้อ 5 การนำไปประยุกต์ใช้ (คะแนน)',
      'คะแนนเฉลี่ยของผู้ตอบ (Avg Score)',
      'ข้อเสนอแนะเพิ่มเติม (Suggestion)',
    ];

    const rows = responses.map((r, index) => {
      const avg = (
        (r.ratings.q1 + r.ratings.q2 + r.ratings.q3 + r.ratings.q4 + r.ratings.q5) / 5
      ).toFixed(2);
      const dateStr = new Date(r.timestamp).toLocaleString('th-TH');
      const cleanSuggestion = (r.suggestion || '').replace(/"/g, '""');

      return [
        index + 1,
        `"${r.id}"`,
        `"${dateStr}"`,
        r.ratings.q1,
        r.ratings.q2,
        r.ratings.q3,
        r.ratings.q4,
        r.ratings.q5,
        avg,
        `"${cleanSuggestion}"`,
      ].join(',');
    });

    // Add BOM (\uFEFF) so Excel opens UTF-8 Thai correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `training_satisfaction_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Firebase Integration (Optional Realtime DB hook) ---
  public getSavedFirebaseConfig(): FirebaseConfigType | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveFirebaseConfig(config: FirebaseConfigType | null): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (!config) {
        localStorage.removeItem(FIREBASE_CONFIG_KEY);
        this.firebaseApp = null;
        this.firebaseDb = null;
        this.isFirebaseConnected = false;
        return true;
      }
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
      return this.initFirebase(config);
    } catch (e) {
      console.error('Failed to save Firebase config', e);
      return false;
    }
  }

  public getIsFirebaseConnected(): boolean {
    return this.isFirebaseConnected;
  }

  private initFirebaseFromStorage() {
    const config = this.getSavedFirebaseConfig();
    if (config && config.databaseURL) {
      this.initFirebase(config);
    }
  }

  private initFirebase(config: FirebaseConfigType): boolean {
    try {
      let app: FirebaseApp;
      const existing = getApps();
      if (existing.length > 0) {
        app = existing[0];
      } else {
        app = initializeApp(config);
      }
      this.firebaseApp = app;
      this.firebaseDb = getDatabase(app);
      this.isFirebaseConnected = true;

      // Listen to Realtime Database changes
      const surveyRef = ref(this.firebaseDb, 'surveys/training_demo/responses');
      onValue(surveyRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list: SurveyResponse[] = Object.keys(val).map((k) => ({
            ...val[k],
            id: val[k].id || k,
          }));
          list.sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          this.notifyListeners(list);
        }
      });

      return true;
    } catch (e) {
      console.warn('Firebase init error:', e);
      this.isFirebaseConnected = false;
      return false;
    }
  }
}

export const surveyService = new SurveyDataService();
