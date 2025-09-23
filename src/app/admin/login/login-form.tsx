

'use client';

import { useActionState, useEffect } from 'react';
import { login } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Lock } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      <SubmitButton className="w-full">
        <Lock className="mr-2 h-4 w-4" />
        Login
      </SubmitButton>
    </form>
  );
}
