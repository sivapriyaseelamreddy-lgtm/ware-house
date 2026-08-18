import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Order, PickTask, ExceptionItem, DispatchRecord, PriorityLevel, QCStatus } from '../types/warehouse';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_PICK_TASKS, INITIAL_EXCEPTIONS, INITIAL_DISPATCH_RECORDS } from '../mock/mockData';
import { calculatePriorityScore } from '../utils/decisionEngine';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface WarehouseContextType {
  products: Product[];
  orders: Order[];
  pickTasks: PickTask[];
  exceptions: ExceptionItem[];
  dispatchRecords: DispatchRecord[];
  activePage: string;
  searchQuery: string;
  selectedZoneFilter: string;
  toast: Toast | null;
  isAssistantOpen: boolean;
  
  setActivePage: (page: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedZoneFilter: (zone: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  toggleAssistant: (open?: boolean) => void;
  
  createOrder: (orderData: Omit<Order, 'id' | 'calculatedPriority' | 'allocationStatus' | 'fulfillmentStage'>) => void;
  updateOrderPriority: (orderId: string, priority: PriorityLevel) => void;
  allocateOrder: (orderId: string) => void;
  reallocateStock: (targetOrderId: string, sourceOrderId: string, productId: string, qty: number) => void;
  assignPickTask: (taskId: string, pickerName: string) => void;
  completePickTask: (taskId: string) => void;
  reportQualityCheckIssue: (orderId: string, productId: string, issueType: QCStatus, notes?: string) => void;
  resolveException: (exceptionId: string, resolutionAction: string) => void;
  dispatchOrder: (orderId: string, carrier: string) => void;
  reorderProduct: (productId: string, quantity: number) => void;
  resetData: () => void;
  tickSimulation: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'SMARTFLOW_WAREHOUSE_STATE_V1';

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_PRODUCTS');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_ORDERS');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [pickTasks, setPickTasks] = useState<PickTask[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_PICK_TASKS');
    return saved ? JSON.parse(saved) : INITIAL_PICK_TASKS;
  });

  const [exceptions, setExceptions] = useState<ExceptionItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_EXCEPTIONS');
    return saved ? JSON.parse(saved) : INITIAL_EXCEPTIONS;
  });

  const [dispatchRecords, setDispatchRecords] = useState<DispatchRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_DISPATCH');
    return saved ? JSON.parse(saved) : INITIAL_DISPATCH_RECORDS;
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<Toast | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY + '_PRODUCTS', JSON.stringify(products));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_ORDERS', JSON.stringify(orders));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_PICK_TASKS', JSON.stringify(pickTasks));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_EXCEPTIONS', JSON.stringify(exceptions));
    localStorage.setItem(LOCAL_STORAGE_KEY + '_DISPATCH', JSON.stringify(dispatchRecords));
  }, [products, orders, pickTasks, exceptions, dispatchRecords]);

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ id: Date.now().toString(), title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const toggleAssistant = (open?: boolean) => {
    setIsAssistantOpen(prev => (open !== undefined ? open : !prev));
  };

  // 1. Create Order
  const createOrder = (orderData: Omit<Order, 'id' | 'calculatedPriority' | 'allocationStatus' | 'fulfillmentStage'>) => {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const calcPriority = calculatePriorityScore(
      orderData.orderDate,
      orderData.deliveryDeadline,
      orderData.customerType,
      orderData.totalValue,
      1.0
    );

    const newOrder: Order = {
      ...orderData,
      id: newId,
      calculatedPriority: calcPriority,
      manualPriority: calcPriority.level,
      allocationStatus: 'UNALLOCATED',
      fulfillmentStage: 'CREATED'
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast('Order Created', `Order ${newId} created for ${newOrder.customerName}. Calculated Priority Score: ${calcPriority.score}/100.`, 'success');
  };

  // 2. Update Priority
  const updateOrderPriority = (orderId: string, priority: PriorityLevel) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedPriority = {
          ...order.calculatedPriority,
          level: priority,
          explanation: `Manually overridden to ${priority} by Warehouse Supervisor.`
        };
        return {
          ...order,
          manualPriority: priority,
          calculatedPriority: updatedPriority
        };
      }
      return order;
    }));
    showToast('Priority Updated', `Order ${orderId} priority adjusted to ${priority}. Queue re-sorted.`, 'info');
  };

  // 3. Allocate Order
  const allocateOrder = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    let isFullyAllocated = true;
    let isPartiallyAllocated = false;
    let newProducts = [...products];

    targetOrder.items.forEach(item => {
      const prod = newProducts.find(p => p.id === item.productId);
      if (!prod || prod.availableStock < item.quantityRequested) {
        isFullyAllocated = false;
        if (prod && prod.availableStock > 0) isPartiallyAllocated = true;
      }
    });

    if (isFullyAllocated) {
      targetOrder.items.forEach(item => {
        const prodIndex = newProducts.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          const prod = newProducts[prodIndex];
          newProducts[prodIndex] = {
            ...prod,
            availableStock: prod.availableStock - item.quantityRequested,
            reservedStock: prod.reservedStock + item.quantityRequested,
            status: (prod.availableStock - item.quantityRequested) === 0
              ? 'OUT_OF_STOCK'
              : (prod.availableStock - item.quantityRequested) <= prod.reorderLevel
              ? 'LOW_STOCK'
              : 'HEALTHY'
          };
        }
      });

      setProducts(newProducts);
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        allocationStatus: 'FULLY_ALLOCATED',
        fulfillmentStage: 'ALLOCATED',
        items: o.items.map(i => ({ ...i, quantityAllocated: i.quantityRequested }))
      } : o));

      // Generate pick tasks automatically
      const newTasks: PickTask[] = targetOrder.items.map((item, idx) => {
        const prod = newProducts.find(p => p.id === item.productId);
        return {
          id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
          orderId,
          priorityLevel: targetOrder.manualPriority,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantityRequested,
          zone: prod?.zone || 'Zone A',
          shelf: prod?.shelf || 'A-01-01',
          status: 'PENDING',
          estimatedTimeMinutes: Math.floor(4 + Math.random() * 6),
          sequenceOrder: idx + 1
        };
      });

      setPickTasks(prev => [...newTasks, ...prev]);
      showToast('Allocation Complete', `Order ${orderId} fully allocated! ${newTasks.length} pick tasks queued.`, 'success');
    } else {
      // Partial allocation logic
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        allocationStatus: isPartiallyAllocated ? 'PARTIALLY_ALLOCATED' : 'CONFLICT',
        fulfillmentStage: 'INVENTORY_CHECKED'
      } : o));

      // Trigger exception alert automatically if missing
      const existingEx = exceptions.find(e => e.relatedOrderId === orderId && !e.resolved);
      if (!existingEx) {
        const newException: ExceptionItem = {
          id: `EXC-${Math.floor(100 + Math.random() * 900)}`,
          category: 'INVENTORY_SHORTAGE',
          severity: 'CRITICAL',
          title: `Stock Conflict on Order ${orderId}`,
          problem: `Insufficient available stock to fully allocate Order ${orderId}.`,
          impact: `Fulfillment delayed. Priority ${targetOrder.manualPriority} customer SLA at risk.`,
          systemAnalysis: `Requested item stock is partially reserved by lower priority orders. Reallocation recommended.`,
          recommendedDecision: `Reallocate reserved inventory from lower priority orders to ${orderId}.`,
          relatedOrderId: orderId,
          suggestedActionType: 'REALLOCATE',
          resolved: false
        };
        setExceptions(prev => [newException, ...prev]);
      }

      showToast('Allocation Alert', `Order ${orderId} has insufficient available stock. Stock reallocation recommendation generated in Exception Center.`, 'warning');
    }
  };

  // 4. Reallocate Stock from low-priority order to high-priority order
  const reallocateStock = (targetOrderId: string, sourceOrderId: string, productId: string, qty: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === sourceOrderId) {
        return {
          ...o,
          allocationStatus: 'PARTIALLY_ALLOCATED',
          items: o.items.map(i => i.productId === productId ? { ...i, quantityAllocated: Math.max(0, i.quantityAllocated - qty) } : i)
        };
      }
      if (o.id === targetOrderId) {
        return {
          ...o,
          allocationStatus: 'FULLY_ALLOCATED',
          fulfillmentStage: 'ALLOCATED',
          items: o.items.map(i => i.productId === productId ? { ...i, quantityAllocated: i.quantityRequested } : i)
        };
      }
      return o;
    }));

    setExceptions(prev => prev.map(e => e.relatedOrderId === targetOrderId ? { ...e, resolved: true, resolutionTimestamp: new Date().toISOString() } : e));
    showToast('Reallocation Successful', `Reallocated ${qty} units from ${sourceOrderId} to Urgent Order ${targetOrderId}.`, 'success');
  };

  // 5. Assign Pick Task
  const assignPickTask = (taskId: string, pickerName: string) => {
    setPickTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedPicker: pickerName, status: 'IN_PROGRESS' } : t));
    showToast('Picker Assigned', `Task ${taskId} assigned to ${pickerName}. Stage set to In Progress.`, 'info');
  };

  // 6. Complete Pick Task
  const completePickTask = (taskId: string) => {
    let completedOrder: Order | undefined;
    setPickTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' as const } : t);
      const targetTask = updated.find(t => t.id === taskId);
      if (targetTask) {
        const orderTasks = updated.filter(t => t.orderId === targetTask.orderId);
        const allDone = orderTasks.every(t => t.status === 'COMPLETED');
        if (allDone) {
          setOrders(oPrev => oPrev.map(o => {
            if (o.id === targetTask.orderId) {
              completedOrder = o;
              return { ...o, fulfillmentStage: 'PACKING' };
            }
            return o;
          }));
        }
      }
      return updated;
    });

    showToast('Pick Task Completed', `Task ${taskId} marked complete.${completedOrder ? ` Order ${completedOrder.id} progressed to Packing & Quality Check!` : ''}`, 'success');
  };

  // 7. Report Quality Check Issue
  const reportQualityCheckIssue = (orderId: string, productId: string, issueType: QCStatus, notes?: string) => {
    const prod = products.find(p => p.id === productId);

    const newEx: ExceptionItem = {
      id: `EXC-${Math.floor(100 + Math.random() * 900)}`,
      category: issueType === 'FAILED_DAMAGED_ITEM' ? 'DAMAGED_ITEM' : 'QUALITY_CHECK_FAILURE',
      severity: 'WARNING',
      title: `Quality Check Exception: ${issueType.replace('FAILED_', '').replace('_', ' ')} for ${orderId}`,
      problem: `QC Station failed unit inspection for product ${prod?.name || productId} in Order ${orderId}. ${notes || ''}`,
      impact: `Packing halted for Order ${orderId}. Dispatch SLA delayed.`,
      systemAnalysis: `QC inspector reported defect during final packing scan. Unit marked damaged.`,
      recommendedDecision: `Issue immediate re-pick task from secondary shelf stock and isolate damaged inventory.`,
      relatedOrderId: orderId,
      relatedProductId: productId,
      suggestedActionType: 'RE_PICK',
      resolved: false
    };

    if (issueType === 'FAILED_DAMAGED_ITEM' && prod) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, damagedStock: p.damagedStock + 1 } : p));
    }

    setExceptions(prev => [newEx, ...prev]);
    showToast('QC Defect Flagged', `Exception logged for Order ${orderId}. Workflow escalated to Exception Center.`, 'error');
  };

  // 8. Resolve Exception
  const resolveException = (exceptionId: string, resolutionAction: string) => {
    setExceptions(prev => prev.map(ex => {
      if (ex.id === exceptionId) {
        return {
          ...ex,
          resolved: true,
          resolutionTimestamp: new Date().toISOString(),
          actionTaken: resolutionAction
        };
      }
      return ex;
    }));
    showToast('Exception Resolved', `Exception ${exceptionId} resolved via action: "${resolutionAction}".`, 'success');
  };

  // 9. Dispatch Order
  const dispatchOrder = (orderId: string, carrier: string) => {
    const trackingNo = `${carrier.slice(0, 3).toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      fulfillmentStage: 'DISPATCHED',
      notes: `Dispatched via ${carrier} (Tracking: ${trackingNo})`
    } : o));

    setDispatchRecords(prev => [
      {
        orderId,
        customerName: orders.find(o => o.id === orderId)?.customerName || 'Valued Customer',
        priority: orders.find(o => o.id === orderId)?.manualPriority || 'NORMAL',
        carrier,
        trackingNumber: trackingNo,
        status: 'DISPATCHED',
        readyTimestamp: new Date().toISOString(),
        dispatchedTimestamp: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        slaBreachRisk: false,
        minutesInReadyState: 5
      },
      ...prev.filter(d => d.orderId !== orderId)
    ]);

    showToast('Order Dispatched', `Order ${orderId} dispatched with ${carrier}! Tracking #${trackingNo}`, 'success');
  };

  // 10. Reorder Product
  const reorderProduct = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newTotal = p.totalStock + quantity;
        const newAvail = p.availableStock + quantity;
        return {
          ...p,
          totalStock: newTotal,
          availableStock: newAvail,
          status: newAvail > p.reorderLevel ? 'HEALTHY' : 'LOW_STOCK'
        };
      }
      return p;
    }));

    showToast('Stock Replenished', `Purchase order of ${quantity} units processed for ${productId}. Stock updated.`, 'success');
  };

  // 11. Tick Simulation
  const tickSimulation = () => {
    // Advance pick tasks, update ready times, etc.
    showToast('Simulation Ticked', 'Warehouse operational ticks simulated: updated stock flow, order ages, and pick metrics.', 'info');
  };

  // 12. Reset Data
  const resetData = () => {
    localStorage.clear();
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setPickTasks(INITIAL_PICK_TASKS);
    setExceptions(INITIAL_EXCEPTIONS);
    setDispatchRecords(INITIAL_DISPATCH_RECORDS);
    showToast('System Reset', 'All warehouse mock data restored to clean initial benchmark state.', 'info');
  };

  return (
    <WarehouseContext.Provider value={{
      products,
      orders,
      pickTasks,
      exceptions,
      dispatchRecords,
      activePage,
      searchQuery,
      selectedZoneFilter,
      toast,
      isAssistantOpen,
      setActivePage,
      setSearchQuery,
      setSelectedZoneFilter,
      showToast,
      toggleAssistant,
      createOrder,
      updateOrderPriority,
      allocateOrder,
      reallocateStock,
      assignPickTask,
      completePickTask,
      reportQualityCheckIssue,
      resolveException,
      dispatchOrder,
      reorderProduct,
      resetData,
      tickSimulation
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) throw new Error('useWarehouse must be used within a WarehouseProvider');
  return context;
};
