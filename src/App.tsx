/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGymStore } from './hooks/useGymStore';
import { BottomNavBar } from './components/common/BottomNavBar';
import { StoreEntryScreen } from './components/screens/StoreEntryScreen';
import { PackageSelectScreen } from './components/screens/PackageSelectScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { OrderListScreen } from './components/screens/OrderListScreen';
import { OrderDetailScreen } from './components/screens/OrderDetailScreen';
import { FaceRecordScreen } from './components/screens/FaceRecordScreen';
import { PassageGateScreen } from './components/screens/PassageGateScreen';
import { Wifi, Signal, Battery, RotateCcw } from 'lucide-react';

export default function App() {
  const {
    currentScreen,
    navigateTo,
    selectedMode,
    setSelectedMode,
    selectedPackageId,
    setSelectedPackageId,
    selectedPackage,
    activeOrder,
    orders,
    orderFilter,
    setOrderFilter,
    createOrder,
    bindFaceToOrder,
    refundOrder,
    completePassage,
    resetToSampleData,
  } = useGymStore();

  const currentTab = currentScreen === 'order_list' ? 'orders' : 'store';

  const handleTabChange = (tab: 'store' | 'orders') => {
    if (tab === 'store') {
      navigateTo('store_entry');
    } else {
      navigateTo('order_list');
    }
  };

  const isMainTabView = currentScreen === 'store_entry' || currentScreen === 'order_list';

  return (
    <div className="min-h-screen bg-slate-200/70 sm:py-6 flex flex-col items-center justify-center text-slate-900 font-sans antialiased select-none">
      {/* Native Mobile App Container (Strictly constrained to phone viewport dimensions) */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[840px] bg-slate-50 flex flex-col relative overflow-hidden sm:rounded-[40px] shadow-2xl sm:border border-slate-200/90 sm:ring-1 sm:ring-black/5">
        
        {/* iOS Native Status Bar */}
        <div className="shrink-0 h-10 px-6 flex items-center justify-between text-[12px] font-semibold text-slate-800 bg-white/95 backdrop-blur-md z-30 select-none border-b border-slate-100">
          <span>09:41</span>
          
          {/* Dynamic Island Pill indicator */}
          <div className="w-20 h-3.5 bg-black/80 rounded-full flex items-center justify-end px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4 text-slate-800" />
          </div>
        </div>

        {/* Dynamic Screen Viewport Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {renderCurrentScreen()}
        </div>

        {/* Native App Bottom TabBar (Only shown on main tab screens: 店铺 & 订单) */}
        {isMainTabView && (
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={handleTabChange}
            ordersBadgeCount={orders.filter((o) => o.status === 'in_use' || o.status === 'unused').length}
          />
        )}
      </div>

      {/* Floating Subtle Test Reset Helper outside the mobile frame */}
      <div className="mt-3 hidden sm:flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={resetToSampleData}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-slate-600 shadow-xs border border-slate-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span>重置演示数据</span>
        </button>
      </div>
    </div>
  );

  function renderCurrentScreen() {
    switch (currentScreen) {
      case 'store_entry':
        return (
          <StoreEntryScreen
            onNavigate={navigateTo}
            activeOrder={activeOrder}
            orders={orders}
          />
        );

      case 'package_select':
      case 'pricing_mode':
        return (
          <PackageSelectScreen
            selectedMode={selectedMode}
            selectedPackageId={selectedPackageId}
            onSelectPackage={setSelectedPackageId}
            onSelectMode={setSelectedMode}
            onNavigate={navigateTo}
          />
        );

      case 'checkout':
        return (
          <CheckoutScreen
            selectedPackage={selectedPackage}
            onCreateOrder={createOrder}
            onNavigate={navigateTo}
          />
        );

      case 'order_list':
        return (
          <OrderListScreen
            orders={orders}
            currentFilter={orderFilter}
            onSetFilter={setOrderFilter}
            onNavigate={navigateTo}
          />
        );

      case 'order_detail':
        return (
          <OrderDetailScreen
            order={activeOrder}
            onNavigate={navigateTo}
            onRefundOrder={refundOrder}
          />
        );

      case 'face_record':
        return (
          <FaceRecordScreen
            order={activeOrder}
            onBindFace={bindFaceToOrder}
            onNavigate={navigateTo}
          />
        );

      case 'passage_gate':
        return (
          <PassageGateScreen
            order={activeOrder}
            onCompletePassage={completePassage}
            onNavigate={navigateTo}
          />
        );

      default:
        return (
          <StoreEntryScreen
            onNavigate={navigateTo}
            activeOrder={activeOrder}
            orders={orders}
          />
        );
    }
  }
}
