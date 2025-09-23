
import Link from "next/link";
import { BarChart, Home, Ticket, Users, UserCog, LogOut, Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-16 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5 flex-1">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Home className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">VoucherWave Home</span>
          </Link>
           <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Ticket className="h-5 w-5" />
            <span className="sr-only">Vouchers</span>
          </Link>
          <Link
            href="/admin/active-vouchers"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Users className="h-5 w-5" />
            <span className="sr-only">Active Vouchers</span>
          </Link>
           <Link
            href="/admin/members"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <UserCog className="h-5 w-5" />
            <span className="sr-only">Members</span>
          </Link>
          <Link
            href="/admin/analyze"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <BarChart className="h-5 w-5" />
            <span className="sr-only">Analyze Profiles</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
           <div className="mt-auto">
            <form action={logout}>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                </button>
            </form>
           </div>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* Breadcrumb can be dynamically populated by child pages */}
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 pb-20 sm:pb-0">{children}</main>
      </div>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-2 sm:hidden">
            <div className="grid h-full max-w-lg grid-cols-6 mx-auto">
                <Link href="/" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Home className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Home</span>
                </Link>
                <Link href="/admin" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Ticket className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Vouchers</span>
                </Link>
                <Link href="/admin/active-vouchers" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Users className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Active</span>
                </Link>
                <Link href="/admin/members" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <UserCog className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Members</span>
                </Link>
                <Link href="/admin/analyze" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <BarChart className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Analyze</span>
                </Link>
                 <Link href="/admin/settings" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Settings className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Settings</span>
                </Link>
            </div>
      </nav>
    </div>
  );
}
