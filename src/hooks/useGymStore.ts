import { useState, useEffect } from 'react';
import {
  PaymentMode,
  GymPackage,
  Order,
  OrderStatus,
  PassageRecord,
  GateSystemState,
} from '../types/gym';
import { PACKAGES, INITIAL_ORDERS, STORE_INFO } from '../data/gymData';

export type ScreenType =
  | 'store_entry'
  | 'pricing_mode'
  | 'package_select'
  | 'checkout'
  | 'order_list'
  | 'order_detail'
  | 'face_record'
  | 'passage_gate';

const STORAGE_KEY = 'unmanned_gym_orders_v1';

export function useGymStore() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('store_entry');
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('per_count');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_count_1');
  const [activeOrderId, setActiveOrderId] = useState<string>('ord_sample_unused');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  
  // Orders list initialized from localStorage or defaults
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Gate System State
  const [gateState, setGateState] = useState<GateSystemState>({
    doorA: 'closed',
    doorB: 'closed',
    chamber: 'idle',
    sensorWeightOk: true,
    tailgatingDetected: false,
    lastVerifiedFaceOk: true,
    isSimulating: false,
    currentStepDescription: '通道就绪，请正视A门人脸识别屏',
  });

  // Selected Package Object
  const selectedPackage = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[0];

  // Active Order Object
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  // Navigation helpers
  const navigateTo = (screen: ScreenType, orderId?: string) => {
    if (orderId) {
      setActiveOrderId(orderId);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create new order on checkout
  const createOrder = (paymentMethod: string): Order => {
    const pkg = selectedPackage;
    const now = new Date();
    const orderNumber = `IPG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Calculate validUntil
    const expiry = new Date(now.getTime() + pkg.validDays * 24 * 60 * 60 * 1000);
    const validUntilStr = `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}-${String(expiry.getDate()).padStart(2, '0')} 23:59:59`;
    
    const paidAtStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      storeName: STORE_INFO.name,
      storeAddress: STORE_INFO.address,
      deviceName: STORE_INFO.equipment.name,
      mode: pkg.mode,
      packageId: pkg.id,
      packageName: `${pkg.name} (${pkg.mode === 'per_count' ? `${pkg.totalCount}次` : pkg.durationLabel})`,
      packagePrice: pkg.price,
      paidAmount: pkg.price,
      paidAt: paidAtStr,
      status: 'unused', // 5. 付款成功后订单初始状态为“未使用”
      faceBound: false,
      totalCount: pkg.mode === 'per_count' ? pkg.totalCount : undefined,
      remainingCount: pkg.mode === 'per_count' ? pkg.totalCount : undefined,
      usedCount: 0,
      validUntil: validUntilStr,
      durationMinutesTotal: pkg.durationHours ? pkg.durationHours * 60 : (pkg.durationDays ? pkg.durationDays * 24 * 60 : undefined),
      records: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    return newOrder;
  };

  // Bind Face to Order
  const bindFaceToOrder = (orderId: string, photoUrl: string, userName: string = '运动学员 (已实名)') => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            faceBound: true,
            facePhotoUrl: photoUrl,
            faceRegisteredAt: timeStr,
            faceUserName: userName,
            status: 'in_use', // 7. 人脸录入成功后返回订单详情页，订单状态变为“使用中”
          };
        }
        return ord;
      })
    );
  };

  // Refund Order (only permitted for 'unused' status)
  const refundOrder = (orderId: string, reason: string = '用户自愿申请未使用退款') => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId && ord.status === 'unused') {
          return {
            ...ord,
            status: 'refunded',
            refundedAt: timeStr,
            refundReason: reason,
          };
        }
        return ord;
      })
    );
  };

  // Record passage completion & deduct count / update duration rules
  const completePassage = (orderId: string, type: 'entry' | 'exit' = 'entry') => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const timeHHMMSS = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const newRecord: PassageRecord = {
          id: `rec_${Date.now()}`,
          timestamp: timeStr,
          type,
          doorATime: timeHHMMSS,
          doorBTime: timeHHMMSS,
          status: 'completed',
          note: type === 'entry' ? '人脸核验通过 · 顺利入馆通行' : '离场出门核验 · 顺利离馆',
        };

        if (ord.mode === 'per_count') {
          const newRemaining = Math.max(0, (ord.remainingCount ?? 1) - 1);
          const newUsed = (ord.usedCount ?? 0) + 1;
          const nextStatus: OrderStatus = newRemaining === 0 ? 'used' : 'in_use';

          return {
            ...ord,
            remainingCount: newRemaining,
            usedCount: newUsed,
            status: nextStatus,
            records: [newRecord, ...ord.records],
          };
        } else {
          // Duration pass
          const startedAt = ord.timingStartedAt || timeStr;
          return {
            ...ord,
            timingStartedAt: startedAt,
            records: [newRecord, ...ord.records],
          };
        }
      })
    );
  };

  // Reset all to sample data
  const resetToSampleData = () => {
    setOrders(INITIAL_ORDERS);
    setActiveOrderId('ord_sample_unused');
    setCurrentScreen('store_entry');
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentScreen,
    setCurrentScreen,
    navigateTo,
    selectedMode,
    setSelectedMode,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    activeOrderId,
    setActiveOrderId,
    activeOrder,
    orders,
    setOrders,
    orderFilter,
    setOrderFilter,
    createOrder,
    bindFaceToOrder,
    refundOrder,
    completePassage,
    resetToSampleData,
    gateState,
    setGateState,
  };
}
