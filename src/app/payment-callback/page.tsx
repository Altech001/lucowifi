
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function PaymentStatus() {
  const searchParams = useSearchParams();
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Verifying Payment...');

  useEffect(() => {
    if (orderTrackingId) {
      const fetchStatus = async () => {
        try {
          const response = await fetch(`/api/pesapal/transaction-status?orderTrackingId=${orderTrackingId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.details || 'Failed to fetch transaction status');
          }
          
          const paymentStatus = data.payment_status_description?.toUpperCase() || 'UNKNOWN';

          if (paymentStatus === 'COMPLETED') {
            setStatus('success');
            setTitle('Payment Successful!');
            setMessage('Your voucher has been sent via WhatsApp. Thank you!');
          } else {
            setStatus('failed');
            setTitle('Payment Failed');
            setMessage(`Your payment could not be completed. The status is: ${data.payment_status_description || 'Unknown'}. Please try again.`);
          }
        } catch (error: any) {
          console.error("Status check failed:", error);
          setStatus('error');
          setTitle('Verification Error');
          setMessage(error.message || 'We could not confirm your payment status. Please contact support if you were charged.');
        }
      };

      fetchStatus();
    } else {
        setStatus('error');
        setTitle('Invalid Request');
        setMessage('No Order Tracking ID found in the URL. Please return to the home page.');
    }
  }, [orderTrackingId]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <p className="text-muted-foreground">Verifying your payment, please wait...</p>
          </div>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="font-headline text-3xl">{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
      case 'failed':
        return (
           <>
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <CardTitle className="font-headline text-3xl">{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        );
       case 'error':
        return (
           <>
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <CardTitle className="font-headline text-3xl">{title}</CardTitle>
             <Alert variant="destructive">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
            </Alert>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center animate-in fade-in-50">
        <CardHeader className="items-center">
          {renderContent()}
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
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


export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentStatus />
        </Suspense>
    )
}
