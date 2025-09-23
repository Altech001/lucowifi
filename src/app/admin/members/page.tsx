
import Link from "next/link";
import { getMemberships } from "@/lib/database-data";
import { MembersTable } from "./members-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default async function MembersPage() {
    const members = await getMemberships();
    
    return (
        <div className="space-y-4">
             <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Vouchers</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                     <BreadcrumbPage>Members</BreadcrumbPage>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <UserCog className="h-6 w-6" />
                                <CardTitle className="font-headline text-2xl">
                                    Membership Management ({members.length})
                                </CardTitle>
                            </div>
                            <CardDescription>
                                View, approve, or reject membership applications.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                   <MembersTable members={members} />
                </CardContent>
            </Card>
        </div>
    )
}
