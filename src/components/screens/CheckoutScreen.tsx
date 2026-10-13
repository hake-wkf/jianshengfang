import React, { useState } from 'react';
import { GymPackage, Order } from '../../types/gym';
import { STORE_INFO } from '../../data/gymData';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Clock, 
  X
} from 'lucide-react';

interface CheckoutScreenProps {
  selectedPackage: GymPackage;
  onCreateOrder: (paymentMethod: string) => Order;
  onNavigate: (screen: ScreenType, orderId?: string) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  selectedPackage,
  onCreateOrder,
  onNavigate,
}) => {
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay' | 'quick'>('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const finalAmount = selectedPackage.price;

  const handlePay = (simulateFail: boolean = false) => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsProcessing(false);
      if (simulateFail) {
        setPaymentError('支付超时或用户取消付款。订单未完成，您可以更换支付方式重试。');
        return;
      }

      const newOrder = onCreateOrder(payMethod);
      onNavigate('order_detail', newOrder.id);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <button
          onClick={() => onNavigate('package_select')}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>修改套餐</span>
        </button>
        <span className="text-xs text-slate-700 font-bold">确认订单与支付</span>
        <div className="w-12" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Error Notice */}
        {paymentError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800">支付未成功</p>
              <p className="mt-0.5 text-[11px] text-red-600 leading-relaxed">{paymentError}</p>
            </div>
            <button 
              onClick={() => setPaymentError(null)}
              className="text-red-400 hover:text-red-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Order Item Summary Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-medium text-slate-400">服务门店与设备</p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{STORE_INFO.name}</h3>
              <p className="text-xs text-slate-500">{STORE_INFO.equipment.name}</p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              24H 自助
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
              {selectedPackage.mode === 'per_count' ? (
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{selectedPackage.mode === 'per_count' ? '按次付费' : '按时长付费'}</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedPackage.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPackage.subTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  ¥{selectedPackage.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">权益规格</span>
              <span className="text-slate-800 font-medium">
                {selectedPackage.mode === 'per_count'
                  ? `共计 ${selectedPackage.totalCount} 次入馆通行`
                  : `开门放行后连续畅练 ${selectedPackage.durationLabel}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">有效期规则</span>
              <span className="text-slate-800 font-medium">{selectedPackage.validDays} 天内有效</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            选择支付方式
          </h3>

          <div className="space-y-2">
            {/* Wechat */}
            <div
              onClick={() => setPayMethod('wechat')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                payMethod === 'wechat'
                  ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  微
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">微信支付</p>
                  <p className="text-[11px] text-slate-400">极速面容 / 指纹安全支付</p>
                </div>
              </div>
              {payMethod === 'wechat' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>

            {/* Alipay */}
            <div
              onClick={() => setPayMethod('alipay')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                payMethod === 'alipay'
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  支
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">支付宝</p>
                  <p className="text-[11px] text-slate-400">花呗 / 银行卡快捷扣减</p>
                </div>
              </div>
              {payMethod === 'alipay' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
            </div>

            {/* Quick Pay */}
            <div
              onClick={() => setPayMethod('quick')}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                payMethod === 'quick'
                  ? 'bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  闪
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">云闪付 / 模拟极速付</p>
                  <p className="text-[11px] text-slate-400">银行卡一键快捷免密</p>
                </div>
              </div>
              {payMethod === 'quick' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
            </div>
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">应付总额</span>
            <span className="text-xl font-bold text-emerald-700 tabular-nums">
              <span className="text-xs font-normal">¥</span>
              {finalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Docked Bottom Bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 pb-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="text-[11px] text-slate-400">实付总计</span>
            <div className="text-xl font-bold text-emerald-700 tabular-nums">
              <span className="text-xs font-normal">¥</span>
              {finalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePay(true)}
              disabled={isProcessing}
              title="模拟支付失败"
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-xs font-semibold transition-all"
            >
              模拟失败
            </button>

            <button
              onClick={() => handlePay(false)}
              disabled={isProcessing}
              className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                <span>立即支付</span>
              )}
            </button>
          </div>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
