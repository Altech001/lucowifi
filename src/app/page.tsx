import { PackageCard } from "@/components/package-card";
import { packages } from "@/lib/data";
import { Wifi } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary tracking-tight">
          VoucherWave
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Instant connectivity, delivered. Choose a package to get started and receive your voucher via WhatsApp in seconds.
        </p>
      </header>

      <div className="mb-12">
        <div className="flex items-center justify-center gap-2 text-2xl font-semibold font-headline text-foreground mb-6">
          <Wifi className="text-primary" />
          <h2>Available Packages</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </div>
    </div>
  );
}
