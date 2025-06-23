
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Search, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  History,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StockMovement {
  id: string;
  laptop_id: string;
  movement_type: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  laptops: {
    name: string;
    brand: string;
    model: string;
    sku: string | null;
  };
}

const StockMovementsHistory = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStockMovements();
  }, []);

  useEffect(() => {
    filterMovements();
  }, [movements, searchTerm, movementTypeFilter, dateFrom, dateTo]);

  const fetchStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          laptops (
            name,
            brand,
            model,
            sku
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      toast({
        title: "Error",
        description: "Failed to load stock movements history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMovements = () => {
    let filtered = movements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.laptops.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.laptops.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.laptops.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.laptops.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Movement type filter
    if (movementTypeFilter !== "all") {
      filtered = filtered.filter(movement => movement.movement_type === movementTypeFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(movement => 
        new Date(movement.created_at) >= dateFrom
      );
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(movement => 
        new Date(movement.created_at) <= endDate
      );
    }

    setFilteredMovements(filtered);
  };

  const getMovementIcon = (movementType: string) => {
    switch (movementType) {
      case 'stock_in':
      case 'returned':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'stock_out':
      case 'sold':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'damaged':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (movementType: string) => {
    const config = {
      stock_in: { variant: "default" as const, label: "Stock In" },
      stock_out: { variant: "destructive" as const, label: "Stock Out" },
      sold: { variant: "destructive" as const, label: "Sold" },
      returned: { variant: "default" as const, label: "Returned" },
      adjustment: { variant: "secondary" as const, label: "Adjustment" },
      damaged: { variant: "outline" as const, label: "Damaged" }
    };

    const { variant, label } = config[movementType as keyof typeof config] || 
      { variant: "outline" as const, label: movementType };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMovementTypeFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Laptop",
      "Movement Type",
      "Quantity",
      "Previous Stock",
      "New Stock",
      "Reason",
      "Reference Number",
      "Notes"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredMovements.map(movement => [
        format(new Date(movement.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${movement.laptops.brand} ${movement.laptops.name}"`,
        movement.movement_type,
        movement.quantity,
        movement.previous_quantity,
        movement.new_quantity,
        `"${movement.reason || ""}"`,
        `"${movement.reference_number || ""}"`,
        `"${movement.notes || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movements-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalMovements = filteredMovements.length;
  const stockInMovements = filteredMovements.filter(m => ['stock_in', 'returned'].includes(m.movement_type)).length;
  const stockOutMovements = filteredMovements.filter(m => ['stock_out', 'sold', 'damaged'].includes(m.movement_type)).length;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <History className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading stock movements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <History className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Stock Movements History</h1>
            </div>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Movements</p>
                <p className="text-2xl font-bold">{totalMovements}</p>
              </div>
              <History className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock In</p>
                <p className="text-2xl font-bold text-green-600">{stockInMovements}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Out</p>
                <p className="text-2xl font-bold text-red-600">{stockOutMovements}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Movement Type</Label>
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stock_in">Stock In</SelectItem>
                  <SelectItem value="stock_out">Stock Out</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements ({filteredMovements.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Laptop</TableHead>
                  <TableHead>Movement</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(movement.created_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(movement.created_at), "HH:mm:ss")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movement.laptops.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.laptops.brand} {movement.laptops.model}
                        </p>
                        {movement.laptops.sku && (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {movement.laptops.sku}
                          </code>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.movement_type)}
                        {getMovementBadge(movement.movement_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{movement.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">{movement.previous_quantity}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{movement.new_quantity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {movement.reason && (
                          <p className="text-sm">{movement.reason}</p>
                        )}
                        {movement.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{movement.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {movement.reference_number && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {movement.reference_number}
                        </code>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No stock movements found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovementsHistory;
