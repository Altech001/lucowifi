
'use client';

import { useRouter } from 'next/navigation';
import { packages } from '@/lib/data';
import type { Package } from '@/lib/data';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleCardClick = (pkg: Package) => {
    if (pkg.slug === 'monthly-membership') {
      router.push('/membership');
    } else {
      router.push(`/voucher/purchase?package=${pkg.slug}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary tracking-tight">
          Luco WIFI
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {packages.map((pkg) => (
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
                <span className="text-3xl sm:text-4xl font-bold font-headline">UGX {pkg.price.toLocaleString()}</span>
                {pkg.slug.includes('month') && <span className="text-xs text-muted-foreground block"> / month</span>}
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
        ))}
      </div>
    </div>
  );
}
