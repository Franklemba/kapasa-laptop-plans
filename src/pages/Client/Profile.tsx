import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  Edit,
  Save,
  X,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user } = useAuthCheck();
  const { profile, isLoading, refetch } = useClientProfile(user?.id || null);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    national_id: '',
    employment_status: '',
    monthly_income: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        national_id: profile.national_id || '',
        employment_status: profile.employment_status || '',
        monthly_income: profile.monthly_income?.toString() || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          national_id: formData.national_id,
          employment_status: formData.employment_status,
          monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        national_id: profile.national_id || '',
        employment_status: profile.employment_status || '',
        monthly_income: profile.monthly_income?.toString() || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
              <p className="text-muted-foreground mb-6">
                Unable to load your profile information.
              </p>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center">
                <User className="h-6 w-6 lg:h-8 lg:w-8 mr-3" />
                My Profile
              </h2>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium p-2 bg-muted rounded">{formData.first_name || 'Not provided'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium p-2 bg-muted rounded">{formData.last_name || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <Badge variant="secondary">Cannot be changed</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+260 XXX XXX XXX"
                  />
                ) : (
                  <p className="font-medium p-2 bg-muted rounded">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="national_id" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>National ID / NRC</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => handleInputChange('national_id', e.target.value)}
                    placeholder="XXXXXX/XX/X"
                  />
                ) : (
                  <p className="font-medium p-2 bg-muted rounded">{formData.national_id || 'Not provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Address</span>
              </CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                ) : (
                  <p className="font-medium p-2 bg-muted rounded min-h-[80px]">
                    {formData.address || 'Not provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment & Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Employment & Financial Information</span>
              </CardTitle>
              <CardDescription>Your employment and income details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employment_status" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Employment Status</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="employment_status"
                    value={formData.employment_status}
                    onChange={(e) => handleInputChange('employment_status', e.target.value)}
                    placeholder="e.g., Employed, Self-employed, Student"
                  />
                ) : (
                  <p className="font-medium p-2 bg-muted rounded">{formData.employment_status || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_income" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Monthly Income (ZMK)</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="monthly_income"
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                    placeholder="Enter your monthly income"
                  />
                ) : (
                  <p className="font-medium p-2 bg-muted rounded">
                    {formData.monthly_income ? `ZMK ${parseFloat(formData.monthly_income).toLocaleString()}` : 'Not provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>Your account status and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Badge variant="default" className="capitalize">
                  {profile.status || 'Active'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <Badge variant="secondary" className="capitalize">
                  {profile.role || 'Client'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
