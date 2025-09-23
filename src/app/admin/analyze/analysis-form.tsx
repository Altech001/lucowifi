'use client';

import { useActionState } from "react";
import { useEffect, useRef } from "react";
import { analyzeProfileAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, BarChart } from "lucide-react";

const initialState = {
    suggestion: undefined,
    reasoning: undefined,
    message: undefined,
    success: false,
};

export function AnalysisForm() {
    const [state, formAction] = useActionState(analyzeProfileAction, initialState);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message && !state.success) {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: state.message,
            });
        }
        if (state.success) {
            toast({
                title: "Analysis Complete",
                description: "Suggestion generated successfully.",
            });
            formRef.current?.reset();
        }
    }, [state, toast]);

    return (
        <div>
            <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input id="csvFile" name="csvFile" type="file" accept=".csv" required />
                </div>
                <SubmitButton>
                    <BarChart className="mr-2 h-4 w-4" />
                    Analyze Profiles
                </SubmitButton>
            </form>

            {state.success && state.suggestion && (
                <Card className="mt-8 animate-in fade-in-50 duration-500">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Lightbulb className="h-6 w-6 text-primary" />
                            <CardTitle className="font-headline text-2xl">AI Suggestion</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Suggested Package</h3>
                            <p className="text-lg font-bold text-primary">{state.suggestion}</p>
                        </div>
                         <div>
                            <h3 className="text-sm font-semibold text-muted-foreground">Reasoning</h3>
                            <p className="text-foreground">{state.reasoning}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
