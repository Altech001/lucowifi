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
import { Button } from "@/components/ui/button";

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.slug} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="mb-6">
                <span className="text-4xl font-bold font-headline">UGX {pkg.price}</span>
                {pkg.slug.includes('month') && <span className="text-muted-foreground text-sm"> / month</span>}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {pkg.details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/packages/${pkg.slug}`}>
                    Choose Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Added CheckCircle icon for package details
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
