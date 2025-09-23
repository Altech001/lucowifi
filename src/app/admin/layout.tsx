
import Link from "next/link";
import { BarChart, Home, Ticket, Users, UserCog, LogOut, Settings, Package } from "lucide-react";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[5rem_1fr] lg:grid-cols-[5rem_1fr]">
      <div className="hidden border-r bg-muted/40 md:flex md:flex-col">
        <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
            <Package className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Luco WIFI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Ticket className="h-4 w-4" />
                <span className="sr-only">Vouchers</span>
              </Link>
              <Link
                href="/admin/active-vouchers"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                 <span className="sr-only">Active Vouchers</span>
              </Link>
              <Link
                href="/admin/members"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <UserCog className="h-4 w-4" />
                 <span className="sr-only">Members</span>
              </Link>
              <Link
                href="/admin/analyze"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BarChart className="h-4 w-4" />
                 <span className="sr-only">Analyze</span>
              </Link>
               <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                 <span className="sr-only">Settings</span>
              </Link>
            </nav>
          </div>
          <div className="mt-auto flex flex-col items-center gap-4 p-4">
             <form action={logout}>
                <Button size="icon" className="h-9 w-9" type="submit">
                    <LogOut className="h-4 w-4" />
                     <span className="sr-only">Logout</span>
                </Button>
            </form>
          </div>
      </div>
      <div className="flex flex-col">
         <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Can be used for mobile nav toggle or breadcrumbs */}
         </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
       {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background p-2 md:hidden">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
                 <Link href="/admin" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Ticket className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Vouchers</span>
                </Link>
                <Link href="/admin/active-vouchers" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Users className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Active</span>
                </Link>
                 <Link href="/admin/settings" className="inline-flex flex-col items-center justify-center px-4 hover:bg-muted rounded-lg">
                    <Settings className="w-5 h-5 mb-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Settings</span>
                </Link>
                <div className="inline-flex flex-col items-center justify-center px-4">
                    <form action={logout}>
                        <button type="submit" className="flex flex-col items-center w-full">
                            <LogOut className="w-5 h-5 mb-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Logout</span>
                        </button>
                    </form>
                </div>
            </div>
      </nav>
    </div>
  );
}
