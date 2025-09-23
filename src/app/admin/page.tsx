
import Link from "next/link";
import { PlusCircle, Ticket, Eye, Trash2, Database, Clock, CheckCircle } from "lucide-react";
import { getPackages } from "@/lib/database-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePackageAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export default async function AdminDashboard() {
  const voucherPackages = await getPackages();

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {voucherPackages.map((pkg) => (
          <Card key={pkg.slug} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-headline">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.price.toLocaleString()}{pkg.slug === 'monthly-membership' ? ' / month' : ' UGX'}
                    </CardDescription>
                </div>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={pkg.slug === 'monthly-membership'}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Package</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this package?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the <strong>{pkg.name}</strong> package and all <strong>({pkg.voucherCount ?? 0})</strong> of its associated vouchers. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form action={deletePackageAction}>
                        <input type="hidden" name="packageSlug" value={pkg.slug} />
                        <SubmitButton variant="destructive">Delete Package</SubmitButton>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-2 text-xs text-muted-foreground w-full">
                  {pkg.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{detail}</span>
                    </li>
                  ))}
                </ul>
               {pkg.slug !== 'monthly-membership' && (
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>{pkg.voucherCount ?? 0} Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{pkg.durationHours} hours</span>
                    </div>
                </div>
              )}
            </CardContent>
            {pkg.slug !== 'monthly-membership' && (
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button asChild className="w-full">
                  <Link href={`/admin/upload/${pkg.slug}`}>
                    Upload Vouchers
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/admin/vouchers/${pkg.slug}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Vouchers
                  </Link>
                </Button>
              </CardFooter>
            )}
             {pkg.slug === 'monthly-membership' && (
                 <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/admin/members">
                            <Eye className="mr-2 h-4 w-4" />
                            View Members
                        </Link>
                    </Button>
                </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
