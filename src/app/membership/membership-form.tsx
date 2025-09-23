
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createMembershipAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { UserPlus } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
};

export function MembershipForm() {
  const [state, formAction] = useActionState(createMembershipAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: state.message,
      });
    }
    // Success is handled by redirect, so no toast needed here.
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">Full Name</Label>
          <Input 
            id="name"
            name="name" 
            type="text" 
            placeholder="John Doe" 
            required 
            className="text-lg"
          />
        </div>
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
              We'll send a confirmation to this number. Include country code.
            </p>
        </div>
      </div>
      <SubmitButton className="w-full" size="lg">
        <UserPlus className="mr-2 h-5 w-5" />
        Sign Up for Membership
      </SubmitButton>
      {state?.message && !state.success && (
        <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
      )}
    </form>
  );
}
