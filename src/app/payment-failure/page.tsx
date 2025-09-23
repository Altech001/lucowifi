
'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home } from 'lucide-react';

export default function PaymentFailurePage() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Card className="w-full max-w-lg text-center animate-in fade-in-50 border-destructive">
                <CardHeader className="items-center">
                    <XCircle className="h-16 w-16 text-destructive mb-4" />
                    <CardTitle className="font-headline text-3xl">Payment Failed</CardTitle>
                    <CardDescription>
                        There was a problem processing your payment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {(error || status) && (
                        <div className="text-sm text-left bg-destructive/10 p-4 rounded-md">
                            {status && <p><strong>Status:</strong> {status}</p>}
                            {error && <p><strong>Details:</strong> {error}</p>}
                        </div>
                     )}
                     <p className="text-muted-foreground text-sm">
                        Please try again. If the problem persists, contact support.
                     </p>
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
