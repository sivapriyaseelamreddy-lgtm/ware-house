import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let styleClasses = 'bg-slate-700/50 text-slate-300 border-slate-600';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'HEALTHY':
    case 'FULLY_ALLOCATED':
    case 'PASSED':
    case 'COMPLETED':
    case 'DELIVERED':
      styleClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      break;

    case 'LOW_STOCK':
    case 'PARTIALLY_ALLOCATED':
    case 'IN_PROGRESS':
    case 'IN_TRANSIT':
    case 'PACKING':
    case 'QUALITY_CHECK':
      styleClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      break;

    case 'CRITICAL':
    case 'OUT_OF_STOCK':
    case 'CONFLICT':
    case 'BLOCKED':
    case 'FAILED_WRONG_ITEM':
    case 'FAILED_MISSING_ITEM':
    case 'FAILED_DAMAGED_ITEM':
    case 'FAILED_QTY_MISMATCH':
    case 'EXCEPTION_FLAGGED':
      styleClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      break;

    case 'BACKORDERED':
    case 'UNALLOCATED':
    case 'CREATED':
    case 'PENDING':
    case 'READY_FOR_DISPATCH':
      styleClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${styleClasses}`}>
      {label}
    </span>
  );
};
