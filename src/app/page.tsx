
import { getPackages } from '@/lib/database-data';
import { PackageGrid } from '@/app/packages/package-grid';

export default async function Home() {
  const packages = await getPackages();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-primary tracking-tight">
          Grab Your Voucher Coupon
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      <PackageGrid packages={packages} />
    </div>
  );
}
