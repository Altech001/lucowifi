
'use client';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PartyPopper, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MembershipSuccessPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center">
            <PartyPopper className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl">Welcome, {name || 'Valued Member'}!</CardTitle>
          <CardDescription>Your membership has been successfully created. We've sent a confirmation to your WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>You're all set to enjoy unlimited WIFI.</span>
          </div>
          <Button asChild>
            <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
