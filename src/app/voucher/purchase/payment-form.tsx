
'use client';

import { useState } from 'react';
import type { Package } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentFormProps = {
    selectedPackage: Package;
};

export function PaymentForm({ selectedPackage }: PaymentFormProps) {
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/pesapal/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedPackage.price,
                    email: data.email,
                    phone_number: data.phone_number,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    package_slug: selectedPackage.slug, // Pass package info
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details || result.error || 'Failed to initiate payment.');
            }

            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                throw new Error('Could not get payment URL from server.');
            }
        } catch (err: any) {
            console.error("Payment initiation failed:", err);
            setError(err.message);
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: err.message,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" required />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (for payment)</Label>
                <Input id="phone_number" name="phone_number" type="tel" placeholder="+256712345678" required />
                <p className="text-xs text-muted-foreground">The payment prompt will be sent to this number.</p>
            </div>
            
            <SubmitButton className="w-full" size="lg">
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Pay UGX {selectedPackage.price.toLocaleString()}
            </SubmitButton>
        </form>
    );
}
