
'use client';

import { useActionState, useEffect } from 'react';
import { purchaseVoucherAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Package } from '@/lib/data';

const initialState = {
  message: '',
  success: false,
};

type PurchaseDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  packageInfo: Package;
};

export function PurchaseDialog({ isOpen, onClose, packageInfo }: PurchaseDialogProps) {
  const [state, formAction] = useActionState(purchaseVoucherAction, initialState);
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

  // The dialog will close automatically on success because of the redirect
  // So we only need to manually close it on modal close actions
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Purchase: <span className="text-primary">{packageInfo.name}</span>
          </DialogTitle>
          <DialogDescription>
            Enter your WhatsApp phone number to receive your voucher code for UGX {packageInfo.price.toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-base">WhatsApp Phone Number</Label>
            <Input 
              id="phoneNumber"
              name="phoneNumber" 
              type="tel" 
              placeholder="+256712345678" 
              required 
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +256 for Uganda).
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
      </DialogContent>
    </Dialog>
  );
}
