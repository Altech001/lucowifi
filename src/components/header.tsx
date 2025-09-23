
'use client';

import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Gift } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePromotions } from '@/hooks/use-promotions';


export function Header() {
    const { setIsOpen } = usePromotions();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Luco WIFI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <TooltipProvider>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                    <Gift className="h-5 w-5" />
                    <span className="sr-only">Promotions</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Promotions</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="sr-only">Admin Panel</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Admin Panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
