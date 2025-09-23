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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary tracking-tight">
          Luco WIFI
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {packages.map((pkg) => (
          <Link href={`/packages/${pkg.slug}`} key={pkg.slug} className="flex">
            <Card className="flex flex-col w-full transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50">
              <CardHeader className="p-4">
                <CardTitle className="font-headline text-lg">{pkg.name}</CardTitle>
                <CardDescription className="text-xs truncate">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
                <div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold font-headline">UGX {pkg.price}</span>
                    {pkg.slug.includes('month') && <span className="text-muted-foreground text-xs"> / month</span>}
                  </div>
                </div>
                <div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {pkg.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-primary" />
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
