import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Bot, X, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const SmartFlowAssistantDrawer: React.FC = () => {
  const { isAssistantOpen, toggleAssistant, exceptions, orders, products, resolveException, reallocateStock, setActivePage, showToast } = useWarehouse();

  if (!isAssistantOpen) return null;

  const activeExceptions = exceptions.filter(e => !e.resolved);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  🤖 SmartFlow Decision Assistant
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">AI Active</span>
                </h3>
                <p className="text-xs text-slate-400">Autonomous Exception & Fulfillment Optimizer</p>
              </div>
            </div>
            <button
              onClick={() => toggleAssistant(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Scrollable AI Recommendations */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Top Insight Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-24 h-24 text-blue-400" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Operations Brief</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  System actively monitoring {products.length} inventory SKUs, {orders.length} orders, and {activeExceptions.length} active operational exceptions.
                </p>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Active AI Recommendations ({activeExceptions.length})</span>
                <span className="text-[10px] text-slate-500">Auto-calculated</span>
              </h4>

              {activeExceptions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h5 className="text-sm font-semibold text-slate-200">All Operations Optimal</h5>
                  <p className="text-xs text-slate-400 mt-1">No active stock conflicts or picking bottlenecks detected.</p>
                </div>
              ) : (
                activeExceptions.map(ex => (
                  <div key={ex.id} className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-3 glass-card-hover">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <h5 className="text-xs font-bold text-slate-100">{ex.title}</h5>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-semibold rounded border border-rose-500/30 shrink-0">
                        {ex.severity}
                      </span>
                    </div>

                    {/* Situation */}
                    <div className="text-xs space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-semibold text-amber-400 block text-[11px] uppercase tracking-wider">Situation</span>
                      <p className="text-slate-300">{ex.problem}</p>
                    </div>

                    {/* Analysis */}
                    <div className="text-xs space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-semibold text-blue-400 block text-[11px] uppercase tracking-wider">Analysis</span>
                      <p className="text-slate-300">{ex.systemAnalysis}</p>
                    </div>

                    {/* Recommendation */}
                    <div className="text-xs space-y-1 bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-lg">
                      <span className="font-semibold text-emerald-400 block text-[11px] uppercase tracking-wider">Recommended Decision</span>
                      <p className="text-slate-200 font-medium">{ex.recommendedDecision}</p>
                    </div>

                    {/* Impact */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Impact: <strong className="text-slate-200">{ex.impact}</strong></span>
                      {ex.potentialDelayText && (
                        <span className="text-rose-400 font-medium">{ex.potentialDelayText}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          if (ex.suggestedActionType === 'REALLOCATE' && ex.relatedOrderId) {
                            reallocateStock(ex.relatedOrderId, 'ORD-1048', 'PRD-102', 3);
                          } else {
                            resolveException(ex.id, `Approved AI recommendation: ${ex.recommendedDecision}`);
                          }
                          showToast('Recommendation Approved', `Executed AI decision for ${ex.id}`, 'success');
                        }}
                        className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Recommendation</span>
                      </button>

                      <button
                        onClick={() => {
                          setActivePage('exceptions');
                          toggleAssistant(false);
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
            <span>SmartFlow Engine v2.4</span>
            <button 
              onClick={() => toggleAssistant(false)}
              className="text-blue-400 hover:underline font-medium"
            >
              Close Assistant
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
