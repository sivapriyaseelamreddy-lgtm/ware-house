import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { Sliders, RotateCcw, Save, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetData, showToast } = useWarehouse();

  // Weights state
  const [urgencyWeight, setUrgencyWeight] = useState<number>(35);
  const [customerWeight, setCustomerWeight] = useState<number>(20);
  const [ageWeight, setAgeWeight] = useState<number>(15);
  const [valueWeight, setValueWeight] = useState<number>(10);
  const [stockWeight, setStockWeight] = useState<number>(20);

  const [targetDaysCoverage, setTargetDaysCoverage] = useState<number>(7);

  const totalWeight = urgencyWeight + customerWeight + ageWeight + valueWeight + stockWeight;

  const handleSave = () => {
    showToast('Engine Settings Saved', 'Smart Priority Engine weights and reorder coverage parameters updated.', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl animate-fade-in">
      
      {/* PRIORITY ENGINE WEIGHT CONFIGURATION */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Smart Priority Formula Weights</h3>
              <p className="text-xs text-slate-400">Calculates order priority score (0-100). Total must equal 100%.</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            Total: {totalWeight}%
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Delivery Urgency Weight ({urgencyWeight}%)</span>
              <span className="text-slate-400">Deadline proximity SLA</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              value={urgencyWeight}
              onChange={(e) => setUrgencyWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Customer Importance Weight ({customerWeight}%)</span>
              <span className="text-slate-400">VIP / Enterprise tier</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              value={customerWeight}
              onChange={(e) => setCustomerWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Order Age Weight ({ageWeight}%)</span>
              <span className="text-slate-400">Queue waiting time</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={ageWeight}
              onChange={(e) => setAgeWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Order Value Weight ({valueWeight}%)</span>
              <span className="text-slate-400">Monetary size</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={valueWeight}
              onChange={(e) => setValueWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-300 mb-1">
              <span>Stock Availability Weight ({stockWeight}%)</span>
              <span className="text-slate-400">Inventory allocation ready</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={stockWeight}
              onChange={(e) => setStockWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Formula Config</span>
          </button>
        </div>
      </div>

      {/* REORDER ENGINE COVERAGE PARAMETERS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-slate-100">Smart Reorder Recommendation Formula</h3>
            <p className="text-xs text-slate-400">Target Inventory Days Coverage multiplier</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Target Days Coverage</label>
            <input
              type="number"
              min={3}
              max={30}
              value={targetDaysCoverage}
              onChange={(e) => setTargetDaysCoverage(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center">
            Reorder Formula = (Avg Daily Demand × {targetDaysCoverage} days) - Available Stock
          </div>
        </div>
      </div>

      {/* BENCHMARK RESET & SIMULATION CONTROLS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">Operational Controls & Data Benchmarks</h3>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-200">Reset System Mock Data</div>
            <div className="text-slate-400">Restores all 25 products, 30 orders, pick tasks, exceptions, and dispatch records.</div>
          </div>
          <button
            onClick={resetData}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

    </div>
  );
};
