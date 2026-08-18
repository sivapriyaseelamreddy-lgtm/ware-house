import React from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SmartFlowAssistantDrawer } from './components/layout/SmartFlowAssistantDrawer';
import { AICopilotModal } from './components/layout/AICopilotModal';
import { ToastNotification } from './components/common/ToastNotification';

import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { AllocationPage } from './pages/AllocationPage';
import { PickingPage } from './pages/PickingPage';
import { PackingPage } from './pages/PackingPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { DispatchPage } from './pages/DispatchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const MainContent: React.FC = () => {
  const { activePage } = useWarehouse();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'inventory': return <InventoryPage />;
      case 'orders': return <OrdersPage />;
      case 'allocation': return <AllocationPage />;
      case 'picking': return <PickingPage />;
      case 'packing': return <PackingPage />;
      case 'exceptions': return <ExceptionsPage />;
      case 'dispatch': return <DispatchPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
      <SmartFlowAssistantDrawer />
      <AICopilotModal />
      <ToastNotification />
    </div>
  );
};

export function App() {
  return (
    <WarehouseProvider>
      <MainContent />
    </WarehouseProvider>
  );
}

export default App;
