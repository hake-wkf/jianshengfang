import React from 'react';
import { PaymentMode, GymPackage } from '../../types/gym';
import { PACKAGES } from '../../data/gymData';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Clock, 
  Info
} from 'lucide-react';

interface PackageSelectScreenProps {
  selectedMode: PaymentMode;
  selectedPackageId: string;
  onSelectPackage: (id: string) => void;
  onSelectMode: (mode: PaymentMode) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const PackageSelectScreen: React.FC<PackageSelectScreenProps> = ({
  selectedMode,
  selectedPackageId,
  onSelectPackage,
  onSelectMode,
  onNavigate,
}) => {
  const filteredPackages = PACKAGES.filter((p) => p.mode === selectedMode);
  const currentPkg = PACKAGES.find((p) => p.id === selectedPackageId) || filteredPackages[0];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <button
          onClick={() => onNavigate('store_entry')}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回门店</span>
        </button>
        <span className="text-xs text-slate-700 font-bold">选择健身套餐</span>
        <div className="w-12" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Segmented Switcher between 按次付费 and 按时长付费 */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => {
              onSelectMode('per_count');
              const defaultCount = PACKAGES.find((p) => p.mode === 'per_count');
              if (defaultCount) onSelectPackage(defaultCount.id);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedMode === 'per_count'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>按次付费套餐</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('duration');
              const defaultDur = PACKAGES.find((p) => p.mode === 'duration');
              if (defaultDur) onSelectPackage(defaultDur.id);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedMode === 'duration'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>按时长付费套餐</span>
          </button>
        </div>

        {/* Mode Brief Hint */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-xs">
          <span>
            {selectedMode === 'per_count'
              ? '💡 单次单扣，20分钟缓冲，适合灵活偶尔打卡'
              : '💡 有效期内无限次进出，首次B门放行起算'}
          </span>
        </div>

        {/* Package Cards List */}
        <div className="space-y-2.5">
          {filteredPackages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;
            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pkg.subTitle}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-emerald-700 font-bold text-lg tabular-nums">
                      <span className="text-xs font-normal">¥</span>
                      {pkg.price}
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    {pkg.mode === 'per_count' ? (
                      <span>
                        共 <strong className="text-slate-900 font-bold">{pkg.totalCount}次</strong> · 有效期 {pkg.validDays}天
                      </span>
                    ) : (
                      <span>
                        有效时长 <strong className="text-slate-900 font-bold">{pkg.durationLabel}</strong> · {pkg.validDays}天内激活
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules Notice */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-1.5 shadow-xs mb-4">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>套餐使用规则说明</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
            {currentPkg.rules.map((rule, idx) => (
              <li key={idx} className="leading-relaxed">
                {rule}
              </li>
            ))}
            <li className="text-emerald-700 font-medium">
              实名安全认证：单笔订单绑定单人人脸生物特征，录入后生效。
            </li>
          </ul>
        </div>
      </div>

      {/* Docked Action Bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 pb-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400">应付金额</span>
            <div className="text-xl font-bold text-emerald-700 tabular-nums">
              <span className="text-xs font-normal">¥</span>
              {currentPkg.price}
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>确认并付款</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Home Indicator */}
        <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
