
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Laptop, 
  ArrowLeft, 
  Search, 
  Edit, 
  Package, 
  AlertTriangle,
  Plus,
  Minus,
  BarChart3,
  Filter
} from "lucide-react";

interface Laptop {
  id: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
  condition: string;
  status: string;
  created_at: string;
}

const InventoryManagement = () => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [filteredLaptops, setFilteredLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLaptops();
  }, []);

  useEffect(() => {
    filterLaptops();
  }, [laptops, searchTerm, statusFilter, stockFilter]);

  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase
        .from("laptops")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLaptops(data || []);
    } catch (error) {
      console.error("Error fetching laptops:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLaptops = () => {
    let filtered = laptops;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(laptop =>
        laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laptop.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laptop.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laptop.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(laptop => laptop.status === statusFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(laptop => laptop.stock_quantity <= laptop.min_stock_level);
    } else if (stockFilter === "out") {
      filtered = filtered.filter(laptop => laptop.stock_quantity === 0);
    }

    setFilteredLaptops(filtered);
  };

  const updateStock = async (laptopId: string, newQuantity: number, movementType: string) => {
    try {
      const laptop = laptops.find(l => l.id === laptopId);
      if (!laptop) return;

      const quantityDiff = newQuantity - laptop.stock_quantity;
      
      const { error } = await supabase.rpc('update_laptop_stock', {
        p_laptop_id: laptopId,
        p_movement_type: movementType,
        p_quantity: Math.abs(quantityDiff),
        p_reason: `Manual adjustment from ${laptop.stock_quantity} to ${newQuantity}`,
        p_notes: 'Admin inventory adjustment'
      });

      if (error) throw error;

      toast({
        title: "Stock Updated",
        description: `Stock updated to ${newQuantity} units`,
        variant: "default"
      });

      fetchLaptops();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (laptop: Laptop) => {
    if (laptop.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (laptop.stock_quantity <= laptop.min_stock_level) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>;
    } else {
      return <Badge variant="secondary">In Stock</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'discontinued':
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalItems = laptops.length;
  const lowStockItems = laptops.filter(l => l.stock_quantity <= l.min_stock_level).length;
  const outOfStockItems = laptops.filter(l => l.stock_quantity === 0).length;
  const totalValue = laptops.reduce((sum, laptop) => sum + (laptop.price * laptop.stock_quantity), 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Package className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading inventory...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Inventory Management</h1>
            </div>
          </div>
          <Button onClick={() => navigate("/add-laptop")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Laptop
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <Minus className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">ZMK {totalValue.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, brand, model, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label>Stock Level</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setStockFilter("all");
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laptop Inventory ({filteredLaptops.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLaptops.map((laptop) => (
                  <TableRow key={laptop.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{laptop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {laptop.brand} {laptop.model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {laptop.sku || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>ZMK {laptop.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{laptop.stock_quantity}</span>
                        <span className="text-xs text-muted-foreground">
                          (min: {laptop.min_stock_level})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(laptop.status)}</TableCell>
                    <TableCell>{getStockStatus(laptop)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StockAdjustment
                          laptop={laptop}
                          onUpdate={(newQuantity, movementType) => 
                            updateStock(laptop.id, newQuantity, movementType)
                          }
                        />
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLaptops.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No laptops found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
};

// Stock Adjustment Component
interface StockAdjustmentProps {
  laptop: Laptop;
  onUpdate: (newQuantity: number, movementType: string) => void;
}

const StockAdjustment = ({ laptop, onUpdate }: StockAdjustmentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(laptop.stock_quantity);

  const handleSave = () => {
    const movementType = newQuantity > laptop.stock_quantity ? 'stock_in' : 'stock_out';
    onUpdate(newQuantity, movementType);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewQuantity(laptop.stock_quantity);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <Input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
          className="w-20 h-8"
          min="0"
        />
        <Button size="sm" onClick={handleSave} className="h-8 px-2">
          ✓
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 px-2">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setIsEditing(true)}
      className="h-8 px-2"
    >
      <Package className="h-4 w-4" />
    </Button>
  );
};

export default InventoryManagement;
