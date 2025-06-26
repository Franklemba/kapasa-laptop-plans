
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react";
import { PaymentPlanApplicationData } from "@/services/paymentPlanService";

interface AddressInfoSectionProps {
  formData: PaymentPlanApplicationData;
  onInputChange: (field: keyof PaymentPlanApplicationData, value: string) => void;
}

export const AddressInfoSection = ({ formData, onInputChange }: AddressInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Home className="h-5 w-5" />
          <span>Address Information</span>
          <span className="text-sm text-muted-foreground font-normal">(Review & Edit)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => onInputChange('street', e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => onInputChange('state', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => onInputChange('zipCode', e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
