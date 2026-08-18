import React from 'react';
import type { PriorityLevel } from '../../types/warehouse';

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
  showScore?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ level, score, showScore = false }) => {
  let styleClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  let dotClass = 'bg-blue-400';

  if (level === 'URGENT') {
    styleClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 badge-urgent-pulse';
    dotClass = 'bg-rose-400 animate-ping';
  } else if (level === 'HIGH') {
    styleClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    dotClass = 'bg-amber-400';
  } else if (level === 'NORMAL') {
    styleClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    dotClass = 'bg-emerald-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styleClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {level}
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono ml-0.5">({score})</span>
      )}
    </span>
  );
};
