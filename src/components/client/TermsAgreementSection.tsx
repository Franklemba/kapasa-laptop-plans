
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { PaymentPlanApplicationData } from "@/services/paymentPlanService";

interface TermsAgreementSectionProps {
  formData: PaymentPlanApplicationData;
  onCheckboxChange: (field: keyof PaymentPlanApplicationData, checked: boolean) => void;
}

export const TermsAgreementSection = ({ formData, onCheckboxChange }: TermsAgreementSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Terms & Agreements</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => onCheckboxChange('agreeToTerms', checked as boolean)}
            required
          />
          <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
            I agree to the terms and conditions, privacy policy, and understand that this application 
            does not guarantee approval. Final terms may vary based on credit approval.
          </Label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeToCredit"
            checked={formData.agreeToCredit}
            onCheckedChange={(checked) => onCheckboxChange('agreeToCredit', checked as boolean)}
            required
          />
          <Label htmlFor="agreeToCredit" className="text-sm leading-relaxed">
            I authorize the company to perform a credit check and verify the information provided 
            in this application.
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
