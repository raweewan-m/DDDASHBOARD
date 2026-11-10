import React, { useState, useEffect } from 'react';
import { DEFAULT_QUESTIONS, RATING_SCALE_DESCRIPTIONS, SurveyResponse } from '../types/survey';
import { surveyService } from '../services/storage';
import { CheckCircle2, RotateCcw, Send, Star, AlertCircle, HeartHandshake, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MobileSurveyProps {
  onSuccessSubmit?: (response: SurveyResponse) => void;
  isEmbedded?: boolean;
}

export const MobileSurvey: React.FC<MobileSurveyProps> = ({ onSuccessSubmit, isEmbedded = false }) => {
  const [ratings, setRatings] = useState<{ [key: string]: number }>({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  });
  const [suggestion, setSuggestion] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const status = surveyService.checkHasSubmitted();
    if (status.hasSubmitted) {
      setHasSubmitted(true);
      setSubmittedData(status.submittedData);
    }
  }, []);

  const handleSelectRating = (questionKey: string, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [questionKey]: score,
    }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const answeredCount = Object.values(ratings).filter((v) => v > 0).length;
  const progressPercent = Math.round((answeredCount / 5) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all 5 questions answered
    const unanswered = [1, 2, 3, 4, 5].filter((num) => ratings[`q${num}`] === 0);
    if (unanswered.length > 0) {
      setValidationError(`กรุณาตอบแบบประเมินให้ครบทั้ง 5 ข้อ (ยังขาดข้อที่ ${unanswered.join(', ')})`);
      const firstUnansweredEl = document.getElementById(`question-card-${unanswered[0]}`);
      if (firstUnansweredEl) {
        firstUnansweredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const responseData = await surveyService.submitResponse({
        ratings: {
          q1: ratings.q1,
          q2: ratings.q2,
          q3: ratings.q3,
          q4: ratings.q4,
          q5: ratings.q5,
        },
        suggestion: suggestion.trim(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      });

      // Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }

      setHasSubmitted(true);
      setSubmittedData({
        submittedAt: Date.now(),
        ratings,
      });

      if (onSuccessSubmit) {
        onSuccessSubmit(responseData);
      }
    } catch (err) {
      console.error(err);
      setValidationError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    surveyService.clearSubmissionFlag();
    setHasSubmitted(false);
    setSubmittedData(null);
    setRatings({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    setSuggestion('');
    setValidationError(null);
  };

  const quickSuggestions = [
    'วิทยากรถ่ายทอดได้ชัดเจนและมีพลังมาก',
    'ได้ลงมือปฏิบัติจริง นำไปใช้ได้ทันที',
    'เนื้อหาทันสมัย ตอบโจทย์การทำงาน',
    'การจัดลำดับเวลาและกิจกรรมดีมาก',
    'อยากให้มีหลักสูตรขั้นสูงต่อเนื่อง',
  ];

  // Already submitted screen
  if (hasSubmitted) {
    return (
      <div className={`mx-auto max-w-lg ${isEmbedded ? '' : 'min-h-[80vh] py-8 px-4'}`}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            บันทึกแบบประเมินเรียบร้อยแล้ว
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            ขอขอบพระคุณที่สละเวลาให้ข้อเสนอแนะ ความคิดเห็นของท่านจะถูกส่งไปยังหน้าจอ Dashboard ของผู้จัดอบรมทันทีแบบเรียลไทม์
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>การป้องกันการตอบซ้ำ (Device Protected)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              อุปกรณ์เครื่องนี้ได้ส่งแบบประเมินแล้ว เพื่อป้องกันการส่งข้อมูลซ้ำซ้อนในระบบสถิติ
            </p>
            {submittedData?.submittedAt && (
              <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 font-mono">
                เวลาที่บันทึก: {new Date(submittedData.submittedAt).toLocaleTimeString('th-TH')}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForTesting}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ส่งแบบประเมินใหม่ (โหมดทดสอบ)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-xl ${isEmbedded ? '' : 'py-6 px-4 sm:px-6'}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 mb-6 shadow-sm border border-indigo-700/30">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium mb-2 tracking-wide uppercase">
          <HeartHandshake className="w-4 h-4 text-indigo-300" />
          <span>แบบประเมินความพึงพอใจการอบรม</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
          แบบสอบถามความพึงพอใจของผู้เข้าอบรม
        </h1>
        <p className="text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
          ความคิดเห็นของท่านมีคุณค่าอย่างยิ่งในการพัฒนาหลักสูตรและการจัดอบรมในครั้งต่อไป
          (ไม่ระบุตัวตนและไม่ต้องเข้าสู่ระบบ)
        </p>

        {/* Progress Indicator */}
        <div className="mt-5 pt-4 border-t border-indigo-700/50">
          <div className="flex items-center justify-between text-xs text-indigo-200 mb-1.5 font-medium">
            <span>ความคืบหน้าการตอบ</span>
            <span className="font-mono tabular-nums">{answeredCount} / 5 ข้อ ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-indigo-950/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating Scale Legend helper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shadow-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">เกณฑ์การให้คะแนน:</span>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>1 = น้อยที่สุด</span>
            <span>·</span>
            <span>3 = ปานกลาง</span>
            <span>·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">5 = มากที่สุด</span>
          </div>
        </div>

        {/* 5 Questions */}
        {DEFAULT_QUESTIONS.map((question) => {
          const currentVal = ratings[`q${question.id}`] || 0;
          return (
            <div
              id={`question-card-${question.id}`}
              key={question.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 shadow-xs ${
                currentVal > 0
                  ? 'border-indigo-300 dark:border-indigo-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3.5">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {question.title}
                </h2>
                {currentVal > 0 ? (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                    <Star className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400" />
                    {currentVal} คะแนน
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] text-rose-500 font-medium">
                    * จำเป็น
                  </span>
                )}
              </div>

              {/* 1-5 Buttons with large mobile touch targets */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((score) => {
                  const isSelected = currentVal === score;
                  const itemDesc = RATING_SCALE_DESCRIPTIONS.find((d) => d.score === score);

                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleSelectRating(`q${question.id}`, score)}
                      className={`min-h-[58px] sm:min-h-[64px] flex flex-col items-center justify-center rounded-xl font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900'
                          : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-bold font-mono leading-none mb-1">
                        {score}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-normal leading-tight ${
                          isSelected ? 'text-indigo-100 font-medium' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {itemDesc?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Suggestion Textarea */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="survey-suggestion"
              className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100"
            >
              ข้อเสนอแนะเพิ่มเติม / สิ่งที่ประทับใจ
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">(ไม่บังคับ)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            ท่านสามารถพิมพ์ข้อเสนอแนะเพื่อการปรับปรุง หรือบอกสิ่งที่เป็นประโยชน์ในการอบรม
          </p>

          <textarea
            id="survey-suggestion"
            rows={3}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="เช่น วิทยากรยกตัวอย่างได้เห็นภาพชัดเจน, อยากให้มีเวลา Workshop เพิ่มเติม..."
            className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          />

          {/* Quick chips */}
          <div className="mt-3">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-1.5">
              แตะเพื่อเลือกข้อความด่วน:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSuggestions.map((text, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSuggestion((prev) => (prev ? `${prev} ${text}` : text));
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer text-left"
                >
                  + {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="leading-snug">{validationError}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[52px] sm:min-h-[56px] flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>กำลังบันทึกข้อมูล...</span>
            </div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>ส่งแบบประเมินความพึงพอใจ</span>
            </>
          )}
        </button>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2 pb-6">
          🔒 ระบบไม่เก็บชื่อหรือข้อมูลส่วนบุคคล เพื่อความเป็นอิสระในการแสดงความคิดเห็น
        </div>
      </form>
    </div>
  );
};
