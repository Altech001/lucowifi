import { packages } from "@/lib/data";
import { Wifi, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary tracking-tight">
          Luco WIFI
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 text-2xl font-semibold font-headline text-foreground">
            <Wifi className="text-primary" />
            <CardTitle>Available Packages</CardTitle>
          </div>
          <CardDescription>Select a plan to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                className="block"
              >
                <div className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary text-lg whitespace-nowrap">
                      ${pkg.price}
                    </span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
