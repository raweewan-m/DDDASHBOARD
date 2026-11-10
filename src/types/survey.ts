export interface SurveyQuestion {
  id: number;
  title: string;
  shortLabel: string;
  description?: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: number;
  ratings: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  suggestion?: string;
  userAgent?: string;
}

export interface QuestionStat {
  id: number;
  title: string;
  shortLabel: string;
  average: number;
  ratingLevel: RatingLevel;
  distribution: { [key: number]: number }; // count for 1, 2, 3, 4, 5
}

export interface OverallStats {
  totalResponses: number;
  overallAverage: number;
  overallLevel: RatingLevel;
  questionStats: QuestionStat[];
  recentSuggestions: { text: string; timestamp: number }[];
}

export interface RatingLevel {
  label: string;
  rangeText: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

export const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    title: '1. เนื้อหาหลักสูตรมีความทันสมัย ตรงตามวัตถุประสงค์และความต้องการ',
    shortLabel: 'เนื้อหาหลักสูตร',
  },
  {
    id: 2,
    title: '2. วิทยากรมีความรู้ความเชี่ยวชาญ ถ่ายทอดและอธิบายเข้าใจง่าย',
    shortLabel: 'วิทยากรและการถ่ายทอด',
  },
  {
    id: 3,
    title: '3. เทคนิค วิธีการสอน และกิจกรรมการเรียนรู้มีความน่าสนใจ',
    shortLabel: 'กิจกรรมและเทคนิคการสอน',
  },
  {
    id: 4,
    title: '4. สื่อ เอกสารประกอบ และสิ่งอำนวยความสะดวกมีความเหมาะสม',
    shortLabel: 'สื่อและเอกสารประกอบ',
  },
  {
    id: 5,
    title: '5. ประโยชน์และการนำความรู้ที่ได้รับไปประยุกต์ใช้ในการทำงานจริง',
    shortLabel: 'การนำไปประยุกต์ใช้',
  },
];

export const RATING_SCALE_DESCRIPTIONS = [
  { score: 5, label: 'มากที่สุด', emoji: '🌟' },
  { score: 4, label: 'มาก', emoji: '😊' },
  { score: 3, label: 'ปานกลาง', emoji: '😐' },
  { score: 2, label: 'น้อย', emoji: '🙁' },
  { score: 1, label: 'น้อยที่สุด', emoji: '😞' },
];

export function getRatingLevel(average: number): RatingLevel {
  if (average >= 4.51) {
    return {
      label: 'มากที่สุด',
      rangeText: '4.51 - 5.00',
      colorClass: 'text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    };
  }
  if (average >= 3.51) {
    return {
      label: 'มาก',
      rangeText: '3.51 - 4.50',
      colorClass: 'text-blue-700 dark:text-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800',
      badgeText: 'text-blue-700 dark:text-blue-300',
    };
  }
  if (average >= 2.51) {
    return {
      label: 'ปานกลาง',
      rangeText: '2.51 - 3.50',
      colorClass: 'text-amber-700 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
      badgeText: 'text-amber-700 dark:text-amber-300',
    };
  }
  if (average >= 1.51) {
    return {
      label: 'น้อย',
      rangeText: '1.51 - 2.50',
      colorClass: 'text-orange-700 dark:text-orange-400',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800',
      badgeText: 'text-orange-700 dark:text-orange-300',
    };
  }
  return {
    label: 'น้อยที่สุด',
    rangeText: '1.00 - 1.50',
    colorClass: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-300',
  };
}

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
