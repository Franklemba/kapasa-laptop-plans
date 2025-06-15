
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Calendar, TrendingDown } from "lucide-react";

interface PaymentPlanCalculatorProps {
  laptopPrice: number;
  laptopName: string;
}

const PaymentPlanCalculator = ({ laptopPrice, laptopName }: PaymentPlanCalculatorProps) => {
  const [downPayment, setDownPayment] = useState(0);
  const [loanTermWeeks, setLoanTermWeeks] = useState([52]); // Default 1 year
  const [interestRate, setInterestRate] = useState(15); // 15% annual interest
  const [weeklyPayment, setWeeklyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const maxDownPayment = Math.floor(laptopPrice * 0.8); // Max 80% down payment
  const downPaymentPercentage = Math.round((downPayment / laptopPrice) * 100);

  // Calculate payment plan
  useEffect(() => {
    const principal = laptopPrice - downPayment;
    const weeks = loanTermWeeks[0];
    const weeklyInterestRate = (interestRate / 100) / 52;
    
    if (principal <= 0) {
      setWeeklyPayment(0);
      setTotalPayment(downPayment);
      setTotalInterest(0);
      return;
    }

    // Calculate weekly payment using loan formula
    const weeklyPmt = principal * 
      (weeklyInterestRate * Math.pow(1 + weeklyInterestRate, weeks)) / 
      (Math.pow(1 + weeklyInterestRate, weeks) - 1);
    
    const totalPmt = (weeklyPmt * weeks) + downPayment;
    const totalInt = totalPmt - laptopPrice;

    setWeeklyPayment(Math.round(weeklyPmt * 100) / 100);
    setTotalPayment(Math.round(totalPmt * 100) / 100);
    setTotalInterest(Math.round(totalInt * 100) / 100);
  }, [downPayment, loanTermWeeks, interestRate, laptopPrice]);

  const loanTermOptions = [
    { weeks: 26, label: "6 months" },
    { weeks: 52, label: "1 year" },
    { weeks: 78, label: "1.5 years" },
    { weeks: 104, label: "2 years" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Payment Plan Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Down Payment */}
        <div className="space-y-3">
          <Label>Down Payment: ${downPayment.toLocaleString()} ({downPaymentPercentage}%)</Label>
          <Slider
            value={[downPayment]}
            onValueChange={(value) => setDownPayment(value[0])}
            max={maxDownPayment}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>${maxDownPayment.toLocaleString()}</span>
          </div>
        </div>

        {/* Custom Down Payment Input */}
        <div className="space-y-2">
          <Label htmlFor="customDown">Or enter custom amount:</Label>
          <Input
            id="customDown"
            type="number"
            placeholder="Enter down payment"
            value={downPayment || ""}
            onChange={(e) => {
              const value = Math.min(Number(e.target.value) || 0, maxDownPayment);
              setDownPayment(value);
            }}
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-3">
          <Label>Loan Term: {loanTermOptions.find(opt => opt.weeks === loanTermWeeks[0])?.label}</Label>
          <div className="grid grid-cols-2 gap-2">
            {loanTermOptions.map((option) => (
              <Button
                key={option.weeks}
                variant={loanTermWeeks[0] === option.weeks ? "default" : "outline"}
                size="sm"
                onClick={() => setLoanTermWeeks([option.weeks])}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="interestRate">Annual Interest Rate: {interestRate}%</Label>
          <Input
            id="interestRate"
            type="number"
            min="0"
            max="30"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
          />
        </div>

        {/* Payment Summary */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Payment Summary</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekly Payment:</span>
              <span className="text-xl font-bold text-primary">
                ${weeklyPayment.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Payment:</span>
              <span className="font-medium">${totalPayment.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Interest:</span>
              <span className="font-medium text-destructive">
                ${totalInterest.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Loan Amount:</span>
              <span className="font-medium">
                ${(laptopPrice - downPayment).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" size="lg">
            Apply for This Plan
          </Button>
          <Button variant="outline" className="w-full">
            Save Calculation
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          * This is an estimate. Final terms may vary based on credit approval and other factors.
          Interest rates and terms are subject to change.
        </p>
      </CardContent>
    </Card>
  );
};

export default PaymentPlanCalculator;
