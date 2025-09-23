
import Link from "next/link";
import { PlusCircle, Ticket, Eye } from "lucide-react";
import { getPackages } from "@/lib/database-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboard() {
  const voucherPackages = await getPackages();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-headline">Voucher Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage packages and their associated voucher codes.
          </p>
        </div>
        <Button asChild>
            <Link href="/admin/packages/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Package
            </Link>
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
            <CardFooter className="grid grid-cols-2 gap-2">
               <Button asChild className="w-full">
                <Link href={`/admin/upload/${pkg.slug}`}>
                  Upload Vouchers
                </Link>
              </Button>
               <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/vouchers/${pkg.slug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Vouchers
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
