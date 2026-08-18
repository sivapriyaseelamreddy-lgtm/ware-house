import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Search, Bell, Bot, Play, RotateCcw, Filter } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activePage, 
    searchQuery, 
    setSearchQuery, 
    selectedZoneFilter, 
    setSelectedZoneFilter, 
    exceptions, 
    toggleAssistant, 
    tickSimulation, 
    resetData,
    setActivePage
  } = useWarehouse();

  const activeAlertsCount = exceptions.filter(e => !e.resolved).length;

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Smart Operations Dashboard', subtitle: 'Real-time KPI monitoring & automated warehouse intelligence' },
    inventory: { title: 'Inventory Management', subtitle: 'Stock health tracking & smart reorder recommendations' },
    orders: { title: 'Order Management & Fulfillment', subtitle: 'Smart order priority engine & progress tracking' },
    allocation: { title: 'Smart Allocation Center', subtitle: 'Conflict resolution & automated stock reallocation' },
    picking: { title: 'Picking Management', subtitle: 'Zone-optimized picking sequence & picker dispatch' },
    packing: { title: 'Packing & Quality Check', subtitle: 'Item verification & defect exception escalation' },
    exceptions: { title: '🚨 Exception & Decision Center', subtitle: 'Active warehouse bottlenecks & 1-click system resolutions' },
    dispatch: { title: 'Dispatch Tracking', subtitle: 'Carrier assignment, tracking & SLA breach monitoring' },
    analytics: { title: 'Analytics & Bottleneck Detection', subtitle: 'Pipeline metrics & automated stage delay detection' },
    settings: { title: 'System Settings', subtitle: 'Priority formulas, simulation controls & data benchmarks' }
  };

  const currentPageInfo = titleMap[activePage] || { title: 'SmartFlow AI', subtitle: 'Smart Warehouse OS' };

  return (
    <header className="h-20 bg-slate-900/80 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">{currentPageInfo.title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{currentPageInfo.subtitle}</p>
      </div>

      {/* Center Search & Zone Filter */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, products, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <select 
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Zones</option>
            <option value="Zone A" className="bg-slate-900">Zone A (Electronics)</option>
            <option value="Zone B" className="bg-slate-900">Zone B (Industrial)</option>
            <option value="Zone C" className="bg-slate-900">Zone C (Apparel)</option>
            <option value="Zone D" className="bg-slate-900">Zone D (Consumables)</option>
          </select>
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Simulate Tick */}
        <button
          onClick={tickSimulation}
          title="Simulate 1-hour warehouse operational progress"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>Simulate Tick</span>
        </button>

        {/* Reset Mock Data */}
        <button
          onClick={resetData}
          title="Reset mock data to benchmark state"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* SmartFlow Assistant Trigger */}
        <button
          onClick={() => toggleAssistant(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition"
        >
          <Bot className="w-4 h-4" />
          <span>Smart Assistant</span>
        </button>

        {/* Exception Notification Alert Icon */}
        <button
          onClick={() => setActivePage('exceptions')}
          className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {activeAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
