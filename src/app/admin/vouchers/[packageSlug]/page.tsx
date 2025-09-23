
import Link from "next/link";
import { getPackages, getVouchersForPackage } from "@/lib/database-data";
import { VoucherTable } from "./voucher-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";


export default async function VouchersPage({ params }: { params: { packageSlug: string } }) {
    const { packageSlug } = params;
    const packages = await getPackages();
    const selectedPackage = packages.find(p => p.slug === packageSlug);
    const vouchers = await getVouchersForPackage(packageSlug);

    if (!selectedPackage) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Package not found</h1>
                <p className="text-muted-foreground">The package you selected does not exist.</p>
                <Breadcrumb className="flex justify-center mt-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">
                                Back to Admin
                            </Link>
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Vouchers</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbPage>{selectedPackage.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <Ticket className="h-6 w-6" />
                                <CardTitle className="font-headline text-2xl">
                                    Vouchers for <span className="text-primary">{selectedPackage.name}</span>
                                </CardTitle>
                            </div>
                            <CardDescription>
                                View, add, edit, or delete vouchers for this package.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                   <VoucherTable vouchers={vouchers} packageSlug={packageSlug} />
                </CardContent>
            </Card>
        </div>
    )
}
