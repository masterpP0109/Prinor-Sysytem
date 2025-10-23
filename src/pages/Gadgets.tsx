import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Package, ArrowLeft, Trash2, Smartphone, Cpu, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import { getItems, addItem, updateItem, deleteItem, getShelves, addShelf } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface GadgetItem {
  id: string;
  shelfId: string;
  name: string;
  initialQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;
  price: number;
  createdAt: string;
}

interface Shelf {
  id: string;
  name: string;
  createdAt: string;
}

const Gadgets = () => {
  const [items, setItems] = useState<GadgetItem[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GadgetItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    shelf: ""
  });

  const [newShelf, setNewShelf] = useState({
    name: "",
    description: ""
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

      // Fetch all items and filter for gadget-related ones
      const allItems = getItems();
      const gadgetKeywords = ['phone', 'laptop', 'tablet', 'headphone', 'camera', 'watch', 'electronic', 'gadget', 'tech', 'computer', 'speaker', 'mouse', 'keyboard'];
      const gadgetItems = allItems.filter(item => {
        const itemName = item.name?.toLowerCase() || '';
        return gadgetKeywords.some(keyword => itemName.includes(keyword));
      });

      setItems(gadgetItems);

      // Fetch shelves
      const shelvesData = getShelves();
      setShelves(shelvesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load gadgets data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      addItem({
        shelfId: newItem.shelf || "",
        name: newItem.name,
        initialQuantity: 1,
        soldQuantity: 0,
        remainingQuantity: 1,
        price: parseFloat(newItem.price)
      });

      toast({
        title: "Success",
        description: "Gadget added successfully"
      });

      setNewItem({ name: "", price: "", description: "", shelf: "" });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding gadget:', error);
      toast({
        title: "Error",
        description: "Failed to add gadget",
        variant: "destructive"
      });
    }
  };

  const handleAddShelf = () => {
    if (!newShelf.name) {
      toast({
        title: "Error",
        description: "Shelf name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      addShelf(newShelf.name);

      toast({
        title: "Success",
        description: "Gadget shelf added successfully"
      });

      setNewShelf({ name: "", description: "" });
      setIsShelfDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding shelf:', error);
      toast({
        title: "Error",
        description: "Failed to add shelf",
        variant: "destructive"
      });
    }
  };

  const handleEditSave = () => {
    if (!editItem) return;

    try {
      updateItem(editItem.id, {
        name: editItem.name,
        price: editItem.price
      });

      toast({
        title: "Success",
        description: "Gadget updated successfully"
      });

      setEditDialogOpen(false);
      setEditItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating gadget:', error);
      toast({
        title: "Error",
        description: "Failed to update gadget",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    try {
      deleteItem(id);

      toast({
        title: "Success",
        description: "Gadget deleted successfully"
      });

      setEditDialogOpen(false);
      setEditItem(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting gadget:', error);
      toast({
        title: "Error",
        description: "Failed to delete gadget",
        variant: "destructive"
      });
    }
  };

  const filteredItems = useMemo(() => {
    if (selectedShelf === "all") return items;
    return items.filter(item => item.shelfId === selectedShelf);
  }, [items, selectedShelf]);

  const totalValue = filteredItems.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading gadgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-blue-100/30">
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
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                <Smartphone className="h-8 w-8 text-blue-600" />
                Gadgets & Electronics
              </h1>
              <p className="text-muted-foreground">Manage your tech inventory</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isShelfDialogOpen} onOpenChange={setIsShelfDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Add Shelf
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Gadget Shelf</DialogTitle>
                  <DialogDescription>Create a new shelf for organizing gadgets</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shelf-name" className="text-right">Name</Label>
                    <Input
                      id="shelf-name"
                      value={newShelf.name}
                      onChange={(e) => setNewShelf({...newShelf, name: e.target.value})}
                      className="col-span-3"
                      placeholder="e.g., Electronics Display"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shelf-description" className="text-right">Description</Label>
                    <Input
                      id="shelf-description"
                      value={newShelf.description}
                      onChange={(e) => setNewShelf({...newShelf, description: e.target.value})}
                      className="col-span-3"
                      placeholder="e.g., Phones and accessories"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddShelf}>Add Shelf</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Gadget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Gadget</DialogTitle>
                  <DialogDescription>Add a new gadget to your tech inventory</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="col-span-3"
                      placeholder="e.g., iPhone 15, MacBook Pro"
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
                      placeholder="999.99"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="col-span-3"
                      placeholder="Product details and specifications"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddItem}>Add Gadget</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total Gadgets</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{filteredItems.length}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Total Value</CardTitle>
              <Cpu className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Gadget Shelves</CardTitle>
              <Monitor className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{shelves.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter by Shelf */}
        <div className="flex gap-4 mb-6">
          <Select value={selectedShelf} onValueChange={setSelectedShelf}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shelves</SelectItem>
              {shelves.map(shelf => (
                <SelectItem key={shelf.id} value={shelf.name}>{shelf.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid gap-4">
          {filteredItems.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No gadgets found</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first gadget to get started
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Gadget
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.remainingQuantity}</p>
                      <Badge variant="secondary" className="mt-1">Gadget</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold text-blue-700">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Added</p>
                      <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setEditItem(item); setEditDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Gadget</DialogTitle>
              <DialogDescription>Modify gadget details</DialogDescription>
            </DialogHeader>
            {editItem && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input
                    id="edit-name"
                    value={editItem.name}
                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editItem.price}
                    onChange={e => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditSave}>Save Changes</Button>
              {editItem && (
                <Button variant="destructive" onClick={() => handleDeleteItem(editItem.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gadgets;