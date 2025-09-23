import { MembershipForm } from "./membership-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function MembershipPage() {
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
            <Card className="w-full max-w-2xl border-0">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <UserPlus className="h-6 w-6" />
                        <CardTitle className="font-headline text-2xl">Become a Luco WIFI Member</CardTitle>
                    </div>
                    <CardDescription>
                        Sign up for our monthly membership to get the best value and exclusive benefits. Fill out the form below to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MembershipForm />
                </CardContent>
            </Card>
        </div>
    )
}
