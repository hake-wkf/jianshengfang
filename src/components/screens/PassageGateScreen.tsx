import React, { useState, useEffect } from 'react';
import { Order, GateDoorState } from '../../types/gym';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ArrowLeft, 
  DoorClosed, 
  DoorOpen, 
  RefreshCw, 
  Zap,
  AlertCircle
} from 'lucide-react';

interface PassageGateScreenProps {
  order: Order;
  onCompletePassage: (orderId: string, type: 'entry' | 'exit') => void;
  onNavigate: (screen: ScreenType, orderId?: string) => void;
}

export const PassageGateScreen: React.FC<PassageGateScreenProps> = ({
  order,
  onCompletePassage,
  onNavigate,
}) => {
  const [doorAState, setDoorAState] = useState<GateDoorState>('closed');
  const [doorBState, setDoorBState] = useState<GateDoorState>('closed');
  const [faceVerifyStatus, setFaceVerifyStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [activeSimulationType, setActiveSimulationType] = useState<'entry' | 'exit' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('通道待命就绪。请对准A门立柱识别屏幕进行人脸核验。');
  const [errorDiagnosis, setErrorDiagnosis] = useState<string | null>(null);

  const [bufferSeconds, setBufferSeconds] = useState(20 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setBufferSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startGateSimulation = (type: 'entry' | 'exit' = 'entry', simulateErrorType?: 'occupied' | 'face_fail') => {
    setActiveSimulationType(type);
    setErrorDiagnosis(null);

    setFaceVerifyStatus('scanning');
    setStatusMessage('1/3 正在进行人脸核验与权益校验...');

    setTimeout(() => {
      if (simulateErrorType === 'face_fail') {
        setFaceVerifyStatus('failed');
        setStatusMessage('人脸核验未通过');
        setErrorDiagnosis('未匹配到有效实名凭证，请正视摄像头重新识别。');
        setActiveSimulationType(null);
        return;
      }

      setFaceVerifyStatus('success');
      setStatusMessage('人脸核验成功 · 权益正常！正在开启 A 门...');

      setTimeout(() => {
        if (simulateErrorType === 'occupied') {
          setStatusMessage('通道有人占用');
          setErrorDiagnosis('通道内前序人员尚未完成通行，请稍候再试。');
          setActiveSimulationType(null);
          return;
        }

        setDoorAState('open');
        setStatusMessage('2/3 A 门已开启 · 请单人步入通道');

        setTimeout(() => {
          setDoorAState('closed');
          setDoorBState('open');
          setStatusMessage('3/3 B 门放行开启 · 欢迎入馆！');

          setTimeout(() => {
            setDoorBState('closed');
            setActiveSimulationType(null);
            setStatusMessage('通行完成 · 权益已实时核销');
            onCompletePassage(order.id, type);
          }, 2000);
        }, 2000);
      }, 1000);
    }, 1200);
  };

  const handleResetGate = () => {
    setDoorAState('closed');
    setDoorBState('closed');
    setFaceVerifyStatus('idle');
    setActiveSimulationType(null);
    setErrorDiagnosis(null);
    setStatusMessage('通道待命就绪。请对准A门立柱识别屏幕进行人脸核验。');
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
          <span>订单详情</span>
        </button>
        <span className="text-xs text-slate-700 font-bold">门禁通行状态</span>
        <div className="w-12" />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Main Status & Remaining Entitlements */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400">门禁通道设备</p>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">{order.deviceName}</h2>
            </div>

            <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>通道就绪</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">
                {order.mode === 'per_count' ? '剩余可通行次数' : '时长卡状态'}
              </span>
              <p className="text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                {order.mode === 'per_count' ? (
                  <>
                    {order.remainingCount}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ {order.totalCount}次</span>
                  </>
                ) : (
                  '无限畅练'
                )}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {order.mode === 'per_count' ? '进馆核销1次' : `到期: ${order.validUntil.split(' ')[0]}`}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400">进出安全缓冲时限</span>
              <p className="text-lg font-bold text-slate-800 tabular-nums mt-0.5 font-mono">
                {formatCountdown(bufferSeconds)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">20分钟保障倒计时</p>
            </div>
          </div>
        </div>

        {/* Visual Interlock Gate Corridor */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <DoorClosed className="w-4 h-4 text-emerald-600" />
              <span>A/B 门禁状态监视</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeSimulationType ? '正在通行中...' : '待触发'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* DOOR A */}
            <div className={`p-3.5 rounded-2xl border transition-all text-center ${
              doorAState === 'open'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-9 h-9 mx-auto rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-xs">
                {doorAState === 'open' ? (
                  <DoorOpen className="w-5 h-5 text-emerald-600" />
                ) : (
                  <DoorClosed className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-900">A 门 (入馆外门)</p>
              <p className={`text-xs font-semibold mt-0.5 ${
                doorAState === 'open' ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {doorAState === 'open' ? '已开启' : '已闭锁'}
              </p>
              <span className="inline-block mt-1 text-[10px] text-slate-400">
                可通行 · 不限次
              </span>
            </div>

            {/* DOOR B */}
            <div className={`p-3.5 rounded-2xl border transition-all text-center ${
              doorBState === 'open'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-9 h-9 mx-auto rounded-xl bg-white flex items-center justify-center mb-1.5 shadow-xs">
                {doorBState === 'open' ? (
                  <DoorOpen className="w-5 h-5 text-emerald-600" />
                ) : (
                  <DoorClosed className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-900">B 门 (入馆内门)</p>
              <p className={`text-xs font-semibold mt-0.5 ${
                doorBState === 'open' ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {doorBState === 'open' ? '放行开门' : '等待放行'}
              </p>
              <span className="inline-block mt-1 text-[10px] text-slate-400">
                放行条件：A门关闭锁定
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <p className="text-xs text-slate-700 font-medium leading-normal flex-1">
              {statusMessage}
            </p>
            <button
              onClick={handleResetGate}
              title="刷新状态"
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {errorDiagnosis && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800">通行未成功原因</p>
                <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{errorDiagnosis}</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleResetGate}
                className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                复位重试
              </button>
            </div>
          </div>
        )}

        {/* Interactive Simulation Controls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>通行操作演示</span>
            </h3>
            <span className="text-[11px] text-slate-400">A/B门联动</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startGateSimulation('entry')}
              disabled={!!activeSimulationType}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs transition-all"
            >
              <DoorOpen className="w-4 h-4" />
              <span>模拟刷脸进门 (扣减1次)</span>
            </button>

            <button
              onClick={() => startGateSimulation('exit')}
              disabled={!!activeSimulationType}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] disabled:opacity-40 text-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all"
            >
              <DoorClosed className="w-4 h-4 text-slate-500" />
              <span>模拟离馆出场放行</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">异常测试：</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => startGateSimulation('entry', 'occupied')}
                disabled={!!activeSimulationType}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium"
              >
                通道有人
              </button>
              <button
                onClick={() => startGateSimulation('entry', 'face_fail')}
                disabled={!!activeSimulationType}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium"
              >
                人脸失败
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Docked Action Bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 pb-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400">当前订单状态</span>
            <p className="text-xs font-bold text-emerald-700">
              {order.mode === 'per_count' ? `使用中 (余${order.remainingCount}次)` : '使用中 (有效期内)'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('order_detail', order.id)}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            返回订单详情
          </button>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
