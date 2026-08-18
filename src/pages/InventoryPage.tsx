import React, { useState } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import type { Product } from '../types/warehouse';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Filter, ArrowUpDown, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { calculateReorderRecommendation } from '../utils/decisionEngine';

export const InventoryPage: React.FC = () => {
  const { products, reorderProduct, selectedZoneFilter, searchQuery, setSearchQuery } = useWarehouse();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter & Search Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesZone = selectedZoneFilter === 'ALL' || p.zone === selectedZoneFilter;
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesZone && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let valA = a[sortField] ?? '';
    let valB = b[sortField] ?? '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const lowStockProducts = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK');

  const toggleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* SMART INVENTORY REORDER RECOMMENDATIONS SECTION */}
      {lowStockProducts.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              🤖 AI Smart Stock Replenishment Recommendations ({lowStockProducts.length} items requiring reorder)
            </h3>
            <span className="text-xs text-slate-400">Formula: (Avg Daily Demand × 7) - Available Stock</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 3).map(prod => {
              const rec = calculateReorderRecommendation(prod);
              return (
                <div key={prod.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 glass-card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{prod.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{prod.sku} • {prod.zone} ({prod.shelf})</p>
                    </div>
                    <StatusBadge status={prod.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Available</span>
                      <span className="font-bold text-rose-400">{prod.availableStock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Reorder Level</span>
                      <span className="font-bold text-slate-300">{prod.reorderLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Daily Usage</span>
                      <span className="font-bold text-blue-400">{prod.avgDailyDemand} u/d</span>
                    </div>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-lg text-xs space-y-1">
                    <span className="text-amber-400 font-semibold block text-[11px]">Recommended Action</span>
                    <p className="text-slate-200">
                      <strong>Reorder {rec.recommendedQuantity} units.</strong> Current stock estimated to last approximately <span className="text-rose-400 font-bold">{rec.daysRemaining} days</span>.
                    </p>
                  </div>

                  <button
                    onClick={() => reorderProduct(prod.id, rec.recommendedQuantity)}
                    className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Approve Reorder ({rec.recommendedQuantity} Units - ${rec.estimatedCost})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER & CONTROL BAR */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Industrial">Industrial</option>
              <option value="Apparel">Apparel</option>
              <option value="Consumables">Consumables</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="CRITICAL">Critical</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredProducts.length} of {products.length} Products
        </div>
      </div>

      {/* PRODUCTS DATA TABLE */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-1">
                    ID / SKU <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    Product Name <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Zone / Shelf</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200 text-right" onClick={() => toggleSort('totalStock')}>
                  <div className="flex items-center justify-end gap-1">
                    Total <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4 text-right">Reserved</th>
                <th className="py-3.5 px-4 text-right">Damaged</th>
                <th className="py-3.5 px-4 text-right">Reorder Lvl</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono text-slate-400 font-semibold">
                    {p.id}
                    <div className="text-[10px] text-slate-500 font-normal">{p.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-100 max-w-xs">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0" 
                        />
                      )}
                      <span className="truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {p.zone}
                    <span className="text-slate-500 ml-1">({p.shelf})</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">{p.totalStock}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{p.availableStock}</td>
                  <td className="py-3 px-4 text-right text-amber-400 font-semibold">{p.reservedStock}</td>
                  <td className="py-3 px-4 text-right text-rose-400 font-semibold">{p.damagedStock}</td>
                  <td className="py-3 px-4 text-right text-slate-400">{p.reorderLevel}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-semibold rounded border border-slate-700 transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {selectedProduct.imageUrl && (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0" 
                  />
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedProduct.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{selectedProduct.id} • {selectedProduct.sku}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Category</span>
                <span className="font-semibold text-slate-200">{selectedProduct.category}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-200">{selectedProduct.zone} ({selectedProduct.shelf})</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Unit Price</span>
                <span className="font-semibold text-emerald-400">${selectedProduct.unitPrice}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Avg Daily Usage</span>
                <span className="font-semibold text-blue-400">{selectedProduct.avgDailyDemand} units/day</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">Stock Breakdown</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total In Warehouse:</span>
                <span className="font-bold text-slate-100">{selectedProduct.totalStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Available (Unreserved):</span>
                <span className="font-bold text-emerald-400">{selectedProduct.availableStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reserved for Orders:</span>
                <span className="font-bold text-amber-400">{selectedProduct.reservedStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Damaged Stock:</span>
                <span className="font-bold text-rose-400">{selectedProduct.damagedStock}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
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
