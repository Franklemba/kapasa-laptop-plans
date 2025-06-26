
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { PaymentPlanApplicationData } from "@/services/paymentPlanService";

interface AdditionalInfoSectionProps {
  formData: PaymentPlanApplicationData;
  onInputChange: (field: keyof PaymentPlanApplicationData, value: string) => void;
  onCheckboxChange: (field: keyof PaymentPlanApplicationData, checked: boolean) => void;
}

export const AdditionalInfoSection = ({ formData, onInputChange, onCheckboxChange }: AdditionalInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Additional Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="reasonForPurchase">Reason for Purchase</Label>
          <Textarea
            id="reasonForPurchase"
            placeholder="Tell us why you need this laptop..."
            value={formData.reasonForPurchase}
            onChange={(e) => onInputChange('reasonForPurchase', e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasAppliedBefore"
            checked={formData.hasAppliedBefore}
            onCheckedChange={(checked) => onCheckboxChange('hasAppliedBefore', checked as boolean)}
          />
          <Label htmlFor="hasAppliedBefore" className="text-sm">
            I have applied for financing with this company before
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
