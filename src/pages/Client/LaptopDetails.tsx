import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Cpu, HardDrive, Monitor, Zap } from "lucide-react";
import PaymentPlanCalculator from "@/components/PaymentPlanCalculator";
import { fetchLaptopById, Laptop } from "@/services/laptopService";
import { useToast } from "@/hooks/use-toast";

const LaptopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState({
    weeklyPayment: "0",
    downPayment: "0",
    loanTerm: "52"
  });

  useEffect(() => {
    if (id) {
      loadLaptop(id);
    }
  }, [id]);

  const loadLaptop = async (laptopId: string) => {
    try {
      setLoading(true);
      const data = await fetchLaptopById(laptopId);
      if (data) {
        setLaptop(data);
        setSelectedPlan(prev => ({
          ...prev,
          weeklyPayment: data.weekly_payment.toString()
        }));
      } else {
        toast({
          title: "Laptop not found",
          description: "The requested laptop could not be found.",
          variant: "destructive"
        });
        navigate("/catalog");
      }
    } catch (error) {
      console.error('Error loading laptop:', error);
      toast({
        title: "Error",
        description: "Failed to load laptop details.",
        variant: "destructive"
      });
      navigate("/catalog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Loading...</h1>
            <div></div>
          </div>
        </header>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg h-64 mb-4"></div>
            <div className="bg-muted rounded h-6 w-3/4 mb-2"></div>
            <div className="bg-muted rounded h-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

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

  const handleApplyForPlan = () => {
    const params = new URLSearchParams();
    params.set('weeklyPayment', selectedPlan.weeklyPayment);
    params.set('downPayment', selectedPlan.downPayment);
    params.set('loanTerm', selectedPlan.loanTerm);
    
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
          <h1 className="text-lg font-semibold">Laptop Details</h1>
          <div></div>
        </div>
      </header>

      <div className="p-4 pb-24 max-w-2xl mx-auto">
        {/* Hero Image */}
        <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 mb-6">
          <img
            src={laptop.image_url || `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=450&fit=crop`}
            alt={laptop.name}
            className="w-full h-full object-cover"
          />
          {laptop.condition === "refurbished" && (
            <Badge 
              variant="secondary" 
              className="absolute top-4 left-4 bg-blue-100 text-blue-800"
            >
              Refurbished
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{laptop.rating || 4.5}</span>
              <span className="text-muted-foreground">({laptop.review_count || 0} reviews)</span>
            </div>
            
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold">K{laptop.price.toLocaleString()}</span>
              {laptop.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  K{laptop.original_price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-primary font-medium">
              From K{laptop.weekly_payment}/week
            </p>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Cpu className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Processor</p>
                  <p className="text-sm text-muted-foreground">{laptop.processor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-muted-foreground">{laptop.storage}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">RAM</p>
                  <p className="text-sm text-muted-foreground">{laptop.ram}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Display</p>
                  <p className="text-sm text-muted-foreground">{laptop.display}</p>
                </div>
              </div>
              {laptop.graphics && (
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Graphics</p>
                    <p className="text-sm text-muted-foreground">{laptop.graphics}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <PaymentPlanCalculator
          laptopPrice={laptop.price}
          laptopName={`${laptop.brand} ${laptop.name}`}
        />

        {laptop.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{laptop.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 max-w-2xl mx-auto">
        <Button className="w-full" size="lg" onClick={handleApplyForPlan}>
          Apply for Payment Plan - K{selectedPlan.weeklyPayment}/week
        </Button>
      </div>
    </div>
  );
};

export default LaptopDetails;