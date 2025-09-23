


import { getPackages, getPromotions, getAnnouncements, getPopupSettings } from "@/lib/database-data";
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


export default async function SettingsPage() {
    const packages = await getPackages();
    const promotions = await getPromotions();
    const announcements = await getAnnouncements();
    const popupSettings = await getPopupSettings();

    return (
        <div className="space-y-4">
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
            
            <SettingsForm 
                packages={packages} 
                promotions={promotions} 
                announcements={announcements} 
                popupSettings={popupSettings}
            />
        </div>
    )
}
