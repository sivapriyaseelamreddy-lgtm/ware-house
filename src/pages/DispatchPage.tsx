import React from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Truck, Clock, Search, ShieldAlert } from 'lucide-react';

const CARRIERS = ['FedEx Express Freight', 'DHL Supply Chain', 'UPS Logistics Ground', 'BlueDart Air Cargo'];

export const DispatchPage: React.FC = () => {
  const { dispatchRecords, orders, dispatchOrder, searchQuery, setSearchQuery } = useWarehouse();

  const readyForDispatchOrders = orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK');
  const delayedUrgentOrders = dispatchRecords.filter(d => d.priority === 'URGENT' && d.slaBreachRisk && d.status === 'READY_FOR_DISPATCH');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* SLA BREACH WARNING BANNER */}
      {delayedUrgentOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-100">🚨 SLA Breach Warning: Delayed Urgent Order Ready</h4>
              <p className="text-xs text-slate-300">
                Urgent Order <strong>{delayedUrgentOrders[0].orderId}</strong> is packed but has not been dispatched for <strong>{delayedUrgentOrders[0].minutesInReadyState} minutes</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatchOrder(delayedUrgentOrders[0].orderId, 'FedEx Express Freight')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Dispatch Priority Carrier Immediately
          </button>
        </div>
      )}

      {/* DISPATCH CONTROL & SEARCH BAR */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing {dispatchRecords.length} Active Dispatch Records
        </div>
      </div>

      {/* READY FOR DISPATCH QUEUE */}
      {readyForDispatchOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Orders Ready for Carrier Pickup ({readyForDispatchOrders.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyForDispatchOrders.map(order => (
              <div key={order.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 glass-card-hover">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{order.id}</span>
                  <PriorityBadge level={order.manualPriority} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{order.customerName}</h4>
                  <p className="text-[11px] text-slate-400">{order.items.length} items packed • Target Dispatch: {order.estimatedDispatchTime || 'ASAP'}</p>
                </div>
                <div className="flex gap-2">
                  {CARRIERS.slice(0, 2).map(carrier => (
                    <button
                      key={carrier}
                      onClick={() => dispatchOrder(order.id, carrier)}
                      className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded transition shadow flex items-center justify-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch {carrier.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPATCH RECORDS TABLE */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4">Carrier</th>
                <th className="py-3.5 px-4">Tracking #</th>
                <th className="py-3.5 px-4 text-center">Dispatch Status</th>
                <th className="py-3.5 px-4 text-right">Est. Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dispatchRecords.map(record => (
                <tr key={record.orderId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{record.orderId}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{record.customerName}</td>
                  <td className="py-3.5 px-4 text-center"><PriorityBadge level={record.priority} /></td>
                  <td className="py-3.5 px-4 text-slate-300">{record.carrier}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{record.trackingNumber}</td>
                  <td className="py-3.5 px-4 text-center"><StatusBadge status={record.status} /></td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                    {new Date(record.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
