import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Laptop } from "lucide-react";

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    nationalId: "",
    employmentStatus: "",
    monthlyIncome: "",
    creditScore: "",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          navigate("/login");
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          navigate("/login");
          return;
        }

        console.log('Current user:', user);
        setUser(user);

        // Check if profile already exists
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error checking client profile:', clientError);
        }

        if (clientData) {
          // Profile already exists, redirect to dashboard
          console.log('Profile exists, redirecting to dashboard');
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        toast({ 
          title: "Error", 
          description: "User not authenticated.", 
          variant: "destructive" 
        });
        navigate("/login");
        return;
      }

      console.log('Attempting to create client profile for user:', user.id);
      console.log('User email:', user.email);

      // Insert client profile with the authenticated user's ID
      const { data, error } = await supabase.from("clients").insert({
        user_id: user.id,
        email: user.email || "",
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        address: formData.address || null,
        national_id: formData.nationalId || null,
        employment_status: formData.employmentStatus || null,
        monthly_income: formData.monthlyIncome ? Number(formData.monthlyIncome) : null,
        credit_score: formData.creditScore ? Number(formData.creditScore) : null,
        status: "active",
        notes: formData.notes || null,
      }).select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Client profile created successfully:', data);

      toast({ 
        title: "Profile completed!", 
        description: "Welcome to Uncle Kapasa's!" 
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Complete profile error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save profile", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Uncle Kapasa's</h1>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your information to get started with your laptop payment plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                placeholder="Enter your national ID number"
                value={formData.nationalId}
                onChange={(e) => handleInputChange("nationalId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select onValueChange={(value) => handleInputChange("employmentStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score (300-850)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="Enter credit score"
                  value={formData.creditScore}
                  onChange={(e) => handleInputChange("creditScore", e.target.value)}
                  min="300"
                  max="850"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving Profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
