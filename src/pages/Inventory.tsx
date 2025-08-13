import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  shelf: string;
  currentStock: number;
  lastCounted: string;
}

const SHELVES = [
  { id: "left-shelf", name: "Left Shelf" },
  { id: "big-deep", name: "Big Deep" },
  { id: "center-rack", name: "Center Rack" },
  { id: "storage-room", name: "Storage Room" },
];

const CATEGORIES = [
  "Electronics", "Clothing", "Books", "Food", "Tools", "Other"
];

// Mock data
const mockInventory: InventoryItem[] = [
  { id: "1", name: "Wireless Headphones", price: 89.99, category: "Electronics", shelf: "left-shelf", currentStock: 15, lastCounted: "2024-01-10" },
  { id: "2", name: "Cotton T-Shirt", price: 24.99, category: "Clothing", shelf: "center-rack", currentStock: 50, lastCounted: "2024-01-08" },
  { id: "3", name: "Notebook Set", price: 12.50, category: "Books", shelf: "big-deep", currentStock: 30, lastCounted: "2024-01-09" },
  { id: "4", name: "Protein Bars", price: 3.99, category: "Food", shelf: "storage-room", currentStock: 100, lastCounted: "2024-01-07" },
];

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<string>("all");
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    shelf: "",
    currentStock: ""
  });

  const filteredItems = selectedShelf === "all" 
    ? items 
    : items.filter(item => item.shelf === selectedShelf);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.shelf) return;
    
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      shelf: newItem.shelf,
      currentStock: parseInt(newItem.currentStock) || 0,
      lastCounted: new Date().toISOString().split('T')[0]
    };
    
    setItems([...items, item]);
    setNewItem({ name: "", price: "", category: "", shelf: "", currentStock: "" });
    setIsDialogOpen(false);
  };

  const getShelfName = (shelfId: string) => {
    return SHELVES.find(shelf => shelf.id === shelfId)?.name || shelfId;
  };

  const totalValue = filteredItems.reduce((sum, item) => sum + (item.price * item.currentStock), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground">Manage your items and pricing</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Select onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shelf" className="text-right">Shelf</Label>
                  <Select onValueChange={(value) => setNewItem({...newItem, shelf: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select shelf" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHELVES.map(shelf => (
                        <SelectItem key={shelf.id} value={shelf.id}>{shelf.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({...newItem, currentStock: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={selectedShelf} onValueChange={setSelectedShelf}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shelves</SelectItem>
              {SHELVES.map(shelf => (
                <SelectItem key={shelf.id} value={shelf.id}>{shelf.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Card className="flex-1">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold">{filteredItems.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {filteredItems.map(item => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant="outline">{getShelfName(item.shelf)}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-semibold">{item.currentStock}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold">${(item.price * item.currentStock).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last Counted</p>
                    <p className="text-sm">{item.lastCounted}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;