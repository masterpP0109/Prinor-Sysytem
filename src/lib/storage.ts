// Local storage utilities for offline-first functionality

export interface Shelf {
  id: string;
  name: string;
  createdAt: string;
}

export interface Item {
  id: string;
  shelfId: string;
  name: string;
  initialQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  price: number;
  createdAt: string;
}

export interface Order {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  notes?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  SHELVES: 'inventory_shelves',
  ITEMS: 'inventory_items',
  ORDERS: 'inventory_orders',
  PAYMENTS: 'inventory_payments',
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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

export const addOrder = (order: Omit<Order, 'id' | 'createdAt'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.ORDERS, [...orders, newOrder]);
  return newOrder;
};

// Payments
export const getPayments = (): Payment[] => getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);

export const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>): Payment => {
  const payments = getPayments();
  const newPayment: Payment = {
    ...payment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
  return newPayment;
};

export const deletePayment = (id: string): void => {
  const payments = getPayments();
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments.filter(p => p.id !== id));
};

// Calculations
export const calculateShelfValue = (shelfId: string): { total: number; sold: number; remaining: number } => {
  const items = getItemsByShelf(shelfId);
  return items.reduce((acc, item) => ({
    total: acc.total + (item.price * item.initialQuantity),
    sold: acc.sold + (item.price * item.soldQuantity),
    remaining: acc.remaining + (item.price * item.remainingQuantity),
  }), { total: 0, sold: 0, remaining: 0 });
};

export const calculateTotalInventoryValue = (): { total: number; sold: number; remaining: number } => {
  const items = getItems();
  return items.reduce((acc, item) => ({
    total: acc.total + (item.price * item.initialQuantity),
    sold: acc.sold + (item.price * item.soldQuantity),
    remaining: acc.remaining + (item.price * item.remainingQuantity),
  }), { total: 0, sold: 0, remaining: 0 });
};

export const calculateExpectedCash = (): number => {
  const totalSales = calculateTotalInventoryValue().sold;
  const totalPayments = getPayments().reduce((sum, p) => sum + p.amount, 0);
  return totalSales - totalPayments;
};