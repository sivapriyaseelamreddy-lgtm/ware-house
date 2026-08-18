import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import type { Order, PriorityLevel, CustomerType } from '../types/warehouse';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderProgressTracker } from '../components/common/OrderProgressTracker';
import { Search, Plus, Eye, Play, Sparkles, X } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, products, createOrder, updateOrderPriority, allocateOrder, searchQuery, setSearchQuery } = useWarehouse();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Order Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerType, setCustomerType] = useState<CustomerType>('ENTERPRISE');
  const [hoursToDeadline, setHoursToDeadline] = useState<number>(6);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(5);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.fulfillmentStage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedProductId) return;

    const targetProd = products.find(p => p.id === selectedProductId);
    if (!targetProd) return;

    const now = new Date();
    const deadline = new Date(now.getTime() + hoursToDeadline * 60 * 60 * 1000);

    createOrder({
      customerName,
      customerType,
      orderDate: now.toISOString(),
      deliveryDeadline: deadline.toISOString(),
      manualPriority: 'NORMAL',
      items: [
        {
          productId: targetProd.id,
          productName: targetProd.name,
          quantityRequested: itemQuantity,
          quantityAllocated: 0,
          quantityPicked: 0,
          unitPrice: targetProd.unitPrice
        }
      ],
      totalValue: targetProd.unitPrice * itemQuantity
    });

    setIsCreateModalOpen(false);
    setCustomerName('');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* ACTION BAR */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* ORDERS DATA TABLE */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-center">Allocation</th>
                <th className="py-3.5 px-4 text-center">Fulfillment Stage</th>
                <th className="py-3.5 px-4 text-right">Value</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    {order.id}
                    <div className="text-[10px] text-slate-500 font-normal">
                      {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{order.customerName}</div>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {order.customerType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 text-sm">{order.calculatedPriority.score}</span>
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden w-20">
                        <div 
                          className={`h-full rounded-full ${
                            order.calculatedPriority.score >= 90 ? 'bg-rose-500' :
                            order.calculatedPriority.score >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${order.calculatedPriority.score}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5" title={order.calculatedPriority.explanation}>
                      {order.calculatedPriority.explanation}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <PriorityBadge level={order.manualPriority} />
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {order.items.reduce((acc, i) => acc + i.quantityRequested, 0)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={order.allocationStatus} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={order.fulfillmentStage} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400">
                    ${order.totalValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        title="View Full Order Details & Tracker"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {order.allocationStatus !== 'FULLY_ALLOCATED' && order.fulfillmentStage !== 'DISPATCHED' && (
                        <button
                          onClick={() => allocateOrder(order.id)}
                          title="Run Smart Allocation Check"
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow transition"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Create New Warehouse Order
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Logistics Global"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Customer Tier</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as CustomerType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="VIP">VIP (Highest Priority)</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="STANDARD">Standard</option>
                    <option value="REGULAR">Regular</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Delivery Deadline (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={hoursToDeadline}
                    onChange={(e) => setHoursToDeadline(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Select Product SKU</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Avail: {p.availableStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-[11px] text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 inline mr-1" />
                Smart Flow AI engine will automatically compute Priority Score and check inventory allocation upon submission.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Create & Run Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & PROGRESS TRACKER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Order {selectedOrder.id}
                  <PriorityBadge level={selectedOrder.manualPriority} />
                </h3>
                <p className="text-xs text-slate-400">{selectedOrder.customerName} ({selectedOrder.customerType} Client)</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Tracker */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Live Fulfillment Pipeline Tracker</span>
              <OrderProgressTracker currentStage={selectedOrder.fulfillmentStage} />
            </div>

            {/* Priority Score Explanation */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-blue-400 uppercase tracking-wider text-[11px] block">AI Priority Score Analysis</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold text-sm">Priority Score: {selectedOrder.calculatedPriority.score} / 100</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">{selectedOrder.calculatedPriority.level}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedOrder.calculatedPriority.explanation}</p>
            </div>

            {/* Order Items List */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Requested Items</span>
              <div className="divide-y divide-slate-800 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                {selectedOrder.items.map(item => {
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
                          <div className="text-[10px] text-slate-500">ID: {item.productId} • ${item.unitPrice} / unit</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-100 block">Req: {item.quantityRequested} | Alloc: {item.quantityAllocated}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">${(item.quantityRequested * item.unitPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Change Priority Quick Actions */}
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Override Priority Level:</span>
              <div className="flex gap-2">
                {(['URGENT', 'HIGH', 'NORMAL', 'LOW'] as PriorityLevel[]).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      updateOrderPriority(selectedOrder.id, p);
                      setSelectedOrder({ ...selectedOrder, manualPriority: p });
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                      selectedOrder.manualPriority === p 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
