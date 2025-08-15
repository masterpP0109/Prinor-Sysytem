import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ClipboardCheck, TrendingUp, History, Plus, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Inventory Management System</h1>
            <p className="text-xl text-muted-foreground">Offline-first stocktake management</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {dashboardStats.totalShelves} shelves</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Count</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.lastCount ?
                  (() => {
                    const daysAgo = Math.floor((Date.now() - new Date(dashboardStats.lastCount.date).getTime()) / (1000 * 60 * 60 * 24));
                    return daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
                  })()
                  : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.lastCount ? `${dashboardStats.lastCount.shelf} section` : 'No counts yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Current inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">All synced</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Add, edit, and organize your inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/inventory">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Stock Counting
              </CardTitle>
              <CardDescription>
                Count inventory by shelf and location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/counting">
                <Button className="w-full">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Start Counting
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reports
              </CardTitle>
              <CardDescription>
                View stocktake reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/reports">
                <Button className="w-full" variant="secondary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
