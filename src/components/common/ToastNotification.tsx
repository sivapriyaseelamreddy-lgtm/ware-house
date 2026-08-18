import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { toast } = useWarehouse();
  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  const borderMap = {
    success: 'border-emerald-500/40 bg-emerald-950/80',
    warning: 'border-amber-500/40 bg-amber-950/80',
    error: 'border-rose-500/40 bg-rose-950/80',
    info: 'border-blue-500/40 bg-blue-950/80'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-once">
      <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${borderMap[toast.type]}`}>
        {iconMap[toast.type]}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};
