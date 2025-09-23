
'use client';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MembershipSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Request Received!</CardTitle>
          <CardDescription>Your membership request has been submitted. We've sent a confirmation to your WhatsApp and will notify you upon approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <span>You're all set to enjoy unlimited WIFI once approved.</span>
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
