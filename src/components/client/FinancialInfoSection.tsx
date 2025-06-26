
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { PaymentPlanApplicationData } from "@/services/paymentPlanService";

interface FinancialInfoSectionProps {
  formData: PaymentPlanApplicationData;
  onInputChange: (field: keyof PaymentPlanApplicationData, value: string) => void;
}

export const FinancialInfoSection = ({ formData, onInputChange }: FinancialInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Financial Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => onInputChange('bankName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Input
              id="accountType"
              placeholder="e.g., Checking, Savings"
              value={formData.accountType}
              onChange={(e) => onInputChange('accountType', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
          <Input
            id="monthlyExpenses"
            type="number"
            placeholder="0"
            value={formData.monthlyExpenses}
            onChange={(e) => onInputChange('monthlyExpenses', e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
