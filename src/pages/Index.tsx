import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardCheck, TrendingUp, History, Plus, LogOut, ShoppingBasket, Smartphone, Store, BarChart3, DollarSign, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { OrderManagement } from "@/components/OrderManagement";
import { PaymentManagement } from "@/components/PaymentManagement";
import { getItems, getShelves, getOrders, getPayments, calculateTotalInventoryValue, calculateExpectedCash, calculateTotalSales, addShelf, getItemsByShelf, updateItem, deleteItem, addItem, Shelf, Item } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// Helper to load inventory from localStorage
function loadInventory() {
  try {
    const data = localStorage.getItem("countedInventory");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    totalShelves: 0,
    totalValue: 0,
    lastCount: null as null | { date: string; shelf: string },
    groceriesStats: { items: 0, value: 0 },
    gadgetsStats: { items: 0, value: 0 },
    recentOrders: [] as any[],
    totalOrders: 0,
    totalPayments: 0,
    totalSales: 0,
    netAssets: 0,
    expectedCash: 0
  });

  // Shelves and items state
  const [shelves, setShelves] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [expandedShelves, setExpandedShelves] = useState<Set<string>>(new Set());
  const [newShelfName, setNewShelfName] = useState('');
  const [isAddShelfOpen, setIsAddShelfOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<any>(null);
  const [editShelfName, setEditShelfName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch data from local storage
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = () => {
      try {
        // Fetch items with category classification
        const items = getItems();

        // Fetch shelves
        const shelves = getShelves();

        // Fetch recent orders
        const orders = getOrders().slice(0, 5);

        // Fetch payments
        const payments = getPayments();

        // Calculate stats
        const totalItems = items.length;
        const totalValue = calculateTotalInventoryValue().total;
        const totalShelves = shelves.length;

        // Categorize items (simple categorization by name keywords)
        const groceriesKeywords = ['food', 'drink', 'milk', 'bread', 'fruit', 'vegetable', 'meat', 'grocery', 'snack'];
        const gadgetsKeywords = ['phone', 'laptop', 'tablet', 'headphone', 'camera', 'watch', 'electronic', 'gadget', 'tech'];

        let groceriesItems = 0, groceriesValue = 0;
        let gadgetsItems = 0, gadgetsValue = 0;

        items.forEach(item => {
          if (!item?.name) return; // Skip items without names
          const itemName = item.name.toLowerCase();
          const itemPrice = item.price;

          const isGrocery = groceriesKeywords.some(keyword => itemName.includes(keyword));
          const isGadget = gadgetsKeywords.some(keyword => itemName.includes(keyword));

          if (isGrocery) {
            groceriesItems++;
            groceriesValue += itemPrice;
          } else if (isGadget) {
            gadgetsItems++;
            gadgetsValue += itemPrice;
          } else {
            // Default to groceries if no clear category
            groceriesItems++;
            groceriesValue += itemPrice;
          }
        });

        // Calculate financial stats
        const totalOrdersAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalPaymentsAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalSalesAmount = calculateTotalSales();
        const expectedCash = calculateExpectedCash();
        const netAssets = totalValue + totalPaymentsAmount - totalOrdersAmount;

        setDashboardStats({
          totalItems,
          totalShelves,
          totalValue,
          lastCount: null, // No stock counts in local storage yet
          groceriesStats: { items: groceriesItems, value: groceriesValue },
          gadgetsStats: { items: gadgetsItems, value: gadgetsValue },
          recentOrders: orders,
          totalOrders: totalOrdersAmount,
          totalPayments: totalPaymentsAmount,
          totalSales: totalSalesAmount,
          netAssets,
          expectedCash
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Hero Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5 rounded-3xl"></div>
          <div className="relative p-8 text-center">
            <div className="flex justify-between items-start mb-6">
              <div className="text-left">
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Smart Inventory Hub
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Advanced stocktake management for groceries & gadgets with real-time tracking
                </p>
              </div>
              <Button variant="outline" onClick={signOut} className="shrink-0">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <EnhancedCard variant="gradient" className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{dashboardStats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {dashboardStats.totalShelves} shelves</p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient" className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Count</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {dashboardStats.lastCount ?
                  (() => {
                    const daysAgo = Math.floor((Date.now() - new Date(dashboardStats.lastCount.date).getTime()) / (1000 * 60 * 60 * 24));
                    return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
                  })()
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.lastCount ? `${dashboardStats.lastCount.shelf} section` : 'No counts yet'}
              </p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient" className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Cash</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${dashboardStats.expectedCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${dashboardStats.expectedCash.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.expectedCash >= 0 ? 'Cash owed to you' : 'Cash discrepancy'}
              </p>
            </CardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient" className="hover:scale-[1.02] transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
              <History className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">✓</div>
              <p className="text-xs text-muted-foreground mt-1">All synced</p>
            </CardContent>
          </EnhancedCard>
        </div>

        {/* Business Sections */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Business Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Groceries Section */}
            <EnhancedCard variant="groceries" className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <EnhancedCardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBasket className="h-8 w-8 text-white" />
                </div>
                <EnhancedCardTitle className="text-green-700 dark:text-green-300">Groceries Division</EnhancedCardTitle>
                <EnhancedCardDescription>Fresh produce, packaged goods, beverages & daily essentials</EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{dashboardStats.groceriesStats.items}</div>
                    <div className="text-sm text-muted-foreground">Items</div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">${dashboardStats.groceriesStats.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                    <div className="text-sm text-muted-foreground">Value</div>
                  </div>
                </div>
                <Link to="/groceries" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingBasket className="h-4 w-4 mr-2" />
                    Manage Groceries
                  </Button>
                </Link>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Gadgets Section */}
            <EnhancedCard variant="gadgets" className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <EnhancedCardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <EnhancedCardTitle className="text-blue-700 dark:text-blue-300">Gadgets Division</EnhancedCardTitle>
                <EnhancedCardDescription>Electronics, accessories, smart devices & tech solutions</EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white/50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dashboardStats.gadgetsStats.items}</div>
                    <div className="text-sm text-muted-foreground">Items</div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">${dashboardStats.gadgetsStats.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                    <div className="text-sm text-muted-foreground">Value</div>
                  </div>
                </div>
                <Link to="/gadgets" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Manage Gadgets
                  </Button>
                </Link>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Inventory Management</h2>
            <Dialog open={isAddShelfOpen} onOpenChange={setIsAddShelfOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shelf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Shelf</DialogTitle>
                  <DialogDescription>
                    Create a new shelf to organize your inventory items.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shelf-name">Shelf Name</Label>
                    <Input
                      id="shelf-name"
                      value={newShelfName}
                      onChange={(e) => setNewShelfName(e.target.value)}
                      placeholder="e.g., Beverages, Snacks, Electronics"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (newShelfName.trim()) {
                        addShelf(newShelfName.trim());
                        setNewShelfName('');
                        setIsAddShelfOpen(false);
                        // Refresh data
                        const updatedShelves = getShelves();
                        setShelves(updatedShelves);
                      }
                    }}
                    className="w-full"
                  >
                    Add Shelf
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {shelves.map((shelf) => {
              const shelfItems = getItemsByShelf(shelf.id);
              const isExpanded = expandedShelves.has(shelf.id);

              return (
                <Card key={shelf.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Collapsible open={isExpanded} onOpenChange={(open) => {
                          const newExpanded = new Set(expandedShelves);
                          if (open) {
                            newExpanded.add(shelf.id);
                          } else {
                            newExpanded.delete(shelf.id);
                          }
                          setExpandedShelves(newExpanded);
                        }}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                        <div>
                          <CardTitle className="text-lg">{shelf.name}</CardTitle>
                          <CardDescription>
                            {shelfItems.length} items • Total value: ${shelfItems.reduce((sum, item) => sum + (item.price * item.initialQuantity), 0).toFixed(2)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingShelf(shelf);
                            setEditShelfName(shelf.name);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Shelf</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{shelf.name}"? This will also delete all items in this shelf.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteShelf(shelf.id); // This will delete the shelf and its items
                                  const updatedShelves = getShelves();
                                  setShelves(updatedShelves);
                                  const updatedItems = getItems();
                                  setItems(updatedItems);
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <Collapsible open={isExpanded} onOpenChange={() => {}}>
                    <CollapsibleContent>
                      <CardContent>
                        {shelfItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No items in this shelf yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {shelfItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Price: ${item.price.toFixed(2)} • Initial: {item.initialQuantity} • Sold: {item.sold} • Remaining: {item.remaining}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newRemaining = prompt(`Update remaining quantity for ${item.name}:`, item.remaining.toString());
                                      if (newRemaining !== null) {
                                        const remaining = parseInt(newRemaining);
                                        if (!isNaN(remaining)) {
                                          updateItem(item.id, {
                                            remaining,
                                            sold: item.initialQuantity - remaining
                                          });
                                          const updatedItems = getItems();
                                          setItems(updatedItems);
                                        }
                                      }
                                    }}
                                  >
                                    Update Stock
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{item.name}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            deleteItem(item.id);
                                            const updatedItems = getItems();
                                            setItems(updatedItems);
                                          }}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Financial Tracking */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Financial Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <OrderManagement />
            <PaymentManagement />

            {/* Recent Orders Summary */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest order activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Financial Summary:</span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Sales: ${dashboardStats.totalSales.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Orders: ${dashboardStats.totalOrders.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Payments: ${dashboardStats.totalPayments.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dashboardStats.recentOrders.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent orders</p>
                      </div>
                    ) : (
                      dashboardStats.recentOrders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{order.itemId}</p>
                            <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">${order.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedCard className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Inventory Management</CardTitle>
                <CardDescription>Add, edit, and organize your inventory items across both divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/inventory">
                  <Button className="w-full" size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Inventory
                  </Button>
                </Link>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Stock Counting</CardTitle>
                <CardDescription>Count inventory by shelf and location with barcode scanning</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/counting">
                  <Button className="w-full" size="lg">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Start Counting
                  </Button>
                </Link>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Sales Management</CardTitle>
                <CardDescription>Track sales transactions and revenue for your business</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/sales">
                  <Button className="w-full" size="lg">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Manage Sales
                  </Button>
                </Link>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Analytics & Reports</CardTitle>
                <CardDescription>View detailed reports and analytics for both business divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/reports">
                  <Button className="w-full" variant="secondary" size="lg">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </EnhancedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
