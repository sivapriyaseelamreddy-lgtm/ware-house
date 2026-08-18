import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { AlertOctagon, ShieldAlert, CheckCircle2, Filter } from 'lucide-react';

export const ExceptionsPage: React.FC = () => {
  const { exceptions, resolveException, reallocateStock, showToast } = useWarehouse();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const activeExceptions = exceptions.filter(e => !e.resolved && (filterCategory === 'ALL' || e.category === filterCategory));
  const resolvedExceptions = exceptions.filter(e => e.resolved);

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* CENTER HEADER BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/40 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/40">
            <AlertOctagon className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              🚨 Exception & Decision Center
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30">
                {activeExceptions.length} Active Problems
              </span>
            </h3>
            <p className="text-xs text-slate-300">Continuous AI operational monitoring: Exception $\rightarrow$ System Analysis $\rightarrow$ Recommended Resolution $\rightarrow$ User Action</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-4 h-4 text-blue-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Categories</option>
            <option value="INVENTORY_SHORTAGE" className="bg-slate-900">Inventory Shortage</option>
            <option value="OUT_OF_STOCK" className="bg-slate-900">Out of Stock</option>
            <option value="QUALITY_CHECK_FAILURE" className="bg-slate-900">Quality Check Failure</option>
            <option value="DISPATCH_DELAY" className="bg-slate-900">Dispatch Delay</option>
            <option value="PICKING_DELAY" className="bg-slate-900">Picking Delay</option>
          </select>
        </div>
      </div>

      {/* ACTIVE EXCEPTIONS CARDS GRID */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Active Warehouse Exceptions ({activeExceptions.length})</h3>

        {activeExceptions.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-200">Zero Active Operational Exceptions</h4>
            <p className="text-xs text-slate-400 mt-1">All inventory levels, picking tasks, packing stations, and dispatch SLAs are operating normally.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeExceptions.map(ex => (
              <div key={ex.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl glass-card-hover">
                
                {/* Exception Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{ex.title}</h4>
                      <span className="font-mono text-[10px] text-slate-500">{ex.id} • Category: {ex.category}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                    ex.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 badge-urgent-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {ex.severity}
                  </span>
                </div>

                {/* 4 Structured Decision Blocks (Problem, Impact, Analysis, Recommendation) */}
                <div className="space-y-2 text-xs">
                  {/* Problem */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">1. Problem</span>
                    <p className="text-slate-200">{ex.problem}</p>
                  </div>

                  {/* Impact */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">2. Impact</span>
                    <p className="text-slate-200">{ex.impact}</p>
                  </div>

                  {/* System Analysis */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">3. System Analysis</span>
                    <p className="text-slate-200">{ex.systemAnalysis}</p>
                  </div>

                  {/* Recommended Decision */}
                  <div className="p-3.5 bg-blue-950/50 rounded-xl border border-blue-500/40 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">4. AI Recommended Decision</span>
                    <p className="text-slate-100 font-semibold">{ex.recommendedDecision}</p>
                  </div>
                </div>

                {/* Impact Metrics Summary */}
                <div className="flex items-center justify-between text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                  <span>Affected Orders: <strong className="text-slate-200">{ex.affectedOrdersCount || 1}</strong></span>
                  <span>Delay Risk: <strong className="text-amber-400">{ex.potentialDelayText || 'Under Review'}</strong></span>
                </div>

                {/* Resolution Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (ex.suggestedActionType === 'REALLOCATE' && ex.relatedOrderId) {
                        reallocateStock(ex.relatedOrderId, 'ORD-1048', 'PRD-102', 3);
                      } else {
                        resolveException(ex.id, `Approved: ${ex.recommendedDecision}`);
                      }
                      showToast('Resolution Executed', `Applied AI decision for ${ex.id}`, 'success');
                    }}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Recommendation</span>
                  </button>

                  <button
                    onClick={() => {
                      resolveException(ex.id, 'Overridden by Warehouse Manager');
                      showToast('Exception Overridden', `Manual override applied to ${ex.id}`, 'info');
                    }}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
                  >
                    Override Decision
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESOLVED EXCEPTIONS LOG */}
      {resolvedExceptions.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Exceptions Log ({resolvedExceptions.length})</h3>

          <div className="divide-y divide-slate-800/60 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            {resolvedExceptions.map(ex => (
              <div key={ex.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-200">{ex.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Action: {ex.actionTaken}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">RESOLVED</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
