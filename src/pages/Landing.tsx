import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Laptop, CreditCard, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Uncle Kapasa's Laptops</h1>
          </div>
          <div className="space-x-4">
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Own Your Dream Laptop with <span className="text-primary">Flexible Payment Plans</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get the laptop you need today and pay in affordable installments. No credit checks, just simple and transparent payment plans.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <Link to="/catalog">Browse Laptops</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
            <Link to="/register">Start Your Plan</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Laptop className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Choose Your Laptop</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse our selection of quality laptops and find the perfect one for your needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Set Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pay a deposit and choose weekly, bi-weekly, or monthly payments that fit your budget.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Get Your Laptop</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Take your laptop home immediately and enjoy making manageable payments over time.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Choose Uncle Kapasa's?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">No Credit Checks</h4>
                    <p className="text-muted-foreground">Simple approval process based on your ability to pay.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Flexible Payment Options</h4>
                    <p className="text-muted-foreground">Choose weekly, bi-weekly, or monthly payments that work for you.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Quality Laptops</h4>
                    <p className="text-muted-foreground">Carefully selected laptops from trusted brands.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Transparent Process</h4>
                    <p className="text-muted-foreground">No hidden fees, clear terms, and easy tracking.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 p-8 rounded-lg">
              <div className="text-center">
                <Users className="h-16 w-16 text-primary mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-2">Trusted by 500+ Customers</h4>
                <p className="text-muted-foreground mb-6">
                  Join hundreds of satisfied customers who got their laptops through our payment plans.
                </p>
                <Button asChild>
                  <Link to="/register">Join Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Uncle Kapasa's Laptops</h1>
          </div>
          <p className="text-muted-foreground">
            Making technology accessible through flexible payment solutions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
