'use client'

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { purchaseVoucherAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

const initialState = {
  message: '',
  success: false,
};

export function PurchaseForm() {
  const [state, formAction] = useFormState(purchaseVoucherAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-base">WhatsApp Phone Number</Label>
        <Input 
          id="phoneNumber"
          name="phoneNumber" 
          type="tel" 
          placeholder="+1234567890" 
          required 
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground">
          Include country code (e.g., +1 for USA).
        </p>
      </div>
      <SubmitButton className="w-full" size="lg">
        <WhatsAppIcon className="mr-2 h-5 w-5" />
        Send to WhatsApp
      </SubmitButton>
      {state?.message && !state.success && (
        <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
      )}
    </form>
  )
}
