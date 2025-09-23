import { packages } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Wifi } from "lucide-react";
import { PurchaseForm } from "./purchase-form";

export default function PackagePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const pkg = packages.find((p) => p.slug === slug);

  if (!pkg) {
    notFound();
  }

  const image = PlaceHolderImages.find((img) => img.id === pkg.imageId);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        
        <Card className="overflow-hidden">
          {image && (
            <div className="relative h-64 w-full">
               <Image
                src={image.imageUrl}
                alt={image.description}
                data-ai-hint={image.imageHint}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{pkg.name}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-4">
              <span className="text-5xl font-bold font-headline">${pkg.price}</span>
              <span className="text-muted-foreground text-sm"> / one-time purchase</span>
            </div>
            <ul className="space-y-3 text-base">
              {pkg.details.map((detail, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Wifi className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Complete Your Purchase</h2>
              </div>
              <CardDescription>
                Enter your WhatsApp phone number to receive your voucher code instantly.
                Please include your country code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
