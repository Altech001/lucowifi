
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updatePopupSettingsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { PopupSettings } from '@/lib/definitions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/submit-button';
import { Megaphone, Save } from 'lucide-react';

const initialState = {
    message: '',
    success: false,
};

type PopupFormProps = {
    settings: PopupSettings;
}

export function PopupForm({ settings }: PopupFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(updatePopupSettingsAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if(state.message) {
            toast({
                variant: state.success ? 'default' : 'destructive',
                title: state.success ? 'Success' : 'Error',
                description: state.message
            });
        }
    }, [state, toast]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Megaphone className="h-6 w-6" />
                    <CardTitle>Manage Welcome Popup</CardTitle>
                </div>
                <CardDescription>Control the content and visibility of the welcome popup dialog.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isEnabled" className="text-base">
                                Enable Popup
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Show the popup to users when they first visit the site each day.
                            </p>
                        </div>
                        <Switch
                            id="isEnabled"
                            name="isEnabled"
                            defaultChecked={settings.isEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Popup Title</Label>
                        <Input 
                            id="title" 
                            name="title" 
                            placeholder="e.g., Welcome Back!" 
                            defaultValue={settings.title}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Popup Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Enter the main message for the popup."
                            defaultValue={settings.description}
                            rows={4}
                        />
                    </div>
                    <SubmitButton>
                        <Save className="mr-2 h-4 w-4" />
                        Save Popup Settings
                    </SubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
