
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initiatePaymentAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const initialState = {
    message: '',
    success: false,
    data: undefined,
};

export function PaymentForm() {
    const { toast } = useToast();
    const [state, formAction, isPending] = useActionState(initiatePaymentAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);

     useEffect(() => {
        // Only show toast on failure; success is handled by the new UI state.
        if(state.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Payment Error',
                description: state.message
            });
        }
    }, [state, toast]);

    const handleReset = () => {
        formRef.current?.reset();
        // A bit of a hack to reset the action state. In a real app, you might use a key on the form.
        window.location.reload(); 
    }

    const transactionStatus = state.data?.TransactionStatus;

    if (state.success) {
         return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <CardTitle>Payment Status</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     {transactionStatus === 'PENDING' ? (
                         <Alert variant="default" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                            <Clock className="h-4 w-4 !text-yellow-500" />
                            <AlertTitle>Pending PIN</AlertTitle>
                            <AlertDescription>
                                {state.message} Please ask the customer to enter their PIN on their phone to complete the payment.
                            </AlertDescription>
                        </Alert>
                     ) : (
                        <Alert variant="default" className="border-green-500 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-4 w-4 !text-green-500" />
                            <AlertTitle>Payment Initiated!</AlertTitle>
                            <AlertDescription>
                                {state.message}
                            </AlertDescription>
                        </Alert>
                     )}
                     <Button onClick={handleReset} variant="outline">
                         Start New Payment
                     </Button>
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
                        <Input id="amount" name="amount" type="number" placeholder="e.g., 5000" required disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Phone Number</Label>
                        <Input id="number" name="number" type="tel" placeholder="+256712345678" required disabled={isPending}/>
                    </div>
                    <SubmitButton disabled={isPending}>Initiate Payment</SubmitButton>
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
