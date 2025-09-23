import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { Package } from "@/lib/definitions";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PackageCardProps {
  pkg: Package;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === pkg.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:hover:shadow-primary/20">
      <CardHeader className="p-0">
        {image && (
          <div className="relative h-48 w-full">
            <Image
              src={image.imageUrl}
              alt={image.description}
              data-ai-hint={image.imageHint}
              fill
              className="object-cover"
            />
          </div>
        )}
         <div className="p-6">
            <CardTitle className="font-headline text-2xl">{pkg.name}</CardTitle>
            <CardDescription className="mt-2">{pkg.description}</CardDescription>
         </div>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        <div className="my-4">
            <span className="text-4xl font-bold font-headline">${pkg.price}</span>
            <span className="text-muted-foreground text-sm"> / purchase</span>
        </div>
        <ul className="space-y-3 text-sm">
          {pkg.details.map((detail, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full" size="lg">
          <Link href={`/packages/${pkg.slug}`}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
