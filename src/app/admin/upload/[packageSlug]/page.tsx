
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { packages } from "@/lib/data";
import { UploadForm } from "./upload-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function UploadPage({ params }: { params: { packageSlug: string } }) {
    const pathname = usePathname();
    const packageSlug = pathname.split('/').pop();
    const selectedPackage = packages.find(p => p.slug === packageSlug);

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

            <div className="mb-4">
                <h1 className="text-2xl font-semibold font-headline">
                    Upload Vouchers for <span className="text-primary">{selectedPackage.name}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV file containing the voucher codes for this package.
                </p>
            </div>
            
            <UploadForm packageSlug={selectedPackage.slug} />
        </div>
    )
}
