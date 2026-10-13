import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/gym';
import { ScreenType } from '../../hooks/useGymStore';
import { 
  ArrowLeft, 
  UserCheck, 
  AlertCircle, 
  DoorClosed, 
  History
} from 'lucide-react';

interface OrderDetailScreenProps {
  order: Order;
  onNavigate: (screen: ScreenType, orderId?: string) => void;
  onRefundOrder: (orderId: string, reason?: string) => void;
}

export const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  order,
  onNavigate,
  onRefundOrder,
}) => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('个人行程变动，暂不需要使用');

  const isUnused = order.status === 'unused';
  const isInUse = order.status === 'in_use';
  const isUsed = order.status === 'used';
  const isRefunded = order.status === 'refunded';

  const handleConfirmRefund = () => {
    onRefundOrder(order.id, refundReason);
    setShowRefundModal(false);
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'unused':
        return '未使用 · 待录入人脸';
      case 'in_use':
        return '使用中 · 权益有效';
      case 'used':
        return '已使用 · 通行结束';
      case 'refunded':
        return '已退款 · 权益作废';
    }
  };

  const getStatusDot = (status: OrderStatus) => {
    switch (status) {
      case 'unused':
        return 'bg-amber-500';
      case 'in_use':
        return 'bg-emerald-500 animate-pulse';
      case 'used':
        return 'bg-slate-400';
      case 'refunded':
        return 'bg-red-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
        <button
          onClick={() => onNavigate('order_list')}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>订单列表</span>
        </button>
        <span className="text-xs text-slate-700 font-bold">订单详情</span>
        <div className="w-12" /> {/* Balanced spacer */}
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Primary Status Banner */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(order.status)}`} />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {getStatusText(order.status)}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {order.orderNumber}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {isUnused && '订单已支付成功！录入人脸后即可激活通行权限。'}
            {isInUse && '人脸凭证已就绪，当前套餐权益正在生效中。'}
            {isUsed && '该订单权益已全部消耗完毕或超过有效期限，仅保留历史记录。'}
            {isRefunded && `已于 ${order.refundedAt} 成功全额退款，门禁通行权益已同步注销。`}
          </p>
        </div>

        {/* UNUSED SPECIFIC: 未使用额外展示 */}
        {isUnused && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 space-y-2.5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">人脸绑定状态：待录入</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900 font-medium">
                    待激活
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  单笔订单只能录入一个人脸。录入成功后将与当前订单绑定，不可私自换绑他人。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* IN_USE SPECIFIC: 使用中展示纯订单权益详情 */}
        {isInUse && (
          <div className="p-4 rounded-2xl bg-white border border-emerald-300 space-y-3.5 shadow-xs">
            {/* Face Bound Info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 overflow-hidden shrink-0">
                  {order.facePhotoUrl ? (
                    <img
                      src={order.facePhotoUrl}
                      alt="已录入人脸"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">
                      人脸绑定状态：已录入
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      不可换绑
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    绑定人：{order.faceUserName || '张*远 (138****9201)'}
                  </p>
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {order.faceRegisteredAt ? order.faceRegisteredAt.split(' ')[0] : '已绑定'}
              </span>
            </div>

            {/* Remaining counts or duration */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] text-slate-500">
                  {order.mode === 'per_count' ? '剩余使用次数' : '时长卡状态'}
                </p>
                <p className="text-xl font-bold text-emerald-700 tabular-nums mt-0.5">
                  {order.mode === 'per_count' ? (
                    <>
                      {order.remainingCount}{' '}
                      <span className="text-xs text-slate-400 font-normal">/ {order.totalCount}次</span>
                    </>
                  ) : (
                    <span className="text-base text-emerald-700">有效畅练中</span>
                  )}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] text-slate-500">有效期至</p>
                <p className="text-xs font-bold text-slate-900 mt-1 tabular-nums">
                  {order.validUntil.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USED SPECIFIC: 已使用额外展示 */}
        {isUsed && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <History className="w-4 h-4 text-slate-400" />
              <span>使用总结</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">
                  {order.mode === 'per_count' ? '已使用次数' : '套餐有效时长'}
                </span>
                <p className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                  {order.mode === 'per_count'
                    ? `${order.usedCount || order.totalCount || 1} 次 (已结单)`
                    : `${order.durationMinutesTotal ? `${order.durationMinutesTotal / 60}小时` : '限时'} (已届满)`}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400">最后使用时间</span>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {order.records.length > 0 ? order.records[order.records.length - 1].timestamp : order.paidAt}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              该订单权益已全部使用完成。不再提供人脸录入或通行入口，只保留订单和使用记录。
            </p>
          </div>
        )}

        {/* Common Order Information Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs shadow-xs">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1">
            订单信息
          </h3>

          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">订单号</span>
              <span className="font-mono text-slate-800">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">门店名称</span>
              <span className="text-slate-800 font-medium">{order.storeName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">付费模式</span>
              <span className="text-slate-800 font-medium">
                {order.mode === 'per_count' ? '按次付费' : '按时长付费'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">套餐内容</span>
              <span className="text-emerald-700 font-bold">{order.packageName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">支付金额</span>
              <span className="text-slate-900 font-bold tabular-nums">
                ¥{order.paidAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">支付时间</span>
              <span className="text-slate-800 tabular-nums">{order.paidAt}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">套餐有效期</span>
              <span className="text-slate-800 tabular-nums">{order.validUntil}</span>
            </div>
          </div>
        </div>

        {/* Usage History Records */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs shadow-xs mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <History className="w-4 h-4 text-emerald-600" />
              <span>使用记录明细 ({order.records.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">通行记录</span>
          </div>

          {order.records.length === 0 ? (
            <div className="py-5 text-center text-xs text-slate-400">
              暂无通行记录。通行核验后系统将自动同步流水。
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {order.records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {rec.type === 'entry' ? '进馆通行核验' : '离馆出场通行'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">通行成功</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>时间：{rec.timestamp}</span>
                    <span>A门 {rec.doorATime} → B门 {rec.doorBTime}</span>
                  </div>
                  {rec.note && (
                    <p className="text-[10px] text-slate-400 pt-0.5">{rec.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* App Native Bottom Action Bar (Only required for UNUSED to bind face or refund) */}
      {isUnused ? (
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 pb-2 shrink-0 z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRefundModal(true)}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold transition-all shrink-0"
            >
              申请退款
            </button>
            <button
              onClick={() => onNavigate('face_record', order.id)}
              className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>录入人脸</span>
            </button>
          </div>
          <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto mt-2" />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 px-4 py-2 shrink-0 z-20">
          <div className="w-28 h-1 bg-slate-200/90 rounded-full mx-auto" />
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">申请退款确认</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              订单处于“未使用”状态，可全额退款 ¥{order.paidAmount.toFixed(2)} 原路退回。
            </p>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">退款原因：</label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="个人行程变动，暂不需要使用">个人行程变动，暂不需要使用</option>
                <option value="选错门店或套餐类型">选错门店或套餐类型</option>
                <option value="其他原因">其他原因</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors"
              >
                确认退款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
