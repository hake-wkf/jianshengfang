import React from 'react';
import { ScreenType } from '../../hooks/useGymStore';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 h-13 flex items-center justify-between">
        <button
          onClick={() => onNavigate('store_entry')}
          className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>极动智能健身</span>
        </button>

        <button
          onClick={onResetData}
          title="重置测试数据"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px]">重置</span>
        </button>
      </div>
    </header>
  );
};
