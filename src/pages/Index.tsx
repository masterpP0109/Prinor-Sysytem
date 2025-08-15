import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardCheck, TrendingUp, History, Plus, LogOut, ShoppingBasket, Smartphone, Store, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { OrderManagement } from "@/components/OrderManagement";
import { PaymentManagement } from "@/components/PaymentManagement";
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
  });

  // Compute stats from inventory
  useEffect(() => {
    const updateStats = () => {
      const inventory = loadInventory();
      let totalItems = 0;
      let totalValue = 0;
      const shelfSet = new Set();
      let lastDate = null;
      let lastShelf = '';
      for (const item of inventory) {
        totalItems += item.currentStock;
        totalValue += item.price * item.currentStock;
        shelfSet.add(item.shelf);
        if (!lastDate || new Date(item.lastCounted) > new Date(lastDate)) {
          lastDate = item.lastCounted;
          lastShelf = item.shelf;
        }
      }
      setDashboardStats({
        totalItems,
        totalShelves: shelfSet.size,
        totalValue,
        lastCount: lastDate ? { date: lastDate, shelf: lastShelf } : null,
      });
    };
    window.addEventListener('focus', updateStats);
    updateStats();
    return () => window.removeEventListener('focus', updateStats);
  }, []);

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
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${dashboardStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">Current inventory</p>
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
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">245</div>
                    <div className="text-sm text-muted-foreground">Items</div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">$12.5K</div>
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
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">128</div>
                    <div className="text-sm text-muted-foreground">Items</div>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">$18.2K</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OrderManagement />
            <PaymentManagement />
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
