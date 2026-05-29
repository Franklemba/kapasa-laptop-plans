import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Laptop, CreditCard, Users, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedLaptop {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  weekly_payment: number;
  image_url?: string;
  processor: string;
  ram: string;
  storage: string;
}

const Landing = () => {
  const [featuredLaptops, setFeaturedLaptops] = useState<FeaturedLaptop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedLaptops();
  }, []);

  const fetchFeaturedLaptops = async () => {
    try {
      const { data, error } = await supabase
        .from('laptops')
        .select('id, name, brand, price, original_price, weekly_payment, image_url, processor, ram, storage')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedLaptops(data || []);
    } catch (error) {
      console.error('Error fetching featured laptops:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">fiTech</h1>
          </div>
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/catalog">Browse Laptops</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button size="sm" asChild>
              <Link to="/catalog">Browse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimalistic with Background */}
      <section className="relative overflow-hidden">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&h=1080&fit=crop&q=80"
            alt="Laptop workspace"
            className="w-full h-full object-cover"
            // style={{ filter: 'blur(4px)', transform: 'scale(1.05)' }}
          />
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
          <div className="absolute inset-0 bg-background/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-background/90 backdrop-blur-sm border shadow-sm">
              Flexible Payment Plans
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-foreground drop-shadow-sm">Own Your Dream Laptop</span>
              <span className="block text-primary mt-2 drop-shadow-sm">Pay Weekly</span>
            </h2>
            <p className="text-base md:text-lg text-foreground/90 mb-8 max-w-2xl mx-auto drop-shadow-sm">
              No credit checks. Simple approval. Start with a down payment and pay the rest in affordable weekly installments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 shadow-lg" asChild>
                <Link to="/catalog">
                  Browse Laptops
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-background/90 backdrop-blur-sm hover:bg-background border shadow-sm" asChild>
                <Link to="/register">Start Your Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Laptops Showcase - Scrollable */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Featured Laptops</h3>
              <p className="text-muted-foreground">Quality laptops from trusted brands</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/catalog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] h-[400px] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {featuredLaptops.map((laptop) => {
                  const savings = laptop.original_price ? laptop.original_price - laptop.price : 0;
                  const savingsPercentage = laptop.original_price 
                    ? Math.round((savings / laptop.original_price) * 100) 
                    : 0;

                  return (
                    <Link 
                      key={laptop.id} 
                      to={`/catalog/${laptop.id}`}
                      className="group min-w-[280px] md:min-w-[320px] snap-start"
                    >
                      <Card className="h-full border-2 hover:border-primary transition-all duration-300 hover:shadow-lg overflow-hidden">
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden">
                          <img 
                            src={laptop.image_url || `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop`} 
                            alt={laptop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop';
                            }}
                          />
                          {savingsPercentage > 0 && (
                            <Badge className="absolute top-3 right-3 bg-green-600">
                              Save {savingsPercentage}%
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <CardContent className="p-5">
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">{laptop.brand}</p>
                            <h4 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                              {laptop.name}
                            </h4>
                          </div>

                          {/* Specs */}
                          <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                            <p className="line-clamp-1">{laptop.processor}</p>
                            <p>{laptop.ram} RAM • {laptop.storage}</p>
                          </div>

                          {/* Pricing */}
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-primary">
                                ZMK {laptop.price.toLocaleString()}
                              </span>
                              {laptop.original_price && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ZMK {laptop.original_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary" className="font-normal">
                                ZMK {laptop.weekly_payment.toLocaleString()}/week
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Scroll Indicator */}
              <div className="flex justify-center mt-4 gap-2">
                {featuredLaptops.slice(0, 4).map((_, index) => (
                  <div 
                    key={index} 
                    className="h-1.5 w-8 rounded-full bg-muted"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-6 md:hidden">
            <Button variant="outline" asChild>
              <Link to="/catalog">
                View All Laptops
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-3">How It Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your laptop in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Laptop className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">1. Choose Your Laptop</h4>
              <p className="text-muted-foreground text-sm">
                Browse our selection and find the perfect laptop for your needs
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">2. Set Your Plan</h4>
              <p className="text-muted-foreground text-sm">
                Pay a down payment and choose weekly installments that fit your budget
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">3. Get Your Laptop</h4>
              <p className="text-muted-foreground text-sm">
                Take your laptop home and make manageable weekly payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Minimalistic */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3">Why Choose Us</h3>
              <p className="text-muted-foreground">Simple, transparent, and flexible</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">No Credit Checks</h4>
                <p className="text-sm text-muted-foreground">
                  Simple approval based on your ability to pay
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Flexible Payments</h4>
                <p className="text-sm text-muted-foreground">
                  Weekly installments that fit your budget
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Quality Laptops</h4>
                <p className="text-sm text-muted-foreground">
                  Trusted brands and verified quality
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Trusted Service</h4>
                <p className="text-sm text-muted-foreground">
                  Join hundreds of satisfied customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalistic */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Browse our laptop catalog and find your perfect match today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Browse Laptops
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimalistic */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center space-x-2">
              <Laptop className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">fiTech</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Making technology accessible through flexible payment solutions
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/catalog" className="hover:text-primary transition-colors">
                Catalog
              </Link>
              <span>•</span>
              <Link to="/login" className="hover:text-primary transition-colors">
                Login
              </Link>
              <span>•</span>
              <Link to="/register" className="hover:text-primary transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Landing;
