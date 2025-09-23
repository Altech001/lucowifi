
'use client';

import { useSearchParams } from 'next/navigation';
import { packages } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseForm } from './purchase-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function PurchasePage() {
    const searchParams = useSearchParams();
    const packageSlug = searchParams.get('package');

    const selectedPackage = packages.find(p => p.slug === packageSlug);

    if (!selectedPackage) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Package not found</h1>
                <p className="text-muted-foreground">The package you selected does not exist.</p>
                 <Button asChild variant="link" className="mt-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Packages
                    </Link>
                </Button>
            </div>
        )
    }
    
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
            <Card className="w-full max-w-lg">
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
    )
}
