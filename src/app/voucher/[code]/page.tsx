import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoucherPage({ params }: { params: { code: string } }) {
  const { code } = params;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Purchase Successful!</CardTitle>
          <CardDescription>Your voucher code has been generated and sent via WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-6">
            <p className="text-sm text-muted-foreground mb-2">Your Voucher Code</p>
            <div className="p-4 border-2 border-dashed border-primary rounded-lg">
              <p className="text-4xl font-mono font-bold tracking-widest text-primary">{code}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Ticket className="h-4 w-4" />
            <span>Keep this code safe and use it to connect.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
