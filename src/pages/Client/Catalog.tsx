
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Laptop, Search, Filter, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LaptopCard } from "@/components/LaptopCard";
import { fetchLaptops, searchLaptops, Laptop as LaptopType } from "@/services/laptopService";
import { useToast } from "@/hooks/use-toast";

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [laptops, setLaptops] = useState<LaptopType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadLaptops();
  }, []);

  const loadLaptops = async () => {
    try {
      setLoading(true);
      const data = await fetchLaptops();
      setLaptops(data);
    } catch (error) {
      console.error('Error loading laptops:', error);
      toast({
        title: "Error",
        description: "Failed to load laptops. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await searchLaptops(searchTerm, priceFilter);
      setLaptops(data);
    } catch (error) {
      console.error('Error searching laptops:', error);
      toast({
        title: "Error",
        description: "Failed to search laptops. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, priceFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Laptop Catalog</h1>
            </div>
          </div>
          <Badge variant="secondary">{laptops.length} laptops</Badge>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search laptops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Price Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={priceFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("all")}
            className="whitespace-nowrap"
          >
            All Prices
          </Button>
          <Button
            variant={priceFilter === "budget" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("budget")}
            className="whitespace-nowrap"
          >
            Under ZMK 4000
          </Button>
          <Button
            variant={priceFilter === "mid" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("mid")}
            className="whitespace-nowrap"
          >
            ZMK 4000 - ZMK 6500
          </Button>
          <Button
            variant={priceFilter === "premium" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("premium")}
            className="whitespace-nowrap"
          >
            ZMK 6500+
          </Button>
        </div>
      </div>

      {/* Laptop Grid */}
      <div className="px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-48"></div>
            ))}
          </div>
        ) : laptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {laptops.map((laptop) => (
              <LaptopCard key={laptop.id} laptop={laptop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Laptop className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No laptops found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setPriceFilter("all");
              loadLaptops();
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation Space */}
      <div className="h-20" />
    </div>
  );
};

export default Catalog;
