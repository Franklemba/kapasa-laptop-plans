
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Laptop } from "lucide-react";
import { CompleteProfileForm } from "@/components/client/CompleteProfileForm";
import { LoadingScreen } from "@/components/client/LoadingScreen";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { createClientProfile } from "@/services/clientService";

const CompleteProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuthCheck();

  const handleSubmit = async (formData: any) => {
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

      await createClientProfile(user, formData);

      toast({ 
        title: "Profile completed!", 
        description: "Welcome to fiTech!" 
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

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Laptop className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">fiTech</h1>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your information to get started with your laptop payment plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompleteProfileForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
