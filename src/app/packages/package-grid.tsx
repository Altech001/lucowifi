
'use client';

import { useRouter } from 'next/navigation';
import type { Package } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PackageGrid({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const loading = packages.length === 0;

  const handleCardClick = (pkg: Package) => {
    if (pkg.slug === 'monthly-membership') {
      router.push('/membership');
    } else {
      router.push(`/voucher/purchase?package=${pkg.slug}`);
    }
  };

  return (
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
                {pkg.details.slice(0, 2).map((detail, index) => (
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
  );
}
