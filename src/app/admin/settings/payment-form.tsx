
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPaymentAction, checkPaymentStatusAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Clock, RefreshCw, XCircle, Copy, Loader2, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Status = 'IDLE' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'ERROR' | 'TIMEOUT';

const initialFormState = {
    message: '',
    success: false,
    data: undefined,
};

function CountdownTimer({ onTimeout }: { onTimeout: () => void }) {
    const [counter, setCounter] = useState(30);

    useEffect(() => {
        if (counter === 0) {
            onTimeout();
            return;
        }

        const timer = setTimeout(() => setCounter(counter - 1), 1000);
        return () => clearTimeout(timer);
    }, [counter, onTimeout]);

    return (
        <div className="relative h-20 w-20">
            <Loader2 className="absolute inset-0 h-full w-full animate-spin-slow text-primary/20" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 36 36">
                <circle
                    className="text-primary"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="16"
                    cx="18"
                    cy="18"
                    strokeDasharray={`${(counter / 30) * 100}, 100`}
                    strokeDashoffset="25"
                    transform="rotate(-90 18 18)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">{counter}</span>
            </div>
        </div>
    );
}


export function PaymentForm() {
    const { toast } = useToast();
    const [state, formAction, isInitiating] = useActionState(processPaymentAction, initialFormState);
    const formRef = useRef<HTMLFormElement>(null);
    
    const [isCheckingStatus, startStatusCheck] = useTransition();
    const [transactionStatus, setTransactionStatus] = useState<Status>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (state.message) {
             if (state.success && state.data?.TransactionStatus === 'PENDING') {
                setTransactionStatus('PENDING');
                setStatusMessage(state.message);
            } else if (!state.success) {
                setTransactionStatus('ERROR');
                setStatusMessage(state.message);
            }
        }
    }, [state]);

    const handleReset = () => {
        formRef.current?.reset();
        setTransactionStatus('IDLE');
        setStatusMessage('');
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
                const newStatus = result.status as Status;
                setTransactionStatus(newStatus);
                toast({ title: 'Status Updated', description: `Transaction is now ${newStatus}.` });
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
                    <div className="flex flex-col items-center text-center gap-4">
                        <CountdownTimer onTimeout={() => setTransactionStatus('TIMEOUT')} />
                        <h3 className="font-semibold text-lg">Awaiting Customer PIN</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                           Please ask the customer to enter their mobile money PIN on their phone to authorize the payment of UGX {state.data?.amount}.
                        </p>
                         {transRef && (
                            <div className="w-full text-left space-y-2 pt-4">
                                 <Label className="text-xs">Transaction Reference</Label>
                                 <div className="flex items-center gap-2 font-mono p-2 bg-muted rounded-md">
                                    <span className="truncate flex-1">{transRef}</span>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(transRef)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                 </div>
                            </div>
                        )}
                    </div>
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
            case 'TIMEOUT':
                 return (
                    <Alert variant="default" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                        <Hourglass className="h-4 w-4 !text-yellow-500" />
                        <AlertTitle>Request Timed Out</AlertTitle>
                        <AlertDescription>The 30-second window has passed. You can manually check the status to see if the payment went through, or start a new payment.</AlertDescription>
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
                    <div className="flex flex-wrap gap-2 pt-4">
                         {(transactionStatus === 'PENDING' || transactionStatus === 'TIMEOUT') && (
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
