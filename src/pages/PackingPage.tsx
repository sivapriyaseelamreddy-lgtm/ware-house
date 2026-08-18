import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import type { Order, QCStatus } from '../types/warehouse';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderProgressTracker } from '../components/common/OrderProgressTracker';
import { CheckSquare, AlertTriangle, ShieldCheck, X, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const PackingPage: React.FC = () => {
  const { orders, products, reportQualityCheckIssue, dispatchOrder } = useWarehouse();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [defectNotes, setDefectNotes] = useState<string>('');

  const packingOrders = orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK');

  const handleDefectSubmit = (orderId: string, productId: string, issueType: QCStatus) => {
    reportQualityCheckIssue(orderId, productId, issueType, defectNotes);
    setSelectedOrder(null);
    setDefectNotes('');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* Header Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Packing & Quality Control Station</h3>
            <p className="text-xs text-slate-300">Order verification flow: Picked $\rightarrow$ Packing $\rightarrow$ QC Inspection $\rightarrow$ Ready for Dispatch</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold font-mono">
          {packingOrders.length} Orders Pending Inspection
        </span>
      </div>

      {/* PACKING STATIONS GRID */}
      {packingOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-200">Packing Queue Clean</h4>
          <p className="text-xs text-slate-400 mt-1">All picked items have passed quality verification and moved to Dispatch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packingOrders.map(order => (
            <div key={order.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl glass-card-hover">
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Order {order.id}
                    <PriorityBadge level={order.manualPriority} />
                  </h4>
                  <p className="text-xs text-slate-400">{order.customerName} • Picker: {order.assignedPicker || 'Assigned'}</p>
                </div>
                <StatusBadge status={order.fulfillmentStage} />
              </div>

              {/* Progress Pipeline */}
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 scale-95 origin-left">
                <OrderProgressTracker currentStage={order.fulfillmentStage} />
              </div>

              {/* Picked Items List to Verify */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block">Picked Item Verification</span>
                <div className="divide-y divide-slate-800 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                  {order.items.map(item => {
                    const prod = products.find(p => p.id === item.productId);
                    const img = item.imageUrl || prod?.imageUrl;

                    return (
                      <div key={item.productId} className="p-3 flex items-center justify-between">
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
                            <div className="text-[10px] font-mono text-slate-400">SKU: {item.productId}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-200">Qty: {item.quantityRequested}</span>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Report Defect</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QC Pass & Dispatch Action */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => dispatchOrder(order.id, 'FedEx Express Freight')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>QC Passed — Move to Ready for Dispatch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT QC DEFECT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                Report Quality Check Exception
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <p>Select defect category reported for <strong>Order {selectedOrder.id}</strong>:</p>

              <div className="space-y-2">
                {[
                  { id: 'FAILED_DAMAGED_ITEM', label: 'Damaged Item Detected', desc: 'Item broken/damaged during transport' },
                  { id: 'FAILED_MISSING_ITEM', label: 'Missing Item in Bin', desc: 'Picked count lower than order requirement' },
                  { id: 'FAILED_WRONG_ITEM', label: 'Wrong Item Picked', desc: 'SKU mismatch in pick bin' },
                  { id: 'FAILED_QTY_MISMATCH', label: 'Quantity Mismatch', desc: 'Count higher/lower than manifest' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleDefectSubmit(selectedOrder.id, selectedOrder.items[0]?.productId || '', type.id as QCStatus)}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition group"
                  >
                    <div className="font-bold text-slate-100 group-hover:text-rose-400">{type.label}</div>
                    <div className="text-[10px] text-slate-400">{type.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inspector Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="e.g. Ruptured outer cardboard during conveyor scan..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
