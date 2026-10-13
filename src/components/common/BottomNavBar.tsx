import React from 'react';
import { Store, ReceiptText, User } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: 'store' | 'orders';
  onTabChange: (tab: 'store' | 'orders') => void;
  ordersBadgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  ordersBadgeCount = 0,
}) => {
  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
      <div className="grid grid-cols-2 h-14 items-center px-4">
        {/* Tab 1: 店铺 */}
        <button
          onClick={() => onTabChange('store')}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 select-none ${
            currentTab === 'store'
              ? 'text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Store
              className={`w-5 h-5 transition-transform ${
                currentTab === 'store' ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight transition-all ${
              currentTab === 'store' ? 'font-bold text-emerald-700' : 'font-medium'
            }`}
          >
            店铺
          </span>
        </button>

        {/* Tab 2: 订单 */}
        <button
          onClick={() => onTabChange('orders')}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 select-none ${
            currentTab === 'orders'
              ? 'text-emerald-600'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ReceiptText
              className={`w-5 h-5 transition-transform ${
                currentTab === 'orders' ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
            {ordersBadgeCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {ordersBadgeCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight transition-all ${
              currentTab === 'orders' ? 'font-bold text-emerald-700' : 'font-medium'
            }`}
          >
            订单
          </span>
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mb-1.5" />
    </div>
  );
};
