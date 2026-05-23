import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";

interface PaymentReceiptProps {
  payment: {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
  };
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  laptop: {
    name: string;
    brand: string;
    model: string;
  };
  paymentPlan: {
    id: string;
    total_amount: number;
    amount_paid: number;
    weekly_payment: number;
  };
}

export const PaymentReceipt = ({ payment, client, laptop, paymentPlan }: PaymentReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // For now, use browser's print to PDF functionality
    // In production, you might want to use a library like jsPDF or react-pdf
    window.print();
  };

  const receiptNumber = `RCP-${payment.id.substring(0, 8).toUpperCase()}`;
  const formattedDate = new Date(payment.payment_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Action Buttons - Hidden when printing */}
      <div className="flex justify-end space-x-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Receipt Content */}
      <Card ref={receiptRef} className="max-w-2xl mx-auto print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">fiTech</h1>
            <p className="text-sm text-muted-foreground">Laptop Payment Plans</p>
            <p className="text-xs text-muted-foreground mt-1">
              Making technology accessible to everyone
            </p>
          </div>

          <Separator className="my-6" />

          {/* Receipt Info */}
          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">PAYMENT RECEIPT</p>
              <p className="text-2xl font-bold">{receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Client Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">CLIENT INFORMATION</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{client.first_name} {client.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Laptop Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">LAPTOP DETAILS</h3>
            <div>
              <p className="font-medium text-lg">{laptop.name}</p>
              <p className="text-sm text-muted-foreground">{laptop.brand} {laptop.model}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">PAYMENT DETAILS</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-semibold text-lg">ZMK {payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{payment.payment_method.replace('_', ' ')}</span>
              </div>
              {payment.reference_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference Number</span>
                  <span className="font-medium">{payment.reference_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Payment Plan Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">PAYMENT PLAN SUMMARY</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Plan Amount</span>
                <span className="font-medium">ZMK {paymentPlan.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid (including this payment)</span>
                <span className="font-medium text-green-600">ZMK {paymentPlan.amount_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Balance</span>
                <span className="font-semibold text-orange-600">
                  ZMK {(paymentPlan.total_amount - paymentPlan.amount_paid).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly Payment</span>
                <span className="font-medium">ZMK {paymentPlan.weekly_payment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {payment.notes && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">NOTES</h3>
                <p className="text-sm">{payment.notes}</p>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Thank you for your payment!</p>
            <p>For inquiries, please contact us at info@fitech.com</p>
            <p className="pt-4">This is an official payment receipt from fiTech Laptop Payment Plans</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
