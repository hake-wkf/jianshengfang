import React from 'react';
import { STORE_INFO } from '../../data/gymData';
import { ScreenType } from '../../hooks/useGymStore';
import { Order } from '../../types/gym';
import { 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface StoreEntryScreenProps {
  onNavigate: (screen: ScreenType, orderId?: string) => void;
  activeOrder?: Order;
  orders: Order[];
}

export const StoreEntryScreen: React.FC<StoreEntryScreenProps> = ({
  onNavigate,
  orders,
}) => {
  const inUseOrder = orders.find((o) => o.status === 'in_use');
  const unusedOrder = orders.find((o) => o.status === 'unused');

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Store Visual Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src="/src/assets/images/gym_store_entry_1790212162189.jpg"
            alt="智慧无人健身房门店"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Operating status pill on top image */}
          <div className="absolute top-3.5 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-emerald-700 font-semibold text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{STORE_INFO.hours} · {STORE_INFO.status}</span>
          </div>

          {/* Store Title in Banner */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[11px] font-semibold tracking-wider text-emerald-300 mb-0.5">
              智能无人健身房
            </p>
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-xs">
              {STORE_INFO.name}
            </h1>
            <p className="text-xs text-slate-200 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">{STORE_INFO.address}</span>
            </p>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="px-4 py-4 space-y-3.5 pb-6">
          {/* Entrance & Equipment Status Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">入口通道设备</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{STORE_INFO.equipment.status} (当前可用)</span>
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {STORE_INFO.equipment.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持刷脸通行，按次或按时长扣减，自助出入
              </p>
            </div>
          </div>

          {/* Existing Active Pass Quick Access (In Use) */}
          {inUseOrder && (
            <div 
              onClick={() => onNavigate('order_detail', inUseOrder.id)}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 text-slate-900 cursor-pointer shadow-xs hover:border-emerald-300 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-800">在用套餐权益</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">使用中</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {inUseOrder.packageName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {inUseOrder.mode === 'per_count'
                        ? `剩余可通行 ${inUseOrder.remainingCount} 次`
                        : `有效期至 ${inUseOrder.validUntil.split(' ')[0]}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-xl">
                  <span>查看详情</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Existing Unused Pass (Waiting for face record) */}
          {!inUseOrder && unusedOrder && (
            <div 
              onClick={() => onNavigate('order_detail', unusedOrder.id)}
              className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-slate-900 cursor-pointer shadow-xs hover:border-amber-300 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-800">待录入人脸激活</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">未使用</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {unusedOrder.packageName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      录入人脸即可激活 A/B 门通行权限
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl">
                  <span>去录脸</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Store Entrance Feature Badges */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <p className="text-xs font-semibold text-slate-500">服务说明</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>全天 24 小时无人值守，刷脸秒级开闸通行</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>支持按次付费或按时长包期，随买随用</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>未开卡录入人脸前支持一键全额退款</span>
              </div>
            </div>
          </div>

          {/* Primary CTA: Directly go to package select */}
          <div className="pt-1">
            <button
              onClick={() => onNavigate('package_select')}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>开始使用 · 购买套餐权益</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
