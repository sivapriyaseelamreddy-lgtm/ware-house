import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  GitMerge, 
  Boxes, 
  CheckSquare, 
  AlertOctagon, 
  Truck, 
  BarChart3, 
  Settings,
  Bot,
  Zap
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, exceptions, orders, products, toggleAssistant } = useWarehouse();

  const activeExceptionsCount = exceptions.filter(e => !e.resolved).length;
  const urgentOrdersCount = orders.filter(o => o.manualPriority === 'URGENT' && o.fulfillmentStage !== 'DISPATCHED').length;
  const lowStockCount = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: urgentOrdersCount > 0 ? urgentOrdersCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300' },
    { id: 'allocation', label: 'Allocation Center', icon: GitMerge },
    { id: 'picking', label: 'Picking', icon: Boxes },
    { id: 'packing', label: 'Packing & QC', icon: CheckSquare },
    { id: 'exceptions', label: 'Exception Center', icon: AlertOctagon, badge: activeExceptionsCount > 0 ? activeExceptionsCount : undefined, badgeColor: 'bg-rose-600 text-white font-bold animate-pulse' },
    { id: 'dispatch', label: 'Dispatch', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              SmartFlow AI
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-semibold">Smart Warehouse OS</p>
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Trigger Banner */}
      <div className="p-3 mx-3 mt-4 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400 animate-bounce" />
            <span className="text-xs font-semibold text-blue-200">AI Assistant</span>
          </div>
          <button 
            onClick={() => toggleAssistant(true)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-md transition"
          >
            Open 🤖
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Warehouse Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>System Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">Zone A-D Connected • Node v24</div>
      </div>
    </aside>
  );
};
