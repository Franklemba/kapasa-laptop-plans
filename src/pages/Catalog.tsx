
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Laptop, Search, Filter, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LaptopCard } from "@/components/LaptopCard";
import { laptopData } from "@/data/laptops";

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const navigate = useNavigate();

  const filteredLaptops = laptopData.filter(laptop => {
    const matchesSearch = laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         laptop.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "budget" && laptop.price <= 800) ||
                        (priceFilter === "mid" && laptop.price > 800 && laptop.price <= 1500) ||
                        (priceFilter === "premium" && laptop.price > 1500);
                        
    return matchesSearch && matchesPrice;
  });

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
          <Badge variant="secondary">{filteredLaptops.length} laptops</Badge>
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
            Under $800
          </Button>
          <Button
            variant={priceFilter === "mid" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("mid")}
            className="whitespace-nowrap"
          >
            $800 - $1500
          </Button>
          <Button
            variant={priceFilter === "premium" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceFilter("premium")}
            className="whitespace-nowrap"
          >
            $1500+
          </Button>
        </div>
      </div>

      {/* Laptop Grid */}
      <div className="px-4 pb-20">
        {filteredLaptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLaptops.map((laptop) => (
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
