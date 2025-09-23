import { packages } from "@/lib/data";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {packages.map((pkg) => (
          <Link href={`/packages/${pkg.slug}`} key={pkg.slug} className="flex">
            <Card className="flex flex-col w-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{pkg.name}</CardTitle>
                <CardDescription className="text-sm">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold font-headline">UGX {pkg.price}</span>
                    {pkg.slug.includes('month') && <span className="text-muted-foreground text-xs"> / month</span>}
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {pkg.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
