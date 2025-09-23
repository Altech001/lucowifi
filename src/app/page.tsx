import { packages } from "@/lib/data";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary tracking-tight">
          VoucherWave
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
          Get connected in seconds. Select a package and receive your voucher via WhatsApp instantly.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {packages.map((pkg) => (
          <Link href={`/packages/${pkg.slug}`} key={pkg.slug} className="group flex">
            <Card className="flex flex-col w-full transition-all duration-300 ease-in-out border-2 border-transparent group-hover:border-primary group-focus:border-primary group-focus:ring-2 group-focus:ring-primary/50">
              <CardHeader className="p-4">
                <CardTitle className="font-headline text-lg sm:text-xl">{pkg.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-4">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-bold font-headline">UGX {pkg.price.toLocaleString()}</span>
                  {pkg.slug.includes('month') && <span className="text-xs text-muted-foreground block"> / month</span>}
                </div>
              </CardContent>
              <CardFooter className="p-4">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
