
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Cpu, HardDrive, Monitor, MemoryStick, Wifi, Battery, Camera, Volume2, Share, Heart } from "lucide-react";
import { laptopData } from "@/data/laptops";
import PaymentPlanCalculator from "@/components/PaymentPlanCalculator";

const LaptopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  
  const laptop = laptopData.find(l => l.id === id);
  
  if (!laptop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Laptop not found</h2>
          <Button onClick={() => navigate("/catalog")}>Back to Catalog</Button>
        </div>
      </div>
    );
  }

  const savings = laptop.originalPrice ? laptop.originalPrice - laptop.price : 0;
  const savingsPercentage = laptop.originalPrice ? Math.round((savings / laptop.originalPrice) * 100) : 0;

  const images = [
    `https://images.unsplash.com/${laptop.image}?w=600&h=400&fit=crop`,
    `https://images.unsplash.com/${laptop.image}?w=600&h=400&fit=crop&sat=2`,
    `https://images.unsplash.com/${laptop.image}?w=600&h=400&fit=crop&brightness=1.1`,
  ];

  const handleApplyForPlan = (weeklyPayment?: number, downPayment?: number, loanTerm?: number) => {
    const params = new URLSearchParams();
    if (weeklyPayment) params.set('weeklyPayment', weeklyPayment.toString());
    if (downPayment) params.set('downPayment', downPayment.toString());
    if (loanTerm) params.set('loanTerm', loanTerm.toString());
    
    navigate(`/catalog/${id}/apply?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="pb-24">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={laptop.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  selectedImage === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <Badge 
              variant={laptop.condition === "new" ? "default" : "secondary"}
              className="text-xs"
            >
              {laptop.condition === "new" ? "New" : laptop.condition === "refurbished" ? "Refurbished" : "Used"}
            </Badge>
            {savings > 0 && (
              <Badge variant="destructive" className="text-xs">
                Save {savingsPercentage}%
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-6">
          {/* Title and Rating */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {laptop.brand} {laptop.name}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{laptop.rating}</span>
                <span className="text-muted-foreground">({laptop.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-primary">
                    K{laptop.price.toLocaleString()}
                  </span>
                  {laptop.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      K{laptop.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <Badge variant="destructive">
                    Save K{savings}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                or K{laptop.weeklyPayment}/week with our payment plan
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="w-full"
                  onClick={() => handleApplyForPlan()}
                >
                  Start Payment Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCalculator(!showCalculator)}
                >
                  {showCalculator ? "Hide" : "Calculate"} Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Plan Calculator */}
          {showCalculator && (
            <PaymentPlanCalculator 
              laptopPrice={laptop.price}
              laptopName={`${laptop.brand} ${laptop.name}`}
            />
          )}

          {/* Key Specifications */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Key Specifications</h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Processor</span>
                  </div>
                  <span className="text-sm font-medium">{laptop.processor}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Memory</span>
                  </div>
                  <span className="text-sm font-medium">{laptop.ram}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <span className="text-sm font-medium">{laptop.storage}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Display</span>
                  </div>
                  <span className="text-sm font-medium">{laptop.display}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Features</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span>Wi-Fi 6</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Battery className="h-4 w-4 text-green-500" />
                  <span>10+ hours battery</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="h-4 w-4 text-green-500" />
                  <span>HD Webcam</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Volume2 className="h-4 w-4 text-green-500" />
                  <span>Premium Audio</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The {laptop.brand} {laptop.name} delivers exceptional performance and portability. 
                Perfect for work, study, and entertainment, this laptop combines powerful hardware 
                with sleek design. With our flexible payment plans, you can get the laptop you need 
                without breaking the bank.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1">
            Add to Wishlist
          </Button>
          <Button 
            className="flex-2"
            onClick={() => handleApplyForPlan()}
          >
            Apply for Payment Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaptopDetails;
