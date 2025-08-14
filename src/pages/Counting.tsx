import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardCheck, Package, Save, ArrowLeft, CheckCircle, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CountItem {
  id: string;
  name: string;
  price: number;
  shelf: string;
  initialCount: number;
  countedQuantity: number | null;
  isCounted: boolean;
}

interface Shelf {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// Mock counting data
const mockCountData: CountItem[] = [
  { id: "1", name: "Wireless Headphones", price: 89.99, shelf: "left-shelf", initialCount: 15, countedQuantity: null, isCounted: false },
  { id: "2", name: "Bluetooth Speaker", price: 45.00, shelf: "left-shelf", initialCount: 8, countedQuantity: null, isCounted: false },
  { id: "3", name: "Cotton T-Shirt", price: 24.99, shelf: "center-rack", initialCount: 50, countedQuantity: null, isCounted: false },
  { id: "4", name: "Jeans", price: 59.99, shelf: "center-rack", initialCount: 25, countedQuantity: null, isCounted: false },
  { id: "5", name: "Notebook Set", price: 12.50, shelf: "big-deep", initialCount: 30, countedQuantity: null, isCounted: false },
  { id: "6", name: "Pens (Pack)", price: 8.99, shelf: "big-deep", initialCount: 45, countedQuantity: null, isCounted: false },
];

const Counting = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>("");
  const [countData, setCountData] = useState<CountItem[]>(mockCountData);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchShelves();
  }, [user, navigate]);

  const fetchShelves = async () => {
    try {
      const { data, error } = await supabase
        .from('shelves')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setShelves(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shelves",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddShelf = async () => {
    if (!newShelfName.trim()) {
      toast({
        title: "Error",
        description: "Shelf name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('shelves')
        .insert({
          user_id: user?.id,
          name: newShelfName.trim(),
          description: newShelfDescription.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shelf added successfully"
      });

      setNewShelfName("");
      setNewShelfDescription("");
      setShowAddDialog(false);
      fetchShelves();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add shelf",
        variant: "destructive"
      });
    }
  };

  const currentShelfItems = countData.filter(item => item.shelf === selectedShelf);
  const totalItems = currentShelfItems.length;
  const countedItems = currentShelfItems.filter(item => item.isCounted).length;
  const progress = totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

  const handleCountChange = (itemId: string, count: string) => {
    const quantity = count === "" ? null : parseInt(count);
    setCountData(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, countedQuantity: quantity, isCounted: quantity !== null }
          : item
      )
    );
  };

  const handleSaveCount = () => {
    const unfinishedItems = currentShelfItems.filter(item => !item.isCounted);
    if (unfinishedItems.length > 0) {
      toast({
        title: "Incomplete Count",
        description: `Please count all ${unfinishedItems.length} remaining items before saving.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Count Saved",
      description: `Successfully saved count for ${getShelfName(selectedShelf)}`,
    });
  };

  const getShelfName = (shelfId: string) => {
    return shelves.find(shelf => shelf.id === shelfId)?.name || shelfId;
  };

  const getShelfDescription = (shelfId: string) => {
    return shelves.find(shelf => shelf.id === shelfId)?.description || "";
  };

  const calculateVariance = (item: CountItem) => {
    if (item.countedQuantity === null) return 0;
    return item.countedQuantity - item.initialCount;
  };

  const calculateValueDifference = (item: CountItem) => {
    const variance = calculateVariance(item);
    return variance * item.price;
  };

  const totalValueDifference = currentShelfItems.reduce((sum, item) => {
    return sum + calculateValueDifference(item);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading shelves...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold">Stock Counting</h1>
              <p className="text-muted-foreground">Count inventory by shelf location</p>
            </div>
          </div>
          {!selectedShelf && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                    Create a new shelf location for organizing your inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shelf-name">Shelf Name</Label>
                    <Input
                      id="shelf-name"
                      value={newShelfName}
                      onChange={(e) => setNewShelfName(e.target.value)}
                      placeholder="e.g., Left Shelf, Storage Room"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shelf-description">Description (Optional)</Label>
                    <Input
                      id="shelf-description"
                      value={newShelfDescription}
                      onChange={(e) => setNewShelfDescription(e.target.value)}
                      placeholder="e.g., Electronics and accessories"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddShelf}>
                      Add Shelf
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!selectedShelf ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Shelf to Count</CardTitle>
                <CardDescription>Choose which shelf or location you want to count</CardDescription>
              </CardHeader>
            </Card>
            
            {shelves.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No shelves found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first shelf to start organizing your inventory
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Shelf
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shelves.map(shelf => (
                  <Card key={shelf.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedShelf(shelf.id)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {shelf.name}
                      </CardTitle>
                      <CardDescription>{shelf.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {mockCountData.filter(item => item.shelf === shelf.id).length} items
                        </span>
                        <Button>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Start Counting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {getShelfName(selectedShelf)}
                    </CardTitle>
                    <CardDescription>{getShelfDescription(selectedShelf)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedShelf("")}>
                      Change Shelf
                    </Button>
                    <Button onClick={handleSaveCount} disabled={progress < 100}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Count
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress: {countedItems} of {totalItems} items</p>
                    <Progress value={progress} className="w-64 mt-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Value Difference</p>
                    <p className={`text-lg font-semibold ${totalValueDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalValueDifference >= 0 ? '+' : ''}${totalValueDifference.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {currentShelfItems.map(item => (
                <Card key={item.id} className={item.isCounted ? "border-green-200 bg-green-50/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {item.isCounted && <CheckCircle className="h-5 w-5 text-green-600" />}
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <Label className="text-xs text-muted-foreground">Initial Count</Label>
                          <p className="font-semibold">{item.initialCount}</p>
                        </div>
                        
                        <div className="text-center min-w-[100px]">
                          <Label htmlFor={`count-${item.id}`} className="text-xs text-muted-foreground">Counted</Label>
                          <Input
                            id={`count-${item.id}`}
                            type="number"
                            min="0"
                            value={item.countedQuantity?.toString() || ""}
                            onChange={(e) => handleCountChange(item.id, e.target.value)}
                            className="mt-1 text-center"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="text-center min-w-[80px]">
                          <Label className="text-xs text-muted-foreground">Variance</Label>
                          <p className={`font-semibold ${
                            calculateVariance(item) > 0 ? 'text-green-600' : 
                            calculateVariance(item) < 0 ? 'text-red-600' : 
                            'text-muted-foreground'
                          }`}>
                            {calculateVariance(item) > 0 ? '+' : ''}{calculateVariance(item)}
                          </p>
                        </div>
                        
                        <div className="text-center min-w-[100px]">
                          <Label className="text-xs text-muted-foreground">Value Diff</Label>
                          <p className={`font-semibold ${
                            calculateValueDifference(item) > 0 ? 'text-green-600' : 
                            calculateValueDifference(item) < 0 ? 'text-red-600' : 
                            'text-muted-foreground'
                          }`}>
                            {calculateValueDifference(item) > 0 ? '+' : ''}${calculateValueDifference(item).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Counting;