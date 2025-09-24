'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]"><p>Loading payment details...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const ref = searchParams.get('ref');

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center animate-in fade-in-50">
        <CardHeader className="items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been confirmed. Thank you for your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ref && (
            <div className="text-sm">
              <p className="text-muted-foreground">Your reference:</p>
              <p className="font-mono bg-muted p-2 rounded-md">{ref}</p>
            </div>
          )}
          {status && (
            <div className="text-sm">
              <p className="text-muted-foreground">Status:</p>
              <p className="font-semibold text-green-600">{status}</p>
            </div>
          )}
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}