
import { Card, CardContent } from "@/components/ui/card";

interface LaptopSummaryCardProps {
  laptop: {
    name: string;
    brand: string;
    image: string;
    price: number;
  };
  weeklyPayment: string;
  downPayment: string;
  loanTerm: string;
}

export const LaptopSummaryCard = ({ laptop, weeklyPayment, downPayment, loanTerm }: LaptopSummaryCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img
            src={`https://images.unsplash.com/${laptop.image}?w=80&h=60&fit=crop`}
            alt={laptop.name}
            className="w-16 h-12 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{laptop.brand} {laptop.name}</h3>
            <p className="text-sm text-muted-foreground">
              K{weeklyPayment}/week • Down: K{downPayment} • {Math.round(Number(loanTerm) / 4.33)} months
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">K{laptop.price.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
