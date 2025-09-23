
'use client';

import { useState } from 'react';
import { Megaphone, Pause, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import type { Announcement } from '@/lib/definitions';

type AnnouncementBarProps = {
  announcements: Announcement[];
};

export function AnnouncementBar({ announcements = [] }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const announcementTexts = announcements.map(a => a.text);

  return (
    <div className="bg-background dark:bg-zinc-900 border-b text-foreground text-xs sm:text-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-10">
          <Megaphone className="h-4 w-4 shrink-0 mr-2" />
          <div className="flex-1 overflow-hidden">
            <div
              className={cn(
                'flex items-center gap-6 animate-[marquee_40s_linear_infinite]',
                { 'animation-play-state-paused': isPaused }
              )}
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {/* Render items twice for seamless loop */}
              {[...announcementTexts, ...announcementTexts].map((text, index) => (
                <a
                  key={index}
                  href="#"
                  className="whitespace-nowrap hover:text-primary transition-colors"
                >
                  {text}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsPaused(!isPaused)}
            >
              <Pause className="h-3 w-3" />
              <span className="sr-only">Pause announcements</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Close announcements</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
