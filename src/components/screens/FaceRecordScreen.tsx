import React, { useState, useRef, useEffect } from 'react';
import { Order } from '../../types/gym';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ArrowLeft, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck
} from 'lucide-react';

interface FaceRecordScreenProps {
  order: Order;
  onBindFace: (orderId: string, photoUrl: string, userName?: string) => void;
  onNavigate: (screen: ScreenType, orderId?: string) => void;
}

export const FaceRecordScreen: React.FC<FaceRecordScreenProps> = ({
  order,
  onBindFace,
  onNavigate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('请正视镜头，将面部置于虚线框中');
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useSimulatedMode, setUseSimulatedMode] = useState(false);

  const sampleFaces = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  ];

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          currentStream = stream;
          setStreamActive(true);
        }
      } catch (err) {
        setUseSimulatedMode(true);
      }
    }

    if (!capturedImage && !useSimulatedMode) {
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [capturedImage, useSimulatedMode]);

  const handleCapture = () => {
    setErrorMessage(null);
    if (useSimulatedMode) {
      setCapturedImage(sampleFaces[0]);
      runLivenessCheck();
      return;
    }

    if (videoRef.current && streamActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        runLivenessCheck();
      }
    } else {
      setCapturedImage(sampleFaces[0]);
      runLivenessCheck();
    }
  };

  const runLivenessCheck = (shouldFail: boolean = false) => {
    setIsScanning(true);
    setLivenessPassed(false);
    setScanStep('正在进行活体检测与特征提取...');

    setTimeout(() => {
      if (shouldFail) {
        setIsScanning(false);
        setScanStep('活体检测未通过');
        setErrorMessage('检测到面部遮挡或光线较暗，请摘除帽子口罩并重新拍摄。');
        return;
      }

      setIsScanning(false);
      setLivenessPassed(true);
      setScanStep('活体检测通过 · 请确认录入');
    }, 1200);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLivenessPassed(false);
    setErrorMessage(null);
    setScanStep('请正视镜头，将面部置于虚线框中');
  };

  const handleConfirmBind = () => {
    if (!capturedImage) return;
    onBindFace(order.id, capturedImage, '学员 (已实名)');
    onNavigate('order_detail', order.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <button
          onClick={() => onNavigate('order_detail', order.id)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回订单</span>
        </button>
        <span className="text-xs text-slate-700 font-bold">人脸凭据录入</span>
        <div className="w-12" />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Order Context */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-mono">{order.orderNumber}</span>
            <h3 className="font-bold text-slate-900 mt-0.5">{order.packageName}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
            待绑定
          </span>
        </div>

        {/* Camera Box */}
        <div className="relative aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md flex items-center justify-center">
          {!capturedImage ? (
            useSimulatedMode ? (
              <div className="relative w-full h-full">
                <img
                  src={sampleFaces[0]}
                  alt="模拟取景"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white backdrop-blur-md">
                  算法模拟取景
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )
          ) : (
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="拍摄的人脸"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Biometric Oval */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-40 h-52 rounded-[50%] border-2 transition-all duration-300 ${
                livenessPassed
                  ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                  : errorMessage
                  ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : isScanning
                  ? 'border-emerald-400 animate-pulse'
                  : 'border-white/60 border-dashed'
              }`}
            />
          </div>

          <div className="absolute bottom-3 inset-x-3 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs text-white shadow-xs">
              {scanStep}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setUseSimulatedMode(!useSimulatedMode)}
            className="text-[11px] text-slate-400 hover:text-emerald-600 underline"
          >
            {useSimulatedMode ? '切换为真实前置镜头' : '无摄像头？切换算法模拟取景'}
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={handleRetake}
              className="w-full py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              重新调整并重试
            </button>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-1.5 shadow-xs mb-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>拍摄注意事项</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
            <li>保持正面直视镜头，面部置于框内中央</li>
            <li>请摘下帽子和墨镜，单笔订单仅限绑定1人</li>
            <li>录入成功后作为 A/B 门唯一通行凭证，不可借用</li>
          </ul>
        </div>
      </div>

      {/* Docked Action Bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 pb-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
        {!capturedImage ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCapture}
              className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>拍摄并录入人脸</span>
            </button>

            <button
              onClick={() => {
                setCapturedImage(sampleFaces[0]);
                runLivenessCheck(true);
              }}
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-xs font-semibold shrink-0"
              title="模拟失败分支"
            >
              模拟失败
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRetake}
              disabled={isScanning}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重拍</span>
            </button>

            <button
              onClick={handleConfirmBind}
              disabled={isScanning || !livenessPassed}
              className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>确认录入</span>
            </button>
          </div>
        )}

        {/* iOS Home Indicator */}
        <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
