
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initiatePaymentAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const initialState = {
    message: '',
    success: false,
};

export function PaymentForm() {
    const { toast } = useToast();
    const [state, formAction] = useActionState(initiatePaymentAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);

     useEffect(() => {
        if(state.message) {
            toast({
                variant: state.success ? 'default' : 'destructive',
                title: state.success ? 'Payment Update' : 'Payment Error',
                description: state.message
            });

            if (state.success) {
                formRef.current?.reset();
            }
        }
    }, [state, toast]);

    if (state.success) {
         return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <CardTitle>Initiate Payment</CardTitle>
                    </div>
                    <CardDescription>Manually trigger a payment to a customer.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert variant="default" className="border-green-500 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 !text-green-500" />
                        <AlertTitle>Payment Successful!</AlertTitle>
                        <AlertDescription>
                            {state.message}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
         )
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <CardTitle>Initiate Payment</CardTitle>
                </div>
                <CardDescription>Manually trigger a payment to a customer.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (UGX)</Label>
                        <Input id="amount" name="amount" type="number" placeholder="e.g., 5000" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Phone Number</Label>
                        <Input id="number" name="number" type="tel" placeholder="+256712345678" required />
                    </div>
                    <SubmitButton>Initiate Payment</SubmitButton>
                     {state.message && !state.success && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Payment Failed</AlertTitle>
                            <AlertDescription>
                                {state.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
