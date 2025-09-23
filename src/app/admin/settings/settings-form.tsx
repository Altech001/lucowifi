

'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { addPromotionAction, deletePromotionAction, exportUserPhonesAction, sendBulkMessageAction, generateAIMessageAction } from '@/app/actions';
import type { Package, Promotion, Announcement, PopupSettings } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Gift, Trash2, Download, FileDown, Phone, MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AnnouncementsForm } from './announcements-form';
import { PopupForm } from './popup-form';

const initialPromoState = {
    message: '',
    success: false
};

const initialBulkState = {
    message: '',
    success: false,
    sentCount: 0
};

type SettingsFormProps = {
    packages: Package[];
    promotions: Promotion[];
    announcements: Announcement[];
    popupSettings: PopupSettings;
}

export function SettingsForm({ packages, promotions, announcements, popupSettings }: SettingsFormProps) {
    const { toast } = useToast();
    const [addState, addFormAction] = useActionState(addPromotionAction, initialPromoState);
    const [bulkState, bulkFormAction] = useActionState(sendBulkMessageAction, initialBulkState);
    
    const addFormRef = useRef<HTMLFormElement>(null);
    const bulkFormRef = useRef<HTMLFormElement>(null);

    const [isGenerating, startGenerating] = useTransition();
    const [messageContent, setMessageContent] = useState('');

    useEffect(() => {
        if(addState.message) {
            toast({
                variant: addState.success ? 'default' : 'destructive',
                title: addState.success ? 'Success' : 'Error',
                description: addState.message
            });
            if (addState.success) {
                addFormRef.current?.reset();
            }
        }
    }, [addState, toast]);

    useEffect(() => {
        if(bulkState.message) {
            toast({
                variant: bulkState.success ? 'default' : 'destructive',
                title: bulkState.success ? 'Bulk Send' : 'Error',
                description: bulkState.message
            });
            if (bulkState.success) {
                bulkFormRef.current?.reset();
                setMessageContent('');
            }
        }
    }, [bulkState, toast]);


    const handleExport = async () => {
        const result = await exportUserPhonesAction();
        if (result.success) {
             const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             link.setAttribute('href', url);
             link.setAttribute('download', 'luco_wifi_users.csv');
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             toast({ title: 'Export Started', description: 'Your file will be downloaded shortly.'});
        } else {
            toast({ variant: 'destructive', title: 'Export Failed', description: result.message });
        }
    };

    const handleGenerateMessage = () => {
        const messageType = (bulkFormRef.current?.elements.namedItem('messageType') as HTMLInputElement)?.value;
        if (!messageType) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide a message topic to generate content.' });
            return;
        }
        startGenerating(async () => {
            const result = await generateAIMessageAction(messageType);
            if (result.success && result.message) {
                setMessageContent(result.message);
                toast({ title: 'Success', description: 'AI message generated.' });
            } else {
                toast({ variant: 'destructive', title: 'Generation Failed', description: result.message });
            }
        });
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
                 {/* Announcements Card */}
                <AnnouncementsForm announcements={announcements} />
                
                {/* Promotions Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Gift className="h-6 w-6" />
                            <CardTitle>Manage Promotions</CardTitle>
                        </div>
                        <CardDescription>Add or remove promotional voucher codes that will be displayed on the home page.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form ref={addFormRef} action={addFormAction} className="p-4 border rounded-lg space-y-4">
                             <h3 className="font-semibold">Add New Promotion</h3>
                             <div className="space-y-2">
                                <Label htmlFor="code">Promo Code</Label>
                                <Input id="code" name="code" placeholder="e.g., FREEWIFI" required />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="packageSlug">For Package</Label>
                                <Select name="packageSlug" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a package..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.filter(p => p.slug !== 'monthly-membership').map(p => (
                                            <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                             <SubmitButton>Add Promotion</SubmitButton>
                        </form>

                        <div>
                            <h3 className="font-semibold mb-2">Current Promotions</h3>
                            <div className="border rounded-lg max-h-60 overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-muted">
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Package</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {promotions.length > 0 ? promotions.map(promo => (
                                            <TableRow key={promo.id}>
                                                <TableCell className="font-mono">{promo.code}</TableCell>
                                                <TableCell>{promo.packageName}</TableCell>
                                                <TableCell className="text-right">
                                                    <form action={deletePromotionAction}>
                                                        <input type="hidden" name="promotionId" value={promo.id} />
                                                        <SubmitButton variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                            <Trash2 className="h-4 w-4" />
                                                        </SubmitButton>
                                                    </form>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center h-24">No promotions yet.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                 {/* Popup Form Card */}
                 <PopupForm settings={popupSettings} />

                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-6 w-6" />
                            <CardTitle>Send Bulk Message</CardTitle>
                        </div>
                        <CardDescription>Send a custom SMS to all users who have purchased a voucher or signed up.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form ref={bulkFormRef} action={bulkFormAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Textarea id="message" name="message" required placeholder="Your message here..." value={messageContent} onChange={e => setMessageContent(e.target.value)} rows={5}/>
                            </div>
                            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                                <Label htmlFor="messageType">AI Message Generation</Label>
                                <div className="flex gap-2">
                                    <Input id="messageType" name="messageType" placeholder="e.g., Weekend promotion, Network maintenance" />
                                    <Button type="button" variant="outline" onClick={handleGenerateMessage} disabled={isGenerating}>
                                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                        Generate
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Let AI help you write the perfect message.</p>
                            </div>
                             <SubmitButton className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Send Message to All Users
                            </SubmitButton>
                        </form>
                    </CardContent>
                </Card>

                 {/* Data Export Card */}
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3">
                            <FileDown className="h-6 w-6" />
                            <CardTitle>Data Export</CardTitle>
                        </div>
                        <CardDescription>Download user data from the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5" />
                                <p className="font-medium">User Phone Numbers</p>
                           </div>
                           <Button onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                           </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
