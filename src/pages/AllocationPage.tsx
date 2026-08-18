import React from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { GitMerge, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AllocationPage: React.FC = () => {
  const { orders, products, allocateOrder, reallocateStock, showToast } = useWarehouse();

  const unallocatedOrders = orders.filter(o => o.allocationStatus !== 'FULLY_ALLOCATED' && o.fulfillmentStage !== 'DISPATCHED');
  const conflictOrders = orders.filter(o => o.allocationStatus === 'CONFLICT' || o.allocationStatus === 'PARTIALLY_ALLOCATED');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* Smart Engine Header Info Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-900 border border-blue-500/30 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GitMerge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">🤖 Smart Inventory Allocation Engine</h3>
            <p className="text-xs text-slate-300">Automated multi-order stock matching & priority conflict resolution</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold block text-[11px] uppercase">Case 1: Sufficient Stock</span>
            <p className="text-slate-300 mt-1">Available $\ge$ Requested $\rightarrow$ Immediate 100% reservation & pick queueing.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold block text-[11px] uppercase">Case 2: Partial Stock & Conflict</span>
            <p className="text-slate-300 mt-1">Allocate available stock immediately, analyze lower-priority order reservations for reallocation.</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-rose-400 font-bold block text-[11px] uppercase">Case 3: Stock Exhaustion</span>
            <p className="text-slate-300 mt-1">No stock $\rightarrow$ Recommend backorder, supplier PO, or simulated inter-warehouse transfer.</p>
          </div>
        </div>
      </div>

      {/* ACTIVE CONFLICT RESOLUTION BOARD */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Active Stock Allocation Conflicts & AI Resolutions ({conflictOrders.length})
        </h3>

        {conflictOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No active allocation conflicts. All order stock matching is balanced.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {conflictOrders.map(order => (
              <div key={order.id} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl glass-card-hover">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      Order {order.id}
                      <PriorityBadge level={order.manualPriority} />
                    </h4>
                    <p className="text-xs text-slate-400">{order.customerName} ({order.customerType} Customer)</p>
                  </div>
                  <StatusBadge status={order.allocationStatus} />
                </div>

                {/* Items Stock Status */}
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-300 block">Required Inventory Status</span>
                  {order.items.map(item => {
                    const prod = products.find(p => p.id === item.productId);
                    const img = item.imageUrl || prod?.imageUrl;
                    const isShortage = (prod?.availableStock || 0) < (item.quantityRequested - item.quantityAllocated);

                    return (
                      <div key={item.productId} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {img && (
                            <img 
                              src={img} 
                              alt={item.productName} 
                              className="w-9 h-9 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0" 
                            />
                          )}
                          <div>
                            <div className="font-bold text-slate-200">{item.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">SKU: {item.productId} • Shelf: {prod?.shelf}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-200">Requested: {item.quantityRequested} | Alloc: {item.quantityAllocated}</div>
                          <div className={`text-[11px] font-semibold ${isShortage ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isShortage ? `Shortage: ${item.quantityRequested - item.quantityAllocated} units` : 'Stock Available'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* System Decision Recommendation Box */}
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-[11px] uppercase tracking-wider">
                    🤖 AI Decision & Recommended Resolution
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    Allocate available stock immediately. Reallocate 3 reserved units from lower-priority order <strong>ORD-1048</strong> to cover shortage.
                  </p>
                </div>

                {/* Decision Buttons (Approve Reallocation, Keep Existing, Split Fulfillment) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      reallocateStock(order.id, 'ORD-1048', 'PRD-102', 3);
                    }}
                    className="py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg transition shadow flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Reallocation</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Allocation Preserved', `Existing allocation maintained for Order ${order.id}.`, 'info');
                    }}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                  >
                    Keep Existing
                  </button>

                  <button
                    onClick={() => {
                      showToast('Split Shipment Initiated', `Order ${order.id} marked for partial split fulfillment.`, 'warning');
                    }}
                    className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                  >
                    Split Fulfillment
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALL UNALLOCATED ORDERS QUEUE */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Unallocated Order Queue ({unallocatedOrders.length})</h3>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Allocation Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unallocatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{order.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{order.customerName}</td>
                  <td className="py-3 px-4 text-center"><PriorityBadge level={order.manualPriority} /></td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={order.allocationStatus} /></td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => allocateOrder(order.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded transition"
                    >
                      Run Allocation Check
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
