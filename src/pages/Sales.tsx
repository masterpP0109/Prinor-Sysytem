import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, ArrowLeft, Trash2, DollarSign, ShoppingCart, Calendar, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { getItems, getSales, addSale, deleteSale, calculateTotalSales, calculateSalesByPeriod } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Sale {
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

interface Item {
  id: string;
  name: string;
  price: number;
  remaining: number;
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newSale, setNewSale] = useState({
    itemId: "",
    quantity: "",
    unitPrice: "",
    customerName: "",
    notes: ""
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = () => {
    try {
      setLoading(true);
      const salesData = getSales();
      const itemsData = getItems();
      setSales(salesData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    if (!newSale.itemId || !newSale.quantity || !newSale.unitPrice) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedItem = items.find(item => item.id === newSale.itemId);
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Selected item not found",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(newSale.quantity);
    const unitPrice = parseFloat(newSale.unitPrice);

    if (quantity > selectedItem.remaining) {
      toast({
        title: "Error",
        description: `Only ${selectedItem.remaining} items remaining in stock`,
        variant: "destructive"
      });
      return;
    }

    try {
      addSale({
        itemId: newSale.itemId,
        itemName: selectedItem.name,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
        customerName: newSale.customerName || undefined,
        notes: newSale.notes || undefined
      });

      toast({
        title: "Success",
        description: "Sale recorded successfully"
      });

      setNewSale({ itemId: "", quantity: "", unitPrice: "", customerName: "", notes: "" });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding sale:', error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSale = (id: string) => {
    try {
      deleteSale(id);
      toast({
        title: "Success",
        description: "Sale deleted successfully"
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive"
      });
    }
  };

  const totalSales = calculateTotalSales();
  const todaySales = calculateSalesByPeriod(1);
  const weekSales = calculateSalesByPeriod(7);
  const monthSales = calculateSalesByPeriod(30);

  const availableItems = items.filter(item => item.remaining > 0);

  const selectedItem = items.find(item => item.id === newSale.itemId);
  const maxQuantity = selectedItem ? selectedItem.remaining : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="shadow-md">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                Sales Management
              </h1>
              <p className="text-muted-foreground">Track and manage your sales transactions</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>Record a new sales transaction</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item" className="text-right">Item</Label>
                  <Select value={newSale.itemId} onValueChange={(value) => setNewSale({...newSale, itemId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (${item.price.toFixed(2)}) - {item.remaining} left
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                    className="col-span-3"
                    placeholder="1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit-price" className="text-right">Unit Price</Label>
                  <Input
                    id="unit-price"
                    type="number"
                    step="0.01"
                    value={newSale.unitPrice}
                    onChange={(e) => setNewSale({...newSale, unitPrice: e.target.value})}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">Customer</Label>
                  <Input
                    id="customer"
                    value={newSale.customerName}
                    onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input
                    id="notes"
                    value={newSale.notes}
                    onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                    className="col-span-3"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSale}>Record Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">${totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Today</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">${todaySales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">${weekSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">This Month</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">${monthSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>All recorded sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No sales recorded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start recording sales to track your revenue
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Sale
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sales
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{sale.itemName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">Qty: {sale.quantity}</Badge>
                            {sale.customerName && <Badge variant="outline">{sale.customerName}</Badge>}
                          </div>
                          {sale.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{sale.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Unit Price</p>
                          <p className="font-semibold">${sale.unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold text-green-700">${sale.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="text-sm">{new Date(sale.timestamp).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSale(sale.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sales;