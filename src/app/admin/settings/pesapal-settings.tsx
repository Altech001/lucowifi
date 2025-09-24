
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { clearIpnLogsAction } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, AlertCircle, FileText, Trash2, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PesapalSettingsProps = {
    ipnLogs: string;
}

export function PesapalSettings({ ipnLogs }: PesapalSettingsProps) {
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    const handleTestPaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        
        const form = event.currentTarget;
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if(submitButton) submitButton.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/pesapal/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: data.amount,
                    email: 'test-admin@example.com',
                    phone_number: data.phone_number,
                    first_name: 'Admin',
                    last_name: 'Test',
                    package_slug: 'test-payment',
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details?.error?.message || result.details || result.error || 'Failed to initiate payment.');
            }

            if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                throw new Error('Could not get payment URL from server.');
            }
        } catch (err: any) {
            console.error("Payment initiation failed:", err);
            setError(err.message);
        } finally {
            if(submitButton) submitButton.disabled = false;
        }
    };

    const handleClearLogs = async () => {
        const result = await clearIpnLogsAction();
        toast({
            variant: result.success ? 'default' : 'destructive',
            title: result.success ? 'Success' : 'Error',
            description: result.message
        });
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        <CardTitle>Pesapal Test Payment</CardTitle>
                    </div>
                    <CardDescription>Manually trigger a test payment to a customer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTestPaymentSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (UGX)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="e.g., 100" defaultValue="100" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input id="phone_number" name="phone_number" type="tel" placeholder="+256712345678" required />
                        </div>
                        <SubmitButton>Initiate Test Payment</SubmitButton>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Webhook className="h-6 w-6" />
                            <CardTitle>IPN Logs</CardTitle>
                        </div>
                         <Button variant="outline" size="sm" onClick={handleClearLogs}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Logs
                        </Button>
                    </div>
                    <CardDescription>View incoming notifications from Pesapal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full bg-muted rounded-md p-4 h-96 overflow-y-auto">
                        {ipnLogs ? (
                            <pre className="text-xs whitespace-pre-wrap break-all">
                                <code>{ipnLogs}</code>
                            </pre>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mb-2" />
                                <p>No IPN logs yet.</p>
                                <p className="text-xs">Perform a test payment to see logs here.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
