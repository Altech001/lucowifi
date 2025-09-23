
import { getPackages, getPromotions } from '@/lib/database-data';
import { PackageGrid } from '@/app/packages/package-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const packages = await getPackages();
  const promotions = await getPromotions();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-5xl font-bold font-headline text-primary tracking-tight leading-tight">
          <span className="block">Grab Your</span>
          <span className="block">Voucher Coupon</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      {promotions.length > 0 && (
        <section className="mb-12">
            <h2 className="text-2xl font-bold font-headline text-center mb-6 flex items-center justify-center gap-3">
                <Gift className="text-primary h-7 w-7" />
                Special Promotions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map(promo => (
                    <Link key={promo.id} href={`/voucher/purchase?package=${promo.packageSlug}`}>
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
             <div className="my-8 h-[1px] w-full max-w-sm mx-auto bg-border"></div>
        </section>
      )}

      <PackageGrid packages={packages} />
    </div>
  );
}
