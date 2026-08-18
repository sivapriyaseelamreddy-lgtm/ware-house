import React from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { detectWarehouseBottleneck } from '../utils/decisionEngine';
import { AlertOctagon, Layers } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { orders, pickTasks } = useWarehouse();

  const bottleneck = detectWarehouseBottleneck(orders, pickTasks);

  const pipelineStages = [
    { name: 'Orders Created', count: orders.filter(o => o.fulfillmentStage === 'CREATED').length, stage: 'CREATED' },
    { name: 'Allocation', count: orders.filter(o => o.fulfillmentStage === 'ALLOCATED' || o.fulfillmentStage === 'INVENTORY_CHECKED').length, stage: 'ALLOCATED' },
    { name: 'Picking Stage', count: pickTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length, stage: 'PICKING' },
    { name: 'Packing & QC', count: orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK').length, stage: 'PACKING' },
    { name: 'Dispatch Ready', count: orders.filter(o => o.fulfillmentStage === 'DISPATCHED').length, stage: 'DISPATCHED' },
  ];

  const zoneVelocityData = [
    { zone: 'Zone A (Electronics)', velocity: 45, backlog: 3 },
    { zone: 'Zone B (Industrial)', velocity: 28, backlog: 7 },
    { zone: 'Zone C (Apparel)', velocity: 62, backlog: 2 },
    { zone: 'Zone D (Consumables)', velocity: 85, backlog: 1 },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* BOTTLENECK DETECTION HERO CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-amber-950/50 border border-rose-500/40 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/40">
              <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                🔴 Bottleneck Detected: {bottleneck.bottleneckStage} Stage
              </h3>
              <p className="text-xs text-slate-300">Automated Stage Queue Velocity & SLA Delay Analyzer</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold font-mono">
            SLA Risk Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 uppercase text-[10px]">AI System Analysis</span>
            <p className="text-slate-200 leading-relaxed">{bottleneck.analysis}</p>
          </div>
          <div className="p-4 bg-blue-950/50 rounded-xl border border-blue-500/30 space-y-1">
            <span className="font-bold text-emerald-400 uppercase text-[10px]">Recommended Action</span>
            <p className="text-slate-100 font-semibold leading-relaxed">{bottleneck.recommendation}</p>
          </div>
        </div>
      </div>

      {/* VISUAL WAREHOUSE WORKFLOW PIPELINE */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Visual Warehouse Pipeline Backlog Visualizer
        </h3>

        <div className="grid grid-cols-5 gap-3 pt-2">
          {pipelineStages.map((st, idx) => {
            const isBottleneck = bottleneck.bottleneckStage === st.stage;

            return (
              <div 
                key={st.name} 
                className={`p-4 rounded-xl border text-center transition-all ${
                  isBottleneck 
                    ? 'bg-rose-950/60 border-rose-500/60 shadow-lg shadow-rose-500/20 scale-105' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Stage {idx + 1}</span>
                <h4 className="text-xs font-bold text-slate-200 mt-1">{st.name}</h4>
                <p className={`text-2xl font-bold mt-2 ${isBottleneck ? 'text-rose-400 font-mono' : 'text-blue-400'}`}>
                  {st.count}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">Active items</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OPERATIONAL METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Order Fulfillment Rate</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">94.8%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">+2.4% vs last week</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Avg Picking Time</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">14.2 min</p>
          <p className="text-[11px] text-amber-400/80 mt-0.5">Elevated in Zone B</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Exception Rate</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">2.4%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">3 active exceptions</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Inventory Turnover Ratio</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">12.4x</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Optimal asset turnover</p>
        </div>
      </div>

      {/* ZONE PICKING VELOCITY CHART */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Zone Throughput & Backlog Analysis</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="zone" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="velocity" name="Velocity (Picks/hr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="backlog" name="Task Backlog" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
