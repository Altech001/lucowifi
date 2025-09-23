
'use client';

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPackageAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";


const initialState = {
    message: '',
    success: false,
};

export function NewPackageForm() {
    const [state, formAction] = useActionState(createPackageAction, initialState);
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message) {
             if (state.success) {
                toast({
                    title: "Success",
                    description: state.message,
                });
                router.push('/admin');
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to Create Package",
                    description: state.message,
                });
            }
        }
    }, [state, toast, router]);


    return (
        <form ref={formRef} action={formAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input id="name" name="name" placeholder="e.g., 3 Days" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">Price (UGX)</Label>
                    <Input id="price" name="price" type="number" placeholder="e.g., 2000" required />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="durationHours">Duration (in hours)</Label>
                <Input id="durationHours" name="durationHours" type="number" placeholder="e.g., 72 for 3 days" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Input id="description" name="description" placeholder="e.g., Perfect for a weekend." required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="details">Features / Details</Label>
                <Textarea id="details" name="details" placeholder="e.g., High-speed internet, Up to 2 devices" required />
                 <p className="text-sm text-muted-foreground">
                    Enter each feature on a new line.
                </p>
            </div>
             <SubmitButton>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Package
            </SubmitButton>
        </form>
    )
}
