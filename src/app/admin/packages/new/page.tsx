
import Link from "next/link";
import { NewPackageForm } from "./new-package-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";


export default function NewPackagePage() {
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
                    <BreadcrumbPage>New Package</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Card className="max-w-2xl">
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <PlusCircle className="h-6 w-6" />
                        <CardTitle className="font-headline text-2xl">Create a New Voucher Package</CardTitle>
                    </div>
                    <CardDescription>
                        Fill out the details below to add a new package to the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NewPackageForm />
                </CardContent>
            </Card>
        </div>
    )
}
