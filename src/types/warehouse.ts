export type PriorityLevel = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type WarehouseZone = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D' | 'Zone E' | 'Zone F';

export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';

export type OrderAllocationStatus = 'UNALLOCATED' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED' | 'CONFLICT' | 'BACKORDERED';

export type OrderFulfillmentStage = 
  | 'CREATED'
  | 'PRIORITY_ASSIGNED'
  | 'INVENTORY_CHECKED'
  | 'ALLOCATED'
  | 'PICKING'
  | 'PACKING'
  | 'QUALITY_CHECK'
  | 'DISPATCHED'
  | 'CANCELLED';

export type CustomerType = 'VIP' | 'ENTERPRISE' | 'STANDARD' | 'REGULAR';

export type ProductCategory = 
  | 'Electronics' 
  | 'Industrial' 
  | 'Apparel' 
  | 'Consumables' 
  | 'Hardware' 
  | 'Robotics & Automation' 
  | 'Cold Chain & Refrigeration' 
  | 'Safety & PPE' 
  | 'Chemical & Materials' 
  | 'Storage & Racking';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  zone: WarehouseZone;
  shelf: string; // e.g. A-12-04
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  reorderLevel: number;
  unitPrice: number;
  avgDailyDemand: number; // units/day
  supplierLeadTimeDays: number;
  status: StockStatus;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantityRequested: number;
  quantityAllocated: number;
  quantityPicked: number;
  unitPrice: number;
  imageUrl?: string;
}

export interface PriorityScoreBreakdown {
  score: number; // 0 - 100
  level: PriorityLevel;
  urgencyScore: number;     // 35% weight
  customerScore: number;    // 20% weight
  ageScore: number;         // 15% weight
  valueScore: number;       // 10% weight
  stockAvailabilityScore: number; // 20% weight
  explanation: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerType: CustomerType;
  orderDate: string; // ISO string
  deliveryDeadline: string; // ISO string
  items: OrderItem[];
  manualPriority: PriorityLevel;
  calculatedPriority: PriorityScoreBreakdown;
  allocationStatus: OrderAllocationStatus;
  fulfillmentStage: OrderFulfillmentStage;
  totalValue: number;
  assignedPicker?: string;
  estimatedDispatchTime?: string;
  notes?: string;
}

export type PickTaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface PickTask {
  id: string;
  orderId: string;
  priorityLevel: PriorityLevel;
  productId: string;
  productName: string;
  quantity: number;
  zone: WarehouseZone;
  shelf: string;
  assignedPicker?: string;
  status: PickTaskStatus;
  estimatedTimeMinutes: number;
  sequenceOrder?: number;
  imageUrl?: string;
}

export type QCStatus = 'PENDING' | 'PASSED' | 'FAILED_WRONG_ITEM' | 'FAILED_MISSING_ITEM' | 'FAILED_DAMAGED_ITEM' | 'FAILED_QTY_MISMATCH';

export interface PackingStationItem {
  orderId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    qtyRequired: number;
    qtyPicked: number;
    status: QCStatus;
  }[];
  overallQCStatus: 'PENDING' | 'PASSED' | 'EXCEPTION_FLAGGED';
  notes?: string;
}

export type ExceptionCategory = 
  | 'INVENTORY_SHORTAGE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'DAMAGED_ITEM'
  | 'MISSING_ITEM'
  | 'PICKING_DELAY'
  | 'ALLOCATION_CONFLICT'
  | 'DISPATCH_DELAY'
  | 'QUALITY_CHECK_FAILURE';

export type ExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface ExceptionItem {
  id: string;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  title: string;
  problem: string;
  impact: string;
  systemAnalysis: string;
  recommendedDecision: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  affectedOrdersCount?: number;
  potentialDelayText?: string;
  suggestedActionType: 'REALLOCATE' | 'REORDER' | 'RE_PICK' | 'SPLIT_SHIPMENT' | 'ESCALATE' | 'DISPATCH_NOW' | 'TRANSFER_STOCK';
  resolved: boolean;
  resolutionTimestamp?: string;
  actionTaken?: string;
}

export type DispatchStatus = 'READY_FOR_DISPATCH' | 'ASSIGNED_TO_CARRIER' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';

export interface DispatchRecord {
  orderId: string;
  customerName: string;
  priority: PriorityLevel;
  carrier: string;
  trackingNumber: string;
  status: DispatchStatus;
  readyTimestamp: string;
  dispatchedTimestamp?: string;
  estimatedDelivery: string;
  slaBreachRisk: boolean;
  minutesInReadyState: number;
}

export interface ReorderRecommendation {
  productId: string;
  productName: string;
  currentAvailableStock: number;
  reorderLevel: number;
  avgDailyDemand: number;
  daysRemaining: number;
  recommendedQuantity: number;
  estimatedCost: number;
}

export interface OperationalMetrics {
  totalProducts: number;
  totalAvailableStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalActiveOrders: number;
  urgentOrdersCount: number;
  ordersWaitingPicking: number;
  ordersReadyDispatch: number;
  todayFulfillmentRate: number;
  avgProcessingTimeMinutes: number;
  avgPickingTimeMinutes: number;
  avgPackingTimeMinutes: number;
  avgDispatchTimeMinutes: number;
  exceptionRatePercentage: number;
  inventoryTurnoverRatio: number;
  bottleneckStage: OrderFulfillmentStage;
}

export interface AICopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'NAVIGATE' | 'EXECUTE_REALLOCATION' | 'EXECUTE_REORDER' | 'DISPATCH_URGENT';
    targetId?: string;
    page?: string;
  }[];
}
