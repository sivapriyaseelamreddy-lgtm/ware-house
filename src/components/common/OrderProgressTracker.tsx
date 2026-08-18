import React from 'react';
import type { OrderFulfillmentStage } from '../../types/warehouse';
import { Check } from 'lucide-react';

interface OrderProgressTrackerProps {
  currentStage: OrderFulfillmentStage;
}

const STAGES: { id: OrderFulfillmentStage; label: string }[] = [
  { id: 'CREATED', label: 'Created' },
  { id: 'PRIORITY_ASSIGNED', label: 'Priority Assigned' },
  { id: 'INVENTORY_CHECKED', label: 'Inventory Checked' },
  { id: 'ALLOCATED', label: 'Allocated' },
  { id: 'PICKING', label: 'Picking' },
  { id: 'PACKING', label: 'Packing' },
  { id: 'QUALITY_CHECK', label: 'Quality Check' },
  { id: 'DISPATCHED', label: 'Dispatched' }
];

export const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ currentStage }) => {
  const currentIdx = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[720px] relative">
        {/* Background connector line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />

        {/* Active progress connector line */}
        <div 
          className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 -z-0"
          style={{ width: `${Math.max(0, (currentIdx / (STAGES.length - 1)) * 100)}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 group">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' 
                    : isCurrent 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
