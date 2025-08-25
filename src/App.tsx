import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Counting from "./pages/Counting";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import Groceries from "./pages/Groceries";
// TODO: Create and import Gadgets page when ready
const Gadgets = () => <div className="min-h-screen flex items-center justify-center text-2xl">Gadgets Inventory Coming Soon</div>;
=======
import Gadgets from "./pages/Gadgets";
import Groceries from "./pages/Groceries";
>>>>>>> ccc2d2cb977d9c48a5a5a4d609b0b935d996d8d9

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inventory" element={<Inventory />} />
<<<<<<< HEAD
            <Route path="/inventory/groceries" element={<Groceries />} />
            <Route path="/inventory/gadgets" element={<Gadgets />} />
=======
            <Route path="/gadgets" element={<Gadgets />} />
            <Route path="/groceries" element={<Groceries />} />
>>>>>>> ccc2d2cb977d9c48a5a5a4d609b0b935d996d8d9
            <Route path="/counting" element={<Counting />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
