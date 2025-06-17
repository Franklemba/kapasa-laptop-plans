
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Cpu, HardDrive, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

interface LaptopCardProps {
  laptop: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    processor: string;
    ram: string;
    storage: string;
    display: string;
    condition: "new" | "refurbished" | "used";
    weeklyPayment: number;
  };
}

export const LaptopCard = ({ laptop }: LaptopCardProps) => {
  const savings = laptop.originalPrice ? laptop.originalPrice - laptop.price : 0;
  const savingsPercentage = laptop.originalPrice ? Math.round((savings / laptop.originalPrice) * 100) : 0;

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
      <div className="relative">
        <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden">
          <img
            src={`https://images.unsplash.com/${laptop.image}?w=400&h=300&fit=crop`}
            alt={laptop.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Condition Badge */}
        <Badge 
          variant={laptop.condition === "new" ? "default" : "secondary"}
          className="absolute top-2 left-2 text-xs"
        >
          {laptop.condition === "new" ? "New" : laptop.condition === "refurbished" ? "Refurbished" : "Used"}
        </Badge>

        {/* Discount Badge */}
        {savings > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
            Save {savingsPercentage}%
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
              {laptop.brand} {laptop.name}
            </CardTitle>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {laptop.rating} ({laptop.reviewCount})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{laptop.processor}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{laptop.ram} RAM</span>
          </div>
          <div className="flex items-center space-x-1">
            <Monitor className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{laptop.display}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{laptop.storage}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">
              K{laptop.price.toLocaleString()}
            </span>
            {laptop.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                K{laptop.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            or K{laptop.weeklyPayment}/week
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/catalog/${laptop.id}`}>
              View Details
            </Link>
          </Button>
          <Button size="sm" className="flex-1" asChild>
            <Link to={`/apply/${laptop.id}`}>
              Start Plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
