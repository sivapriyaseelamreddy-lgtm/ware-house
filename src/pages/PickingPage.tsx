import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import type { PickTaskStatus } from '../types/warehouse';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { UserCheck, Clock, Navigation, CheckCircle2, MapPin } from 'lucide-react';
import { optimizePickingSequence } from '../utils/decisionEngine';

const PICKERS = ['Rahul Sharma', 'Alex Mercer', 'Maria Garcia', 'Chen Wei'];

export const PickingPage: React.FC = () => {
  const { pickTasks, products, assignPickTask, completePickTask } = useWarehouse();
  const [selectedPicker, setSelectedPicker] = useState<string>('Rahul Sharma');
  const [pickerZone, setPickerZone] = useState<string>('Zone A');

  // Kanban Columns
  const columns: { id: PickTaskStatus; title: string; color: string }[] = [
    { id: 'PENDING', title: 'Pending', color: 'border-blue-500/40 text-blue-400' },
    { id: 'ASSIGNED', title: 'Assigned', color: 'border-indigo-500/40 text-indigo-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-amber-500/40 text-amber-400' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'BLOCKED', title: 'Blocked', color: 'border-rose-500/40 text-rose-400' },
  ];

  // Optimization calculation
  const pendingTasks = pickTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const optimizedSequence = optimizePickingSequence(pickerZone, pendingTasks);

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* SMART PICKING ROUTE OPTIMIZATION BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                🤖 AI Smart Picking Route Optimizer
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] rounded border border-blue-500/30">Active</span>
              </h3>
              <p className="text-xs text-slate-300">Minimizes picker travel time by grouping Zone proximity & Urgency</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Picker:</span>
              <select
                value={selectedPicker}
                onChange={(e) => setSelectedPicker(e.target.value)}
                className="bg-transparent border-none text-slate-200 font-bold focus:outline-none"
              >
                {PICKERS.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Current Zone:</span>
              <select
                value={pickerZone}
                onChange={(e) => setPickerZone(e.target.value)}
                className="bg-transparent border-none text-slate-200 font-bold focus:outline-none"
              >
                <option value="Zone A" className="bg-slate-900">Zone A</option>
                <option value="Zone B" className="bg-slate-900">Zone B</option>
                <option value="Zone C" className="bg-slate-900">Zone C</option>
                <option value="Zone D" className="bg-slate-900">Zone D</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Recommendation Alert */}
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
          <p className="text-slate-300 leading-relaxed">
            💡 <strong>Smart AI Recommendation:</strong> Picker <strong>{selectedPicker}</strong> is currently positioned in <strong>{pickerZone}</strong>. The system has calculated an optimized 3-step sequence prioritizing same-zone pick items with urgent order SLAs.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Recommended Sequence:</span>
            {optimizedSequence.slice(0, 4).map((task, idx) => (
              <span key={task.id} className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1">
                <span className="text-blue-400 font-bold">{idx + 1}.</span> {task.orderId} ({task.zone} / {task.shelf})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map(col => {
          const colTasks = pickTasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className={`flex items-center justify-between border-b pb-2.5 ${col.color}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider">{col.title}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.map(task => {
                  const prod = products.find(p => p.id === task.productId);
                  const img = task.imageUrl || prod?.imageUrl;

                  return (
                    <div key={task.id} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5 glass-card-hover">
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">{task.orderId}</span>
                        <PriorityBadge level={task.priorityLevel} />
                      </div>

                      <div className="flex items-center gap-2.5">
                        {img && (
                          <img 
                            src={img} 
                            alt={task.productName} 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0" 
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-bold text-slate-100">{task.productName}</h5>
                          <p className="text-[11px] text-slate-400 font-mono">Qty: {task.quantity} units</p>
                        </div>
                      </div>

                    <div className="flex items-center justify-between text-[11px] bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="flex items-center gap-1 text-slate-300 font-mono">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {task.zone} ({task.shelf})
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {task.estimatedTimeMinutes}m
                      </span>
                    </div>

                    {task.assignedPicker ? (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        Picker: <strong className="text-slate-200">{task.assignedPicker}</strong>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-400 font-semibold">Unassigned</div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-1 flex gap-1.5">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => assignPickTask(task.id, selectedPicker)}
                          className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded transition shadow"
                        >
                          Assign {selectedPicker.split(' ')[0]}
                        </button>
                      )}

                      {(task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => completePickTask(task.id)}
                          className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] rounded transition shadow flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Picked</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
