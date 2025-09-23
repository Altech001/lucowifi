
'use client';

import { useActionState, useEffect } from 'react';
import { findMembershipAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { User, Lock, Search, AlertCircle, KeyRound, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  message: '',
  success: false,
  credentials: undefined,
};


export function MembershipLoginForm() {
    const [state, formAction] = useActionState(findMembershipAction, initialState);
    const { toast } = useToast();

     useEffect(() => {
        if (state.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
    }, [state, toast]);


    if (state.success && state.credentials) {
        return (
             <div className="space-y-4 animate-in fade-in-50">
                <Alert variant="default" className="border-primary">
                    <KeyRound className="h-4 w-4" />
                    <AlertTitle className="font-headline">Your Credentials</AlertTitle>
                    <AlertDescription>
                        Use these details to log in to the WIFI service.
                    </AlertDescription>
                </Alert>
                <div className="space-y-3 rounded-lg border-2 border-dashed p-4">
                    <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-2"><User />Username</Label>
                        <p className="text-lg font-mono font-bold text-primary">{state.credentials.username}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-2"><Lock />Password</Label>
                        <p className="text-lg font-mono font-bold text-primary">{state.credentials.password}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="identifier" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username or Phone Number
                </Label>
                <Input id="identifier" name="identifier" type="text" placeholder="your_username or +256..." required />
            </div>
            <SubmitButton className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Find My Details
            </SubmitButton>
            {state.message && !state.success && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
        </form>
    );
}
