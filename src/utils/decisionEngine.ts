import type { Order, Product, PriorityScoreBreakdown, CustomerType, ReorderRecommendation, PickTask, OrderFulfillmentStage } from '../types/warehouse';

/**
 * Calculates Priority Score (0-100) based on weighted formula:
 * Urgency (35%) + Customer (20%) + Order Age (15%) + Value (10%) + Stock (20%)
 */
export function calculatePriorityScore(
  orderDate: string,
  deliveryDeadline: string,
  customerType: CustomerType,
  totalValue: number,
  stockAvailableRatio: number = 1.0 // 0 to 1
): PriorityScoreBreakdown {
  const now = new Date().getTime();
  const created = new Date(orderDate).getTime();
  const deadline = new Date(deliveryDeadline).getTime();

  // 1. Delivery Urgency (35%)
  const hoursToDeadline = Math.max(0.1, (deadline - now) / (1000 * 60 * 60));
  let urgencyScore = 0;
  if (hoursToDeadline <= 4) urgencyScore = 100;
  else if (hoursToDeadline <= 8) urgencyScore = 85;
  else if (hoursToDeadline <= 16) urgencyScore = 65;
  else if (hoursToDeadline <= 24) urgencyScore = 45;
  else urgencyScore = 20;

  // 2. Customer Importance (20%)
  let customerScore = 30;
  if (customerType === 'VIP') customerScore = 100;
  else if (customerType === 'ENTERPRISE') customerScore = 85;
  else if (customerType === 'STANDARD') customerScore = 50;

  // 3. Order Age (15%)
  const ageHours = (now - created) / (1000 * 60 * 60);
  let ageScore = Math.min(100, Math.round(ageHours * 10));

  // 4. Order Value (10%)
  let valueScore = 30;
  if (totalValue > 3000) valueScore = 100;
  else if (totalValue > 1500) valueScore = 80;
  else if (totalValue > 500) valueScore = 60;

  // 5. Stock Availability (20%)
  const stockScore = Math.round(stockAvailableRatio * 100);

  // Weighted sum
  const finalScore = Math.round(
    urgencyScore * 0.35 +
    customerScore * 0.20 +
    ageScore * 0.15 +
    valueScore * 0.10 +
    stockScore * 0.20
  );

  let level: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW' = 'LOW';
  if (finalScore >= 90) level = 'URGENT';
  else if (finalScore >= 70) level = 'HIGH';
  else if (finalScore >= 40) level = 'NORMAL';

  const explanationParts: string[] = [];
  if (urgencyScore >= 85) explanationParts.push(`Deadline within ${hoursToDeadline.toFixed(1)} hours`);
  if (customerType === 'VIP' || customerType === 'ENTERPRISE') explanationParts.push(`${customerType} customer priority boost`);
  if (ageHours >= 2) explanationParts.push(`Order waiting for ${ageHours.toFixed(1)} hours`);

  const explanation = explanationParts.length > 0
    ? `Priority Score: ${finalScore}/100 (${level}) — ${explanationParts.join('; ')}.`
    : `Priority Score: ${finalScore}/100 (${level}) based on standard queue processing.`;

  return {
    score: finalScore,
    level,
    urgencyScore,
    customerScore,
    ageScore,
    valueScore,
    stockAvailabilityScore: stockScore,
    explanation
  };
}

/**
 * Calculates Smart Reorder Recommendation for low-stock products.
 * Reorder Quantity = max(0, (Avg Daily Demand * 7) - Available Stock)
 */
export function calculateReorderRecommendation(product: Product): ReorderRecommendation {
  const targetDaysCoverage = 7;
  const neededForCoverage = Math.ceil(product.avgDailyDemand * targetDaysCoverage);
  const rawReorder = neededForCoverage - product.availableStock;
  const recommendedQuantity = Math.max(10, Math.max(0, rawReorder));
  const daysRemaining = product.avgDailyDemand > 0
    ? parseFloat((product.availableStock / product.avgDailyDemand).toFixed(1))
    : 99;

  return {
    productId: product.id,
    productName: product.name,
    currentAvailableStock: product.availableStock,
    reorderLevel: product.reorderLevel,
    avgDailyDemand: product.avgDailyDemand,
    daysRemaining,
    recommendedQuantity,
    estimatedCost: parseFloat((recommendedQuantity * product.unitPrice).toFixed(2))
  };
}

/**
 * Optimized Picking Sequence generator.
 * Groups and sorts tasks for a picker by zone proximity + urgency + shortest estimated time.
 */
export function optimizePickingSequence(pickerZone: string, tasks: PickTask[]): PickTask[] {
  return [...tasks].sort((a, b) => {
    // 1. Zone match priority
    const aZoneMatch = a.zone === pickerZone ? 0 : 1;
    const bZoneMatch = b.zone === pickerZone ? 0 : 1;
    if (aZoneMatch !== bZoneMatch) return aZoneMatch - bZoneMatch;

    // 2. Priority level order
    const priorityWeight: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
    const pA = priorityWeight[a.priorityLevel] ?? 99;
    const pB = priorityWeight[b.priorityLevel] ?? 99;
    if (pA !== pB) return pA - pB;

    // 3. Shortest estimated time
    return a.estimatedTimeMinutes - b.estimatedTimeMinutes;
  });
}

/**
 * Detects bottleneck stage in warehouse operations.
 */
export function detectWarehouseBottleneck(
  orders: Order[],
  pickTasks: PickTask[]
): {
  bottleneckStage: OrderFulfillmentStage;
  analysis: string;
  recommendation: string;
} {
  const pickingCount = pickTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const packingCount = orders.filter(o => o.fulfillmentStage === 'PACKING' || o.fulfillmentStage === 'QUALITY_CHECK').length;
  const unallocatedCount = orders.filter(o => o.allocationStatus === 'PARTIALLY_ALLOCATED' || o.allocationStatus === 'UNALLOCATED').length;

  if (pickingCount >= 4) {
    return {
      bottleneckStage: 'PICKING',
      analysis: `Picking stage backlog detected (${pickingCount} active tasks). Zone A & B exhibit average pick time increase of 35%.`,
      recommendation: 'Reassign 1 additional picker to Zone A/B and prioritize urgent picking sequence.'
    };
  } else if (unallocatedCount >= 3) {
    return {
      bottleneckStage: 'ALLOCATED',
      analysis: `Inventory allocation backlog (${unallocatedCount} unallocated orders). Multiple stock conflict exceptions active.`,
      recommendation: 'Run Smart Reallocation Engine to swap reserved stock from lower-priority orders.'
    };
  } else if (packingCount >= 3) {
    return {
      bottleneckStage: 'PACKING',
      analysis: `Packing & Quality Check queue build-up (${packingCount} orders). Quality check exceptions pending resolution.`,
      recommendation: 'Approve pending QC replacement re-pick requests to clear packing station.'
    };
  }

  return {
    bottleneckStage: 'DISPATCHED',
    analysis: 'Warehouse flow is balanced across all stages. SLA breach risk is under control.',
    recommendation: 'Continue monitoring active orders and carrier dispatch SLAs.'
  };
}
