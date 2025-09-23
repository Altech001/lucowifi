
import Link from "next/link";
import { BarChart, Home, Ticket, Users, UserCog, LogOut, Settings, Package, PlusCircle, Menu } from "lucide-react";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">VoucherWave</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Ticket className="h-4 w-4" />
                Vouchers
              </Link>
              <Link
                href="/admin/active-vouchers"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Active Vouchers
              </Link>
              <Link
                href="/admin/members"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <UserCog className="h-4 w-4" />
                Members
              </Link>
              <Link
                href="/admin/analyze"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BarChart className="h-4 w-4" />
                Analyze
              </Link>
               <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
             <form action={logout}>
                <Button size="sm" className="w-full" type="submit">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
         <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                    >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                     <nav className="grid gap-2 text-lg font-medium">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-lg font-semibold mb-4"
                        >
                            <Package className="h-6 w-6" />
                            <span className="sr-only">VoucherWave</span>
                        </Link>
                        <Link href="/admin" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <Ticket className="h-5 w-5" />
                            Vouchers
                        </Link>
                        <Link href="/admin/active-vouchers" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <Users className="h-5 w-5" />
                            Active Vouchers
                        </Link>
                        <Link href="/admin/members" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <UserCog className="h-5 w-5" />
                            Members
                        </Link>
                        <Link href="/admin/analyze" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <BarChart className="h-5 w-5" />
                            Analyze
                        </Link>
                        <Link href="/admin/settings" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </nav>
                     <div className="mt-auto">
                        <form action={logout}>
                            <Button size="sm" className="w-full" type="submit">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/packages/new">
                <PlusCircle className="h-4 w-4" />
                New Package
              </Link>
            </Button>
         </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
