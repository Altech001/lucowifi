
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initiatePesapalPaymentAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { CreditCard } from 'lucide-react';

const initialFormState = {
    message: '',
    success: false,
    redirectUrl: undefined,
};

export function PesapalForm() {
    const { toast } = useToast();
    const [state, formAction] = useActionState(initiatePesapalPaymentAction, initialFormState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
    }, [state, toast]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <CardTitle>Pesapal Payment</CardTitle>
                </div>
                <CardDescription>Initiate a payment using Pesapal.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (UGX)</Label>
                        <Input id="amount" name="amount" type="number" placeholder="e.g., 5000" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" type="text" placeholder="e.g., WIFI Voucher" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Customer Email</Label>
                        <Input id="email" name="email" type="email" placeholder="customer@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Customer Phone Number</Label>
                        <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+256712345678" required />
                    </div>
                    <SubmitButton>Initiate Pesapal Payment</SubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
