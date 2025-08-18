import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardCheck, TrendingUp, History, Plus, LogOut, ShoppingBasket, Smartphone, Store, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { OrderManagement } from "@/components/OrderManagement";
import { PaymentManagement } from "@/components/PaymentManagement";
import { supabase } from "@/integrations/supabase/client";
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    totalShelves: 0,
    totalValue: 0,
    lastCount: null as null | { date: string; shelf: string },
    groceriesStats: { items: 0, value: 0 },
    gadgetsStats: { items: 0, value: 0 },
    recentOrders: [] as Array<{ id: string; order_number: string; total_amount: number; order_date: string; status: string }>,
    totalOrders: 0,
    totalPayments: 0,
    netAssets: 0
  });

  // Fetch real data from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch items with category classification
        const { data: items } = await supabase
          .from('items')
          .select('*');

        // Fetch shelves
        const { data: shelves } = await supabase
          .from('shelves')
          .select('*');

        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('order_date', { ascending: false })
          .limit(5);

        // Fetch total orders amount
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount');

        // Fetch total payments amount
        const { data: payments } = await supabase
          .from('payments')
          .select('amount');

        // Fetch latest stock count
        const { data: lastCount } = await supabase
          .from('stock_counts')
          .select('count_date, shelf_id, shelves(name)')
          .order('count_date', { ascending: false })
          .limit(1)
          .single();

        // Calculate stats
        const totalItems = items?.length || 0;
        const totalValue = items?.reduce((sum, item) => sum + (Number(item.price) || 0), 0) || 0;
        const totalShelves = shelves?.length || 0;

        // Categorize items (simple categorization by name keywords)
        const groceriesKeywords = ['food', 'drink', 'milk', 'bread', 'fruit', 'vegetable', 'meat', 'grocery', 'snack'];
        const gadgetsKeywords = ['phone', 'laptop', 'tablet', 'headphone', 'camera', 'watch', 'electronic', 'gadget', 'tech'];
        
        let groceriesItems = 0, groceriesValue = 0;
        let gadgetsItems = 0, gadgetsValue = 0;

        items?.forEach(item => {
          if (!item?.name) return; // Skip items without names
          const itemName = item.name.toLowerCase();
          const itemPrice = Number(item.price) || 0;
          
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
        const totalOrdersAmount = allOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
        const totalPaymentsAmount = payments?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
        const netAssets = totalValue + totalPaymentsAmount - totalOrdersAmount;

        setDashboardStats({
          totalItems,
          totalShelves,
          totalValue,
          lastCount: lastCount ? {
            date: lastCount.count_date,
            shelf: (lastCount.shelves as any)?.name || 'Unknown'
          } : null,
          groceriesStats: { items: groceriesItems, value: groceriesValue },
          gadgetsStats: { items: gadgetsItems, value: gadgetsValue },
          recentOrders: orders || [],
          totalOrders: totalOrdersAmount,
          totalPayments: totalPaymentsAmount,
          netAssets
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
    
    // Set up real-time listeners for updates
    const itemsChannel = supabase
      .channel('dashboard-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
    };
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
              <Button variant="outline" onClick={handleSignOut} className="shrink-0">
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
              <CardTitle className="text-sm font-medium">Net Assets</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${dashboardStats.netAssets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Inventory + Payments - Orders</p>
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
                <Link to="/inventory" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Store className="h-4 w-4 mr-2" />
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
                <Link to="/inventory" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Gadgets
                  </Button>
                </Link>
              </EnhancedCardContent>
            </EnhancedCard>
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
                            <p className="font-medium text-sm">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{order.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">${order.total_amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.order_date).toLocaleDateString()}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Analytics & Reports</CardTitle>
                <CardDescription>View detailed reports and analytics for both business divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/reports">
                  <Button className="w-full" variant="secondary" size="lg">
                    <TrendingUp className="h-4 w-4 mr-2" />
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
