
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { purchaseVoucherAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Ticket, Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const initialState = {
  message: '',
  success: false,
  activeVoucherCode: undefined,
  activeVoucherExpiry: undefined,
  activeVoucherPackageName: undefined,
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
    if (state.message && !state.success && !state.activeVoucherCode) {
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: state.message,
      });
    }
  }, [state, toast]);


  if (state.activeVoucherCode) {
    return (
        <Alert variant="default" className="border-primary">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-headline">You have an active voucher!</AlertTitle>
            <AlertDescription className="space-y-4">
                <p>
                    You don't need to buy a new one yet. Here are the details of your current voucher:
                </p>
                <div className="p-3 border border-dashed rounded-lg space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">Package:</span>
                        <span>{state.activeVoucherPackageName}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">Code:</span>
                        <span className="font-mono">{state.activeVoucherCode}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">Expires:</span>
                        <span>{state.activeVoucherExpiry}</span>
                    </div>
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
        {state?.message && !state.success && !state.activeVoucherCode && (
            <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
        )}
    </form>
  );
}
