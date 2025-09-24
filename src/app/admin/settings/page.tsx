
import { getPackages, getPromotions, getAnnouncements, getPopupSettings, getIpnLogs } from "@/lib/database-data";
import { SettingsForm } from "./settings-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import Link from "next/link";
import { Settings } from "lucide-react";
import { PesapalSettings } from "./pesapal-settings";


export default async function SettingsPage() {
    const packages = await getPackages();
    const promotions = await getPromotions();
    const announcements = await getAnnouncements();
    const popupSettings = await getPopupSettings();
    const ipnLogs = await getIpnLogs();

    return (
        <div className="space-y-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                     <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center gap-4">
                <Settings className="h-7 w-7" />
                <h1 className="text-2xl font-semibold font-headline">Application Settings</h1>
            </div>
            
             <div className="grid gap-8 md:grid-cols-2">
                <SettingsForm 
                    packages={packages} 
                    promotions={promotions} 
                    announcements={announcements} 
                    popupSettings={popupSettings}
                />
                <PesapalSettings ipnLogs={ipnLogs} />
             </div>
        </div>
    )
}
