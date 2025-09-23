import Link from "next/link";
import { getAllVouchersWithPackageInfo, getVoucherStatus } from "@/lib/database-data";
import { ActiveVouchersTable } from "./active-vouchers-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function ActiveVouchersPage() {
    const allVouchers = await getAllVouchersWithPackageInfo();
    
    const activeVouchers = allVouchers.filter(v => {
        const status = getVoucherStatus(v, v.packageDurationHours);
        return status.status === 'Active';
    }).map(v => {
        const { expiry } = getVoucherStatus(v, v.packageDurationHours);
        return {
            ...v,
            expiry,
        };
    });

    return (
        <div className="space-y-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Vouchers</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                     <BreadcrumbPage>Active Vouchers</BreadcrumbPage>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <Users className="h-6 w-6" />
                                <CardTitle className="font-headline text-2xl">
                                    Active Vouchers ({activeVouchers.length})
                                </CardTitle>
                            </div>
                            <CardDescription>
                                View all currently active vouchers across all packages.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                   <ActiveVouchersTable vouchers={activeVouchers} />
                </CardContent>
            </Card>
        </div>
    )
}
