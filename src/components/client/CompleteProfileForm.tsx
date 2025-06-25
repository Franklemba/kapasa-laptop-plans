
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  nationalId: string;
  employmentStatus: string;
  monthlyIncome: string;
  creditScore: string;
  notes: string;
}

interface CompleteProfileFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export const CompleteProfileForm = ({ onSubmit, isLoading }: CompleteProfileFormProps) => {
  const [formData, setFormData] = useState<FormData>({
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
  );
};
