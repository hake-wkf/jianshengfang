import React from 'react';
import { Order, OrderStatus } from '../../types/gym';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ChevronRight, 
  ReceiptText,
  UserCheck,
  Plus
} from 'lucide-react';

interface OrderListScreenProps {
  orders: Order[];
  currentFilter: 'all' | OrderStatus;
  onSetFilter: (filter: 'all' | OrderStatus) => void;
  onNavigate: (screen: ScreenType, orderId?: string) => void;
}

export const OrderListScreen: React.FC<OrderListScreenProps> = ({
  orders,
  currentFilter,
  onSetFilter,
  onNavigate,
}) => {
  const filteredOrders = orders.filter((o) => {
    if (currentFilter === 'all') return true;
    return o.status === currentFilter;
  });

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'unused':
        return '未使用';
      case 'in_use':
        return '使用中';
      case 'used':
        return '已使用';
      case 'refunded':
        return '已退款';
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'unused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_use':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'used':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'refunded':
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">我的订单</h2>
        <button
          onClick={() => onNavigate('package_select')}
          className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新购权益</span>
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 pb-6">
        {/* Segmented Filter Control */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => onSetFilter('all')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              currentFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({orders.length})
          </button>

          <button
            onClick={() => onSetFilter('unused')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              currentFilter === 'unused'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            未使用 ({orders.filter((o) => o.status === 'unused').length})
          </button>

          <button
            onClick={() => onSetFilter('in_use')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              currentFilter === 'in_use'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            使用中 ({orders.filter((o) => o.status === 'in_use').length})
          </button>

          <button
            onClick={() => onSetFilter('used')}
            className={`flex-1 py-1.5 rounded-xl transition-all ${
              currentFilter === 'used'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已使用 ({orders.filter((o) => o.status === 'used').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
            <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">暂无相关订单</p>
            <p className="text-xs text-slate-400 mt-1">您可点击右上角新购按次或按时长权益</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((ord) => {
              const isUnused = ord.status === 'unused';
              const isInUse = ord.status === 'in_use';
              const isUsed = ord.status === 'used';
              const isRefunded = ord.status === 'refunded';

              return (
                <div
                  key={ord.id}
                  onClick={() => onNavigate('order_detail', ord.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs ${
                    isInUse
                      ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                      : isUnused
                      ? 'border-amber-300 ring-1 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Header: Order Number & Status Label */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-400 font-mono">{ord.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(ord.status)}`}>
                      {getStatusText(ord.status)}
                    </span>
                  </div>

                  {/* Package & Store Info */}
                  <div className="py-2.5 flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {ord.packageName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                        {ord.storeName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        ¥{ord.paidAmount.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ord.mode === 'per_count' ? '计次模式' : '时段模式'}
                      </p>
                    </div>
                  </div>

                  {/* Metric & Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      {ord.mode === 'per_count' ? (
                        <span className="text-slate-600">
                          剩余次数：
                          <strong className="text-emerald-700 font-bold tabular-nums">
                            {ord.remainingCount}
                          </strong>
                          <span className="text-slate-400">/{ord.totalCount}次</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          有效期至：
                          <strong className="text-slate-800 font-medium">
                            {ord.validUntil.split(' ')[0]}
                          </strong>
                        </span>
                      )}
                    </div>

                    {/* Contextual Action Button */}
                    <div>
                      {isUnused && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('order_detail', ord.id);
                          }}
                          className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>去录人脸</span>
                        </button>
                      )}

                      {isInUse && (
                        <span className="text-emerald-700 font-semibold flex items-center text-xs">
                          <span>查看详情</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {isUsed && (
                        <span className="text-slate-400 flex items-center text-xs">
                          <span>查看记录</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {isRefunded && (
                        <span className="text-red-500 text-xs font-medium">已全额退款</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
