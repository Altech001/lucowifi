
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createMembershipAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, KeyRound, User, Lock, PartyPopper, Home, ArrowLeft } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
  tempUsername: undefined,
  tempPassword: undefined,
};

export function MembershipForm() {
  const [state, formAction] = useActionState(createMembershipAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(new FormData());

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: state.message,
      });
      // Reset to first step on error
      setStep(1);
    }
  }, [state, toast]);

  const handleNext = () => {
    const currentForm = formRef.current;
    if (currentForm) {
      const newFormData = new FormData(currentForm);
      const mergedFormData = new FormData();

      // Copy existing data
      for (const [key, value] of formData.entries()) {
        mergedFormData.set(key, value);
      }
      // Copy new data
      for (const [key, value] of newFormData.entries()) {
        mergedFormData.set(key, value);
      }

      setFormData(mergedFormData);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  if (state.success && state.tempUsername && state.tempPassword) {
    return (
        <Card className="w-full max-w-md text-center animate-in fade-in-50 zoom-in-95 duration-500">
            <CardHeader className="items-center">
                <PartyPopper className="h-12 w-12 text-primary mb-3" />
                <CardTitle className="font-headline text-2xl">Signup Successful!</CardTitle>
                <CardDescription>{state.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Please use these temporary credentials for 1-day access while we approve your membership.
                </p>
                <div className="space-y-3 rounded-lg border-2 border-dashed p-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Temporary Username</Label>
                        <p className="text-lg font-mono font-bold text-primary">{state.tempUsername}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                        <p className="text-lg font-mono font-bold text-primary">{state.tempPassword}</p>
                    </div>
                </div>
                 <Button asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
       {/* Hidden inputs to carry over data from previous steps */}
       {step > 1 && Array.from(formData.entries()).map(([key, value]) => {
          if (key !== 'username' && key !== 'password' && typeof value === 'string') {
              return <input type="hidden" name={key} key={key} value={value} />;
          }
          return null;
       })}


      {/* Progress Bar */}
      <div className="w-full px-4 pt-2">
        <div className="relative">
          <div className="h-1 bg-muted rounded-full"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 1) * 100}%` }}
          ></div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 rounded-full w-4 h-4 border-2 ${step >= 1 ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'}`}
            style={{ left: '0%' }}
          ></div>
          <div
             className={`absolute top-1/2 -translate-y-1/2 rounded-full w-4 h-4 border-2 ${step >= 2 ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'}`}
            style={{ left: '100%' }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span className={step >= 1 ? 'text-primary font-semibold' : ''}>Personal Info</span>
            <span className={step >= 2 ? 'text-primary font-semibold' : ''}>Account</span>
        </div>
      </div>


      {step === 1 && (
        <div className="space-y-4 animate-in fade-in-30 duration-500">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="John Doe" required className="text-lg" defaultValue={formData.get('name')?.toString()} />
          </div>
          <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base flex items-center gap-2">WhatsApp Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+256712345678" required className="text-lg" defaultValue={formData.get('phoneNumber')?.toString()} />
              <p className="text-sm text-muted-foreground">
                We'll send a confirmation to this number. Include country code.
              </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in-30 duration-500">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Choose a Username</Label>
            <Input id="username" name="username" type="text" placeholder="johndoe" required className="text-lg" defaultValue={formData.get('username')?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Create a Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required className="text-lg" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : <div></div>}
        {step < 2 ? (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <SubmitButton>
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up for Membership
          </SubmitButton>
        )}
      </div>

      {state?.message && !state.success && (
        <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
      )}
    </form>
  );
}
