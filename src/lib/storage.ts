// Local storage utilities for offline-first functionality

export interface Shelf {
  id: string;
  name: string;
  createdAt: number;
}

export interface Item {
  id: string;
  shelfId: string;
  name: string;
  price: number;
  initialQuantity: number;
  sold: number;
  remaining: number;
  createdAt: number;
}

export interface Order {
  id: string;
  itemId: string;
  quantity: number;
  totalAmount: number;
  isCredit?: boolean;
  isForgotten?: boolean;
  customerName?: string;
  notes?: string;
  timestamp: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  notes?: string;
  timestamp: number;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName?: string;
  notes?: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  SHELVES: 'inventory_shelves',
  ITEMS: 'inventory_items',
  ORDERS: 'inventory_orders',
  PAYMENTS: 'inventory_payments',
  SALES: 'inventory_sales',
};

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Shelves
export const getShelves = (): Shelf[] => getFromStorage<Shelf>(STORAGE_KEYS.SHELVES);

export const addShelf = (name: string): Shelf => {
  const shelves = getShelves();
  const newShelf: Shelf = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
  };
  saveToStorage(STORAGE_KEYS.SHELVES, [...shelves, newShelf]);
  return newShelf;
};

export const updateShelf = (id: string, name: string): void => {
  const shelves = getShelves();
  const updated = shelves.map(s => s.id === id ? { ...s, name } : s);
  saveToStorage(STORAGE_KEYS.SHELVES, updated);
};

export const deleteShelf = (id: string): void => {
  const shelves = getShelves();
  const items = getItems();
  saveToStorage(STORAGE_KEYS.SHELVES, shelves.filter(s => s.id !== id));
  saveToStorage(STORAGE_KEYS.ITEMS, items.filter(i => i.shelfId !== id));
};

// Items
export const getItems = (): Item[] => getFromStorage<Item>(STORAGE_KEYS.ITEMS);

export const getItemsByShelf = (shelfId: string): Item[] => {
  return getItems().filter(item => item.shelfId === shelfId);
};

export const addItem = (item: Omit<Item, 'id' | 'createdAt'>): Item => {
  const items = getItems();
  const newItem: Item = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  saveToStorage(STORAGE_KEYS.ITEMS, [...items, newItem]);
  return newItem;
};

export const updateItem = (id: string, updates: Partial<Item>): void => {
  const items = getItems();
  const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
  saveToStorage(STORAGE_KEYS.ITEMS, updated);
};

export const deleteItem = (id: string): void => {
  const items = getItems();
  saveToStorage(STORAGE_KEYS.ITEMS, items.filter(i => i.id !== id));
};

// Orders
export const getOrders = (): Order[] => getFromStorage<Order>(STORAGE_KEYS.ORDERS);

export const addOrder = (order: Omit<Order, 'id' | 'timestamp'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  saveToStorage(STORAGE_KEYS.ORDERS, [...orders, newOrder]);
  return newOrder;
};

// Payments
export const getPayments = (): Payment[] => getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);

export const addPayment = (payment: Omit<Payment, 'id' | 'timestamp'>): Payment => {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  saveToStorage(STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
  return newPayment;
};

export const deletePayment = (id: string): void => {
  const payments = getPayments();
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments.filter(p => p.id !== id));
};

// Sales
export const getSales = (): Sale[] => getFromStorage<Sale>(STORAGE_KEYS.SALES);

export const addSale = (sale: Omit<Sale, 'id' | 'timestamp'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  saveToStorage(STORAGE_KEYS.SALES, [...sales, newSale]);
  return newSale;
};

export const deleteSale = (id: string): void => {
  const sales = getSales();
  saveToStorage(STORAGE_KEYS.SALES, sales.filter(s => s.id !== id));
};

// Calculations
export const calculateShelfValue = (shelfId: string): { total: number; sold: number; remaining: number } => {
  const items = getItemsByShelf(shelfId);
  return items.reduce((acc, item) => ({
    total: acc.total + (item.price * item.initialQuantity),
    sold: acc.sold + (item.price * item.sold),
    remaining: acc.remaining + (item.price * item.remaining),
  }), { total: 0, sold: 0, remaining: 0 });
};

export const calculateTotalInventoryValue = (): { total: number; sold: number; remaining: number } => {
  const items = getItems();
  return items.reduce((acc, item) => ({
    total: acc.total + (item.price * item.initialQuantity),
    sold: acc.sold + (item.price * item.sold),
    remaining: acc.remaining + (item.price * item.remaining),
  }), { total: 0, sold: 0, remaining: 0 });
};

export const calculateExpectedCash = (): number => {
  const totalSales = calculateTotalInventoryValue().sold;
  const totalPayments = getPayments().reduce((sum, p) => sum + p.amount, 0);
  return totalSales - totalPayments;
};

export const calculateTotalSales = (): number => {
  return getSales().reduce((sum, sale) => sum + sale.totalAmount, 0);
};

export const calculateSalesByPeriod = (days: number): number => {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return getSales()
    .filter(sale => sale.timestamp >= cutoff)
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
};