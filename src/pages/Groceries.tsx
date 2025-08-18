
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

function loadInventory() {
  try {
    const data = localStorage.getItem("countedInventory");
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

const groceriesKeywords = [
  'food', 'drink', 'milk', 'bread', 'fruit', 'vegetable', 'meat', 'grocery', 'snack',
  'rice', 'oil', 'flour', 'egg', 'juice', 'water', 'cereal', 'sugar', 'salt', 'spice', 'tea', 'coffee', 'butter', 'cheese', 'yogurt', 'biscuit', 'cookie', 'chips', 'soda', 'beverage', 'produce', 'dairy', 'bakery', 'frozen', 'pantry', 'condiment', 'sauce', 'soup', 'canned', 'grain', 'bean', 'nut', 'seed', 'honey', 'jam', 'jelly', 'spread', 'pasta', 'noodle', 'vegetables', 'fruits', 'snacks', 'groceries'
];

const Groceries = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const all = loadInventory();
    // Filter for groceries by name or category
    const groceries = all.filter(item => {
      const name = (item.name || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      return groceriesKeywords.some(k => name.includes(k)) || category.includes("grocery") || category.includes("groceries");
    });
    setItems(groceries);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Groceries Inventory</h1>
              <p className="text-muted-foreground">All items categorized as groceries</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>No groceries found</CardTitle>
              <CardDescription>Add groceries in inventory management or counting</CardDescription>
            </CardHeader>
            <CardContent>
              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>Shelf: {item.shelfName || item.shelf}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Stock: {item.currentStock ?? 0}</span>
                    <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groceries;
