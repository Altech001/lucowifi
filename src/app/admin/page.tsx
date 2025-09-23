import Link from "next/link";
import { PlusCircle, Ticket } from "lucide-react";
import { packages } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const voucherPackages = packages.filter(p => p.slug !== 'monthly-membership');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-headline">Voucher Management</h1>
          <p className="text-sm text-muted-foreground">
            Select a package to upload and manage voucher codes.
          </p>
        </div>
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Package
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {voucherPackages.map((pkg) => (
          <Card key={pkg.slug}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">{pkg.name}</CardTitle>
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <CardDescription>UGX {pkg.price.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {pkg.details.join(' • ')}
              </p>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full">
                <Link href={`/admin/upload/${pkg.slug}`}>
                  Manage Vouchers
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
