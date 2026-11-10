import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Download, Maximize2, Minimize2, X, Smartphone, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyUrl: string;
  totalResponses: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  surveyUrl,
  totalResponses,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Generate high resolution QR Code
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        surveyUrl,
        {
          width: isFullScreen ? 380 : 280,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, surveyUrl, isFullScreen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `survey-qr-code-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all overflow-hidden ${
          isFullScreen
            ? 'w-full h-full max-w-5xl max-h-[92vh] justify-between p-8'
            : 'w-full max-w-lg p-6 sm:p-7'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                สแกน QR Code เพื่อตอบแบบประเมิน
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ฉายบนจอโปรเจกเตอร์หรือส่งต่อให้ผู้เข้าอบรม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'ย่อขนาด' : 'ขยายเต็มจอ (Projector Mode)'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              title="ปิดหน้าต่าง"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Content: QR Code Card */}
        <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
          <div className="relative p-4 sm:p-5 bg-white rounded-2xl shadow-lg border-4 border-indigo-600/20">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            <Smartphone className="w-3.5 h-3.5" />
            <span>เปิดกล้องมือถือแล้วสแกนเพื่อตอบได้ทันที</span>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            ผู้ตอบในระบบขณะนี้:{' '}
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {totalResponses}
            </span>{' '}
            คน
          </div>
        </div>

        {/* URL Link & Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-300 font-mono truncate select-all">
              {surveyUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด QR Code (.png)</span>
            </button>

            <a
              href={surveyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>เปิดหน้าตอบในแท็บใหม่</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
