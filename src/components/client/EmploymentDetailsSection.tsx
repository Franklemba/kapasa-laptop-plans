
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { PaymentPlanApplicationData } from "@/services/paymentPlanService";

interface EmploymentDetailsSectionProps {
  formData: PaymentPlanApplicationData;
  onInputChange: (field: keyof PaymentPlanApplicationData, value: string) => void;
}

export const EmploymentDetailsSection = ({ formData, onInputChange }: EmploymentDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Employment Details</span>
          <span className="text-sm text-muted-foreground font-normal">(Additional Information)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employer">Employer</Label>
            <Input
              id="employer"
              value={formData.employer}
              onChange={(e) => onInputChange('employer', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="employmentLength">Years at Current Job</Label>
          <Input
            id="employmentLength"
            type="number"
            placeholder="0"
            value={formData.employmentLength}
            onChange={(e) => onInputChange('employmentLength', e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
