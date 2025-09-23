
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
import { UserPlus, KeyRound, User, Lock, PartyPopper, Home, ArrowLeft, ArrowRight, FileCheck, Eye, EyeOff } from 'lucide-react';

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
  const [formData, setFormData] = useState(new FormData());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState('');


  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: state.message,
      });
      // Allow user to correct error
    }
  }, [state, toast]);

  const handleNext = () => {
    const currentForm = formRef.current;
    if (currentForm) {
        if (step === 2) {
            if (password !== confirmPassword) {
                toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
                return;
            }
             if (password.length < 6) {
                toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
                return;
            }
        }
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
       {Array.from(formData.entries()).map(([key, value]) => {
          if (value instanceof File) {
            // Cannot set File object as hidden input value directly, handled by main file input
            return null;
          }
          // Also carry over the password from step 2
          if (key !== 'confirmPassword') {
              return <input type="hidden" name={key} key={key} value={value as string} />;
          }
          return null;
       })}


      {/* Progress Bar */}
      <div className="w-full px-4 pt-2">
        <div className="relative">
          <div className="h-1 bg-muted rounded-full"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
           <div className="absolute flex justify-between w-full top-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 rounded-full border-2 ${step >= 1 ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'}`}></div>
                <div className={`w-4 h-4 rounded-full border-2 ${step >= 2 ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'}`}></div>
                <div className={`w-4 h-4 rounded-full border-2 ${step >= 3 ? 'bg-primary border-primary' : 'bg-muted border-muted-foreground'}`}></div>
           </div>
        </div>
        <div className="flex justify-between text-xs mt-2 text-muted-foreground">
            <span className={step >= 1 ? 'text-primary font-semibold' : ''}>Personal</span>
            <span className={step >= 2 ? 'text-primary font-semibold' : ''}>Account</span>
            <span className={step >= 3 ? 'text-primary font-semibold' : ''}>Review</span>
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
          <div className="space-y-2 relative">
            <Label htmlFor="password" className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Create a Password</Label>
            <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" required className="text-lg pr-10" onChange={(e) => setPassword(e.target.value)} defaultValue={formData.get('password')?.toString()} />
             <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-base"><Lock className="h-4 w-4" />Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required className="text-lg" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
      )}

       {step === 3 && (
        <div className="space-y-6 animate-in fade-in-30 duration-500">
            <Card>
                <CardHeader>
                    <CardTitle>Review Your Details</CardTitle>
                    <CardDescription>Please confirm your information is correct before submitting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{formData.get('name')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-semibold">{formData.get('phoneNumber')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-semibold">{formData.get('username')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Password:</span>
                        <span className="font-semibold font-mono">{'*'.repeat(formData.get('password')?.toString().length ?? 0)}</span>
                    </div>
                </CardContent>
            </Card>
            <div className="space-y-2">
                <Label htmlFor="document" className="flex items-center gap-2 text-base"><FileCheck className="h-4 w-4" />Upload ID Document</Label>
                <Input id="document" name="document" type="file" required accept="image/*,.pdf" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
                <p className="text-sm text-muted-foreground">
                   {fileName ? `File selected: ${fileName}` : 'Please upload a PDF or image of your ID.'}
                </p>
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
        {step < 3 ? (
          <Button type="button" onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <SubmitButton>
            <UserPlus className="mr-2 h-5 w-5" />
            Confirm & Sign Up
          </SubmitButton>
        )}
      </div>

      {state?.message && !state.success && (
        <p className="text-sm font-medium text-destructive text-center">{state.message}</p>
      )}
    </form>
  );
}
