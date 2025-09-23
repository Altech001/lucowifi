
'use client';

import { useSearchParams } from 'next/navigation';
import { getPackages } from '@/lib/firestore-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseForm } from './purchase-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useEffect, useState } from 'react';
import type { Package } from '@/lib/definitions';


export default function PurchasePage() {
    const searchParams = useSearchParams();
    const packageSlug = searchParams.get('package');
    const [selectedPackage, setSelectedPackage] = useState<Package | undefined>(undefined);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchPackage() {
            if (packageSlug) {
                const pkgs = await getPackages();
                const foundPackage = pkgs.find(p => p.slug === packageSlug);
                setSelectedPackage(foundPackage);
            }
            setLoading(false);
        }
        fetchPackage();
    }, [packageSlug]);

    if (loading) {
        return (
             <div className="container mx-auto px-4 py-8 text-center">
                <p>Loading...</p>
            </div>
        )
    }

    if (!selectedPackage) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Package not found</h1>
                <p className="text-muted-foreground">The package you selected does not exist.</p>
                 <Breadcrumb className="flex justify-center mt-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Packages
                            </Link>
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        )
    }
    
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Packages</Link>
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                        <BreadcrumbPage>Purchase</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-lg border-0">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">
                            Purchase: <span className="text-primary">{selectedPackage.name}</span>
                        </CardTitle>
                        <CardDescription>
                            Enter your WhatsApp phone number to receive your voucher code for UGX {selectedPackage.price.toLocaleString()}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PurchaseForm packageSlug={selectedPackage.slug} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
