

'use client';
import { useActionState, useEffect, useRef } from 'react';
import { addAnnouncementAction, deleteAnnouncementAction } from '@/app/actions';
import type { Announcement } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const initialAnnouncementState = {
    message: '',
    success: false
};

type AnnouncementsFormProps = {
    announcements: Announcement[];
}

export function AnnouncementsForm({ announcements }: AnnouncementsFormProps) {
    const { toast } = useToast();
    const [addState, addFormAction] = useActionState(addAnnouncementAction, initialAnnouncementState);
    const addFormRef = useRef<HTMLFormElement>(null);

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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6" />
                    <CardTitle>Manage Announcements</CardTitle>
                </div>
                <CardDescription>Create, view, and delete site-wide announcements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form ref={addFormRef} action={addFormAction} className="p-4 border rounded-lg space-y-4">
                        <h3 className="font-semibold">Add New Announcement</h3>
                        <div className="space-y-2">
                        <Label htmlFor="text">Announcement Text</Label>
                        <Textarea id="text" name="text" placeholder="e.g., Get 20% off all plans this week!" required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                        <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/image.png" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="showImage" name="showImage" />
                            <Label htmlFor="showImage" className="font-normal">Show image in announcement</Label>
                        </div>
                        <SubmitButton>Add Announcement</SubmitButton>
                </form>

                <div>
                    <h3 className="font-semibold mb-2">Current Announcements</h3>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted">
                                <TableRow>
                                    <TableHead>Text</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Visible</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.length > 0 ? announcements.map(anc => (
                                    <TableRow key={anc.id}>
                                        <TableCell className="max-w-xs truncate">{anc.text}</TableCell>
                                        <TableCell>
                                            {anc.imageUrl ? <ImageIcon className="h-5 w-5"/> : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                         <TableCell>
                                            {anc.showImage ? <Check className="h-5 w-5 text-green-500" /> : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form action={deleteAnnouncementAction}>
                                                <input type="hidden" name="announcementId" value={anc.id} />
                                                <SubmitButton variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </SubmitButton>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No announcements yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
