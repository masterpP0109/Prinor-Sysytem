import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, Package } from "lucide-react";
import { addOrder, getOrders } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    itemId: "",
    itemName: "",
    quantity: "",
    totalPrice: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = () => {
    const data = getOrders();
    setOrders(data);
  };

  const handleAddOrder = () => {
    if (!newOrder.itemId || !newOrder.itemName || !newOrder.quantity || !newOrder.totalPrice) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      addOrder({
        itemId: newOrder.itemId,
        itemName: newOrder.itemName,
        quantity: parseInt(newOrder.quantity),
        totalPrice: parseFloat(newOrder.totalPrice)
      });

      toast({
        title: "Success",
        description: "Order added successfully"
      });

      setNewOrder({ itemId: "", itemName: "", quantity: "", totalPrice: "" });
      setIsDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
      toast({
        title: "Error",
        description: "Failed to add order",
        variant: "destructive"
      });
    }
  };

  const totalOrderValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders Management
          </CardTitle>
          <CardDescription>Track inventory purchases for your shop</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>Record a new inventory purchase (stock order) for your shop</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-id" className="text-right">Item ID</Label>
                <Input
                  id="item-id"
                  value={newOrder.itemId}
                  onChange={(e) => setNewOrder({...newOrder, itemId: e.target.value})}
                  className="col-span-3"
                  placeholder="Item ID"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-right">Item Name</Label>
                <Input
                  id="item-name"
                  value={newOrder.itemName}
                  onChange={(e) => setNewOrder({...newOrder, itemName: e.target.value})}
                  className="col-span-3"
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                  className="col-span-3"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total-price" className="text-right">Total Price</Label>
                <Input
                  id="total-price"
                  type="number"
                  step="0.01"
                  value={newOrder.totalPrice}
                  onChange={(e) => setNewOrder({...newOrder, totalPrice: e.target.value})}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddOrder}>Add Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Total Orders Value:</span>
            <span className="text-lg font-bold">${totalOrderValue.toFixed(2)}</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders recorded yet</p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{order.itemName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                  </div>
                  <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};