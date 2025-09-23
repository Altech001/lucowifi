
'use client';

import { useActionState, useEffect, useState } from 'react';
import { purchaseVoucherAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Ticket, Clock, ShoppingCart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const initialState = {
  message: '',
  success: false,
  existingVouchers: undefined,
};

type PurchaseFormProps = {
    packageSlug: string;
}

export function PurchaseForm({ packageSlug }: PurchaseFormProps) {
  const [state, formAction] = useActionState(purchaseVoucherAction, initialState);
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Only show toast for actual purchase failures, not for the "active voucher found" message.
    if (state.message && !state.success && !state.existingVouchers) {
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  const getStatusBadge = (status: 'Active' | 'Expired' | 'Available') => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  }


  if (state.existingVouchers && state.existingVouchers.length > 0) {
    return (
        <Alert variant="default" className="border-primary">
            <History className="h-4 w-4" />
            <AlertTitle className="font-headline">Your Voucher History</AlertTitle>
            <AlertDescription className="space-y-4">
                <p>
                    Here are the vouchers you've purchased with this number.
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {state.existingVouchers.map((voucher, index) => (
                        <Card key={index} className="p-3">
                            <CardHeader className="p-0 mb-2 flex-row justify-between items-start">
                                <h4 className="font-semibold text-foreground">{voucher.packageName}</h4>
                                {getStatusBadge(voucher.status)}
                            </CardHeader>
                            <CardContent className="p-0 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-foreground/80">Code:</span>
                                    <span className="font-mono">{voucher.code}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-foreground/80">
                                        {voucher.status === 'Active' ? 'Expires:' : 'Expired:'}
                                    </span>
                                    <span>{voucher.expiry}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <p>
                    If you still want to buy a new voucher, you can proceed below.
                </p>
                <form action={formAction}>
                     <input type="hidden" name="packageSlug" value={packageSlug} />
                     <input type="hidden" name="phoneNumber" value={phoneNumber} />
                     <input type="hidden" name="forcePurchase" value="true" />
                    <SubmitButton className="w-full" size="lg">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Buy New Voucher Anyway
                    </SubmitButton>
                </form>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
        <input type="hidden" name="packageSlug" value={packageSlug} />
        <input type="hidden" name="forcePurchase" value="false" />
        <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-base">WhatsApp Phone Number</Label>
        <Input 
            id="phoneNumber"
            name="phoneNumber" 
            type="tel" 
            placeholder="+256712345678" 
            required 
            className="text-lg"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
            We'll check if you have an active voucher first. Include country code.
        </p>
        </div>
        <SubmitButton className="w-full" size="lg">
            <WhatsAppIcon className="mr-2 h-5 w-5" />
            Proceed with Purchase
        </SubmitButton>
        {state?.message && !state.success && !state.existingVouchers && (
            <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
        )}
    </form>
  );
}
