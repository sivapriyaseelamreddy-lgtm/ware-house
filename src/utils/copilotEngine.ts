import type { Product, Order, PickTask, ExceptionItem, AICopilotMessage } from '../types/warehouse';
import { detectWarehouseBottleneck, calculateReorderRecommendation } from './decisionEngine';

export function processCopilotQuery(
  query: string,
  products: Product[],
  orders: Order[],
  pickTasks: PickTask[],
  exceptions: ExceptionItem[]
): AICopilotMessage {
  const q = query.toLowerCase();

  // 1. Reallocate / Conflict Intent
  if (q.includes('reallocate') || q.includes('conflict') || q.includes('shortage')) {
    const conflicts = exceptions.filter(e => e.category === 'INVENTORY_SHORTAGE' && !e.resolved);
    if (conflicts.length > 0) {
      return {
        id: Date.now().toString(),
        sender: 'ai',
        text: `🚨 **Stock Conflict Detected**: Order **ORD-1045** requires 10 units of Wireless Industrial Scanner, but only 7 units are available. 5 units are currently reserved for lower-priority order **ORD-1048**.\n\nRecommended Action: Reallocate 3 reserved units to ORD-1045.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: 'Execute Stock Reallocation', actionType: 'EXECUTE_REALLOCATION', targetId: 'ORD-1045', page: 'allocation' },
          { label: 'Open Allocation Center', actionType: 'NAVIGATE', page: 'allocation' }
        ]
      };
    }
  }

  // 2. Delayed / Urgent / SLA Intent
  if (q.includes('delay') || q.includes('urgent') || q.includes('sla') || q.includes('ready')) {
    const urgentOrders = orders.filter(o => o.manualPriority === 'URGENT' && o.fulfillmentStage !== 'DISPATCHED');
    return {
      id: Date.now().toString(),
      sender: 'ai',
      text: `⚡ Found **${urgentOrders.length} Urgent Orders** in fulfillment pipeline:\n` +
        urgentOrders.map(o => `• **${o.id}** (${o.customerName}) — Priority Score: ${o.calculatedPriority.score}/100 [${o.fulfillmentStage}]`).join('\n') +
        `\n\nRecommendation: Dispatch carrier immediately for ready orders to prevent SLA breach.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Dispatch Urgent Order ORD-1053', actionType: 'DISPATCH_URGENT', targetId: 'ORD-1053', page: 'dispatch' },
        { label: 'Open Dispatch Tracking', actionType: 'NAVIGATE', page: 'dispatch' }
      ]
    };
  }

  // 3. Reorder / Out of Stock Intent
  if (q.includes('reorder') || q.includes('out of stock') || q.includes('low stock') || q.includes('po')) {
    const lowStock = products.filter(p => p.status === 'LOW_STOCK' || p.status === 'CRITICAL' || p.status === 'OUT_OF_STOCK');
    const firstLow = lowStock[0];
    const rec = firstLow ? calculateReorderRecommendation(firstLow) : null;

    return {
      id: Date.now().toString(),
      sender: 'ai',
      text: `📦 **Stock Replenishment Status**: **${lowStock.length} SKUs** currently below reorder levels.\n\n` +
        (rec ? `Top Recommendation: Reorder **${rec.recommendedQuantity} units** of **${rec.productName}**. Stock estimated to last ~${rec.daysRemaining} days.` : 'All product stock levels healthy.'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        rec ? { label: `Reorder ${rec.recommendedQuantity} Units of ${firstLow.id}`, actionType: 'EXECUTE_REORDER', targetId: firstLow.id, page: 'inventory' } : { label: 'Open Inventory', actionType: 'NAVIGATE', page: 'inventory' },
        { label: 'Open Inventory Management', actionType: 'NAVIGATE', page: 'inventory' }
      ]
    };
  }

  // 4. Bottleneck / Picking Intent
  if (q.includes('bottleneck') || q.includes('picking') || q.includes('zone') || q.includes('rahul')) {
    const bottleneck = detectWarehouseBottleneck(orders, pickTasks);
    return {
      id: Date.now().toString(),
      sender: 'ai',
      text: `📊 **Warehouse Bottleneck Analysis**: Current delay stage identified as **${bottleneck.bottleneckStage}**.\n\n` +
        `• **Analysis**: ${bottleneck.analysis}\n` +
        `• **AI Action**: ${bottleneck.recommendation}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Optimize Picking Routes', actionType: 'NAVIGATE', page: 'picking' },
        { label: 'Open Analytics', actionType: 'NAVIGATE', page: 'analytics' }
      ]
    };
  }

  // 5. Default General Operational Brief
  const activeCount = orders.filter(o => o.fulfillmentStage !== 'DISPATCHED').length;
  const excCount = exceptions.filter(e => !e.resolved).length;

  return {
    id: Date.now().toString(),
    sender: 'ai',
    text: `🤖 **SmartFlow Operational Executive Brief**:\n` +
      `• Active Orders: **${activeCount} orders** in fulfillment pipeline\n` +
      `• Total SKUs Monitored: **${products.length} products** across 6 zones\n` +
      `• Active Exceptions: **${excCount} alerts** requiring manager action\n` +
      `• Fulfillment SLA Rate: **94.8%** (Optimal)\n\n` +
      `How would you like me to assist you with order prioritization, stock reallocation, or picker routing?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      { label: 'View Operational Exceptions', actionType: 'NAVIGATE', page: 'exceptions' },
      { label: 'Check Order Prioritization', actionType: 'NAVIGATE', page: 'orders' }
    ]
  };
}
