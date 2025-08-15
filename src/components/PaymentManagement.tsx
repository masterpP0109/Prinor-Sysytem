import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CreditCard, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentMethod: "cash",
    referenceNumber: "",
    notes: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount) {
      toast({
        title: "Error",
        description: "Please enter payment amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          amount: parseFloat(newPayment.amount),
          payment_method: newPayment.paymentMethod,
          reference_number: newPayment.referenceNumber,
          notes: newPayment.notes,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully"
      });

      setNewPayment({ amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
      setIsDialogOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments Management
          </CardTitle>
          <CardDescription>Track payments received</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>Add a payment received from customers</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-method" className="text-right">Method</Label>
                <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({...newPayment, paymentMethod: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">Reference</Label>
                <Input
                  id="reference"
                  value={newPayment.referenceNumber}
                  onChange={(e) => setNewPayment({...newPayment, referenceNumber: e.target.value})}
                  className="col-span-3"
                  placeholder="Transaction reference (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-notes" className="text-right">Notes</Label>
                <Input
                  id="payment-notes"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                  className="col-span-3"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPayment}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Total Payments:</span>
            <span className="text-lg font-bold text-green-600">${totalPayments.toFixed(2)}</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">${payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{payment.payment_method}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};