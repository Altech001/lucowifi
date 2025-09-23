
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, PartyPopper } from 'lucide-react';

const announcements = [
    {
        title: "Daily Prize Draw!",
        description: "Every voucher purchase today enters you into a draw to win 1GB of bonus data. Winner announced at 8 PM!",
    },
    {
        title: "Weekend Special",
        description: "Buy any package over 5,000 UGX this weekend and get a free 1-hour voucher for a friend.",
    },
    {
        title: "Speed Boost Active",
        description: "We've boosted network speeds by 20% across all locations for the next 48 hours. Enjoy the fast lane!",
    }
];

// Get a consistent announcement for the day
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
const announcement = announcements[dayOfYear % announcements.length];


export function AnnouncementDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); // Delay opening for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="flex items-center justify-center mb-4">
                <PartyPopper className="h-16 w-16 text-primary animate-in fade-in-50 slide-in-from-top-10 duration-700" />
            </div>
          <DialogTitle className="text-center font-headline text-2xl">
            {announcement.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {announcement.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
          <Button type="button" onClick={() => setIsOpen(false)}>
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
