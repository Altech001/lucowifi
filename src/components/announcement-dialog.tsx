
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
import { PartyPopper } from 'lucide-react';
import type { PopupSettings } from '@/lib/definitions';

type AnnouncementDialogProps = {
  settings: PopupSettings;
}

export function AnnouncementDialog({ settings }: AnnouncementDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!settings.isEnabled || !settings.title) {
        return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); // Delay opening for 1.5 seconds

    return () => clearTimeout(timer);
  }, [settings]);

  if (!settings.isEnabled || !settings.title) {
      return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="flex items-center justify-center mb-4">
                <PartyPopper className="h-16 w-16 text-primary animate-in fade-in-50 slide-in-from-top-10 duration-700" />
            </div>
          <DialogTitle className="text-center font-headline text-2xl">
            {settings.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {settings.description}
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
