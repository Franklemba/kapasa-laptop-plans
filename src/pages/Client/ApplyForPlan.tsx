
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { laptopData } from "@/data/laptops";
import { useToast } from "@/hooks/use-toast";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useClientProfile } from "@/hooks/useClientProfile";
import { LoadingScreen } from "@/components/client/LoadingScreen";
import { LaptopSummaryCard } from "@/components/client/LaptopSummaryCard";
import { ProfileNotice } from "@/components/client/ProfileNotice";
import { PersonalInfoSection } from "@/components/client/PersonalInfoSection";
import { AddressInfoSection } from "@/components/client/AddressInfoSection";
import { EmploymentDetailsSection } from "@/components/client/EmploymentDetailsSection";
import { FinancialInfoSection } from "@/components/client/FinancialInfoSection";
import { AdditionalInfoSection } from "@/components/client/AdditionalInfoSection";
import { TermsAgreementSection } from "@/components/client/TermsAgreementSection";
import { submitPaymentPlanApplication, PaymentPlanApplicationData } from "@/services/paymentPlanService";

const ApplyForPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Authentication and profile loading
  const { user, isLoading: authLoading } = useAuthCheck();
  const { profile, isLoading: profileLoading, error: profileError } = useClientProfile(user?.id || null);
  
  const laptop = laptopData.find(l => l.id === id);
  const queryParams = new URLSearchParams(location.search);
  const weeklyPayment = queryParams.get('weeklyPayment') || laptop?.weeklyPayment || 0;
  const downPayment = queryParams.get('downPayment') || '0';
  const loanTerm = queryParams.get('loanTerm') || '52';

  const [formData, setFormData] = useState<PaymentPlanApplicationData>({
    // Pre-populated from profile (will be set when profile loads)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Address Information (constructed from profile address)
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // New fields not in basic profile
    dateOfBirth: '',
    
    // Employment Information (additional details)
    employer: '',
    jobTitle: '',
    employmentLength: '',
    
    // Financial Information
    bankName: '',
    accountType: '',
    monthlyExpenses: '',
    
    // Additional Information
    reasonForPurchase: '',
    hasAppliedBefore: false,
    agreeToTerms: false,
    agreeToCredit: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        // Parse address if it exists (assuming it's stored as a single string)
        street: profile.address || '',
      }));
    }
  }, [profile]);

  if (authLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Error</h2>
            <p className="text-muted-foreground mb-4">{profileError}</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
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

  const handleInputChange = (field: keyof PaymentPlanApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof PaymentPlanApplicationData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms || !formData.agreeToCredit) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions and credit check authorization.",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Profile Error",
        description: "Unable to find your profile. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitPaymentPlanApplication(
        profile.id,
        id!,
        formData,
        { weeklyPayment: weeklyPayment.toString(), downPayment, loanTerm }
      );

      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours.",
      });
      navigate(`/catalog/${id}`);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Payment Plan Application</h1>
          <div></div>
        </div>
      </header>

      <div className="p-4 pb-24 max-w-2xl mx-auto">
        <LaptopSummaryCard 
          laptop={laptop}
          weeklyPayment={weeklyPayment.toString()}
          downPayment={downPayment}
          loanTerm={loanTerm}
        />

        <ProfileNotice />

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <AddressInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <EmploymentDetailsSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <FinancialInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <AdditionalInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />

          <TermsAgreementSection 
            formData={formData}
            onCheckboxChange={handleCheckboxChange}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyForPlan;
