import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { AnnouncementBar } from '@/components/announcement-bar';
import { AnnouncementDialog } from '@/components/announcement-dialog';
import { PromotionsDialog } from '@/components/promotions-dialog';
import { getPromotions, getAnnouncements, getPopupSettings } from '@/lib/database-data';

export const metadata: Metadata = {
  title: 'Luco WIFI',
  description: 'Purchase and receive voucher codes instantly.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const promotions = await getPromotions();
  const announcements = await getAnnouncements();
  const popupSettings = await getPopupSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <AnnouncementBar announcements={announcements} />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          <AnnouncementDialog settings={popupSettings} />
          <PromotionsDialog promotions={promotions} />
        </Providers>
      </body>
    </html>
  );
}
