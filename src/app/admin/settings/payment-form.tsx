
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initiatePaymentAction, checkPaymentStatusAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Clock, RefreshCw, XCircle, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


const initialFormState = {
    message: '',
    success: false,
    data: undefined,
};

type Status = 'IDLE' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'ERROR';

export function PaymentForm() {
    const { toast } = useToast();
    const [state, formAction, isInitiating] = useActionState(initiatePaymentAction, initialFormState);
    const formRef = useRef<HTMLFormElement>(null);
    
    // State for the status check part
    const [isCheckingStatus, startStatusCheck] = useTransition();
    const [transactionStatus, setTransactionStatus] = useState<Status>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Handle initiation result
        if (state.success && state.data?.TransactionStatus === 'PENDING') {
            setTransactionStatus('PENDING');
            setStatusMessage(state.message);
        } else if (state.message && !state.success) {
            setTransactionStatus('ERROR');
            setStatusMessage(state.message);
        }
    }, [state]);

    const handleReset = () => {
        formRef.current?.reset();
        setTransactionStatus('IDLE');
        setStatusMessage('');
        // This is a hacky way to reset the useActionState. A better way might be a key on the form.
        // For now, we manually clear things.
        state.message = '';
        state.success = false;
        state.data = undefined;
    };

    const handleCheckStatus = () => {
        const transRef = state.data?.TransactionReference;
        if (!transRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Transaction Reference not found.' });
            return;
        }

        startStatusCheck(async () => {
            const result = await checkPaymentStatusAction(transRef);
            setStatusMessage(result.message);
            if (result.success) {
                // Assuming status is one of 'PENDING', 'SUCCESSFUL', 'FAILED'
                setTransactionStatus(result.status as Status);
                 toast({ title: 'Status Updated', description: `Transaction is now ${result.status}.` });
            } else {
                setTransactionStatus('ERROR');
                 toast({ variant: 'destructive', title: 'Status Check Failed', description: result.message });
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: 'Copied!', description: 'Transaction reference copied to clipboard.' });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Copy Failed', description: 'Could not copy to clipboard.' });
        });
    };

    const getStatusContent = () => {
        const transRef = state.data?.TransactionReference;
        switch (transactionStatus) {
            case 'PENDING':
                return (
                    <Alert variant="default" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                        <Clock className="h-4 w-4 !text-yellow-500" />
                        <AlertTitle>Pending PIN</AlertTitle>
                        <AlertDescription>
                            {statusMessage}. Ask the customer to enter their PIN to authorize the payment.
                            {transRef && (
                                <div className="mt-4 space-y-2">
                                     <Label className="text-xs">Transaction Reference</Label>
                                     <div className="flex items-center gap-2 font-mono p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                        <span className="truncate flex-1">{transRef}</span>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(transRef)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                     </div>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                );
            case 'SUCCESSFUL':
                return (
                     <Alert variant="default" className="border-green-500 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 !text-green-500" />
                        <AlertTitle>Payment Successful!</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                );
            case 'FAILED':
                return (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Payment Failed</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                );
            case 'ERROR':
                 return (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>An Error Occurred</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                );
            default:
                return null;
        }
    };


    if (transactionStatus !== 'IDLE') {
         return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <CardTitle>Payment Status</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {getStatusContent()}
                    <div className="flex flex-wrap gap-2">
                         {transactionStatus === 'PENDING' && (
                             <Button onClick={handleCheckStatus} disabled={isCheckingStatus}>
                                {isCheckingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Check Status
                            </Button>
                         )}
                         <Button onClick={handleReset} variant="outline">
                             Start New Payment
                         </Button>
                    </div>
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
                        <Input id="amount" name="amount" type="number" placeholder="e.g., 5000" required disabled={isInitiating} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Phone Number</Label>
                        <Input id="number" name="number" type="tel" placeholder="+256712345678" required disabled={isInitiating}/>
                    </div>
                    <SubmitButton disabled={isInitiating}>Initiate Payment</SubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
