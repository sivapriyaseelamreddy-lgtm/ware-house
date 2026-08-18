import React from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  ShoppingCart, 
  Flame, 
  Boxes, 
  Truck, 
  TrendingUp, 
  Clock, 
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { detectWarehouseBottleneck } from '../utils/decisionEngine';

export const DashboardPage: React.FC = () => {
  const { products, orders, pickTasks, exceptions, resolveException, reallocateStock, setActivePage, showToast } = useWarehouse();

  // Metrics calculations
  const totalProducts = products.length;
  const totalAvailableStock = products.reduce((acc, p) => acc + p.availableStock, 0);
  const lowStockItems = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'CRITICAL').length;
  const outOfStockItems = products.filter(p => p.status === 'OUT_OF_STOCK').length;
  const activeOrders = orders.filter(o => o.fulfillmentStage !== 'DISPATCHED').length;
  const urgentOrders = orders.filter(o => o.manualPriority === 'URGENT' && o.fulfillmentStage !== 'DISPATCHED').length;
  const waitingPicking = pickTasks.filter(t => t.status === 'PENDING').length;
  const readyDispatch = orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK').length;
  const fulfillmentRate = 94.8; // %
  const avgProcessingTime = 42; // minutes

  // Active alerts
  const activeExceptions = exceptions.filter(e => !e.resolved);

  // Recharts Chart Data
  const orderStatusData = [
    { name: 'Created', value: orders.filter(o => o.fulfillmentStage === 'CREATED').length, color: '#3b82f6' },
    { name: 'Allocated', value: orders.filter(o => o.fulfillmentStage === 'ALLOCATED').length, color: '#8b5cf6' },
    { name: 'Picking', value: orders.filter(o => o.fulfillmentStage === 'PICKING').length, color: '#f59e0b' },
    { name: 'Packing', value: orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK').length, color: '#ec4899' },
    { name: 'Dispatched', value: orders.filter(o => o.fulfillmentStage === 'DISPATCHED').length, color: '#10b981' },
  ];

  const inventoryHealthData = [
    { name: 'Healthy', value: products.filter(p => p.status === 'HEALTHY').length, color: '#10b981' },
    { name: 'Low Stock', value: products.filter(p => p.status === 'LOW_STOCK').length, color: '#f59e0b' },
    { name: 'Critical', value: products.filter(p => p.status === 'CRITICAL').length, color: '#f97316' },
    { name: 'Out of Stock', value: products.filter(p => p.status === 'OUT_OF_STOCK').length, color: '#f43f5e' },
  ];

  const dailyFulfillmentData = [
    { day: 'Mon', created: 28, fulfilled: 26 },
    { day: 'Tue', created: 35, fulfilled: 32 },
    { day: 'Wed', created: 42, fulfilled: 40 },
    { day: 'Thu', created: 38, fulfilled: 35 },
    { day: 'Fri', created: 45, fulfilled: 43 },
    { day: 'Sat', created: 22, fulfilled: 21 },
    { day: 'Sun', created: 30, fulfilled: 29 },
  ];

  const priorityDistData = [
    { priority: 'URGENT', count: orders.filter(o => o.manualPriority === 'URGENT').length, fill: '#f43f5e' },
    { priority: 'HIGH', count: orders.filter(o => o.manualPriority === 'HIGH').length, fill: '#f59e0b' },
    { priority: 'NORMAL', count: orders.filter(o => o.manualPriority === 'NORMAL').length, fill: '#10b981' },
    { priority: 'LOW', count: orders.filter(o => o.manualPriority === 'LOW').length, fill: '#3b82f6' },
  ];

  const bottleneckInfo = detectWarehouseBottleneck(orders, pickTasks);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      
      {/* 10 KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Products</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{totalProducts}</p>
          <p className="text-[11px] text-slate-400 mt-1">25 SKUs active</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Available Stock</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{totalAvailableStock.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Units unreserved</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{lowStockItems}</p>
          <p className="text-[11px] text-slate-400 mt-1">Below reorder level</p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{outOfStockItems}</p>
          <p className="text-[11px] text-rose-400/80 mt-1 font-semibold">Requires PO</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Orders</span>
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{activeOrders}</p>
          <p className="text-[11px] text-slate-400 mt-1">In fulfillment pipeline</p>
        </div>

        {/* KPI 6 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Urgent Orders</span>
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{urgentOrders}</p>
          <p className="text-[11px] text-rose-300/80 mt-1 font-semibold">SLA SLA Risk</p>
        </div>

        {/* KPI 7 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Waiting Picking</span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-2">{waitingPicking}</p>
          <p className="text-[11px] text-slate-400 mt-1">Tasks in queue</p>
        </div>

        {/* KPI 8 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ready Dispatch</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{readyDispatch}</p>
          <p className="text-[11px] text-slate-400 mt-1">Carrier ready</p>
        </div>

        {/* KPI 9 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Fulfillment Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{fulfillmentRate}%</p>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-semibold">Above SLA Target</p>
        </div>

        {/* KPI 10 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 glass-card-hover">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg Proc Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{avgProcessingTime}m</p>
          <p className="text-[11px] text-slate-400 mt-1">Order to dispatch</p>
        </div>

      </div>

      {/* "ATTENTION REQUIRED" AI ALERTS SECTION */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <h3 className="text-base font-bold text-slate-100">🚨 Attention Required (AI Action Hub)</h3>
          </div>
          <button 
            onClick={() => setActivePage('exceptions')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            View Exception Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExceptions.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-slate-400 bg-slate-950/40 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              No active operational alerts! System running smoothly.
            </div>
          ) : (
            activeExceptions.map(ex => (
              <div key={ex.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 glass-card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {ex.severity === 'CRITICAL' ? '🔴' : '🟠'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{ex.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {ex.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Problem</span>
                    <p className="text-slate-200 line-clamp-2 mt-0.5">{ex.problem}</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Impact</span>
                    <p className="text-slate-200 line-clamp-2 mt-0.5">{ex.impact}</p>
                  </div>
                </div>

                <div className="bg-blue-950/40 p-2.5 rounded border border-blue-500/30 text-xs">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">AI Decision Recommendation</span>
                  <p className="text-slate-200 font-medium mt-0.5">{ex.recommendedDecision}</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (ex.suggestedActionType === 'REALLOCATE' && ex.relatedOrderId) {
                        reallocateStock(ex.relatedOrderId, 'ORD-1048', 'PRD-102', 3);
                      } else {
                        resolveException(ex.id, `Approved: ${ex.recommendedDecision}`);
                      }
                      showToast('Recommendation Approved', `Executed AI decision for ${ex.id}`, 'success');
                    }}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-md"
                  >
                    Approve Recommendation
                  </button>

                  <button
                    onClick={() => setActivePage('exceptions')}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Orders by Fulfillment Stage */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Orders by Stage</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inventory Health Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Inventory Health Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {inventoryHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            {inventoryHealthData.map(d => (
              <span key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* Chart 3: Order Priority Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Order Priority Queue</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityDistData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="priority" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {priorityDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Section: Warehouse Bottleneck & Daily Fulfillment Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bottleneck Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Warehouse Bottleneck Analysis
            </h3>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Stage: {bottleneckInfo.bottleneckStage}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <p className="text-slate-300"><strong className="text-amber-400">Analysis:</strong> {bottleneckInfo.analysis}</p>
            <p className="text-slate-300"><strong className="text-emerald-400">AI Action Recommendation:</strong> {bottleneckInfo.recommendation}</p>
          </div>

          <button 
            onClick={() => setActivePage('picking')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-lg border border-slate-700 transition"
          >
            Optimize Stage Workflows & Picker Dispatch →
          </button>
        </div>

        {/* Daily Orders vs Fulfilled */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Daily Orders vs Fulfilled</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyFulfillmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Area type="monotone" dataKey="fulfilled" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
