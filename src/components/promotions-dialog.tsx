
'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import Link from 'next/link';
import type { Promotion } from '@/lib/definitions';
import { usePromotions } from '@/hooks/use-promotions';

type PromotionsDialogProps = {
    promotions: Promotion[];
}

export function PromotionsDialog({ promotions }: PromotionsDialogProps) {
  const { isOpen, setIsOpen } = usePromotions();

  useEffect(() => {
    if (promotions.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // Delay opening for 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [setIsOpen, promotions.length]);

  if (promotions.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <div className="flex items-center justify-center mb-4">
                <Gift className="h-16 w-16 text-primary animate-in fade-in-50 slide-in-from-top-10 duration-700" />
            </div>
          <DialogTitle className="text-center font-headline text-2xl">
            Today's Special Promotions!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Check out these limited-time offers. Click on any promotion to purchase.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promotions.map(promo => (
                    <Link key={promo.id} href={`/voucher/purchase?package=${promo.packageSlug}`} onClick={() => setIsOpen(false)}>
                        <Card className="h-full bg-primary/5 border-primary border-dashed hover:bg-primary/10 transition-colors">
                             <CardHeader>
                                <CardTitle className="font-headline text-lg">{promo.packageName}</CardTitle>
                                <CardDescription>{promo.packageDescription}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-semibold">Use Code:</p>
                                <p className="text-2xl font-mono font-bold text-primary">{promo.code}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
