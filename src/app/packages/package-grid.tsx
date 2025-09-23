
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Package } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { CheckCircle, Wifi, UserCheck, UserPlus, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MembershipLoginForm } from './membership-login-form';


export function PackageGrid({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const loading = packages.length === 0;
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleCardClick = (pkg: Package) => {
    if (pkg.slug === 'monthly-membership') {
      setIsMembershipDialogOpen(true);
    } else {
      router.push(`/voucher/purchase?package=${pkg.slug}`);
    }
  };

  const handleCloseDialog = () => {
    setIsMembershipDialogOpen(false);
    // Reset the view when closing
    setTimeout(() => {
        setShowLogin(false);
    }, 300);
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="flex flex-col w-full">
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-4 pt-0">
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 bg-muted/50 border-t mt-auto">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          packages.map((pkg) => (
            <Card
              key={pkg.slug}
              className="flex flex-col w-full transition-all duration-300 ease-in-out border-2 border-transparent hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50 cursor-pointer group"
              onClick={() => handleCardClick(pkg)}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(pkg)}
            >
              <CardHeader className="p-4">
                <CardTitle className="font-headline text-lg sm:text-xl">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-4 pt-0">
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-bold font-headline">UGX {pkg.price.toLocaleString()}</span>
                  {pkg.slug === 'monthly-membership' && <span className="text-xs text-muted-foreground block"> / month</span>}
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-muted/50 border-t mt-auto">
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground w-full">
                  {pkg.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
       <Dialog open={isMembershipDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent>
                {!showLogin ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                                <Wifi className="text-primary" />
                                Membership Check
                            </DialogTitle>
                            <DialogDescription>
                                Are you already a Luco WIFI member?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                           <Button variant="outline" onClick={() => setShowLogin(true)} className="h-20 flex-col gap-2 text-base">
                                <UserCheck className="h-6 w-6" />
                                Yes, I am a member
                            </Button>
                             <Button onClick={() => router.push('/membership')} className="h-20 flex-col gap-2 text-base">
                                <UserPlus className="h-6 w-6" />
                                No, sign me up
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                         <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                                <KeyRound className="text-primary" />
                                Member Login
                            </DialogTitle>
                            <DialogDescription>
                                Enter your username to find your account details.
                            </DialogDescription>
                        </DialogHeader>
                        <MembershipLoginForm />
                        <DialogFooter>
                            <Button variant="link" onClick={() => setShowLogin(false)}>Back</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </>
  );
}
