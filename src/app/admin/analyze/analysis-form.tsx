
'use client';

import { useActionState } from "react";
import { useEffect, useRef, useState } from "react";
import { analyzeProfileAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb, BarChart, FileUp, Database } from "lucide-react";

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

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [fileName, setFileName] = useState('');

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
            setCsvHeaders([]);
            setCsvRows([]);
            setFileName('');
        }
    }, [state, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const allRows = text.split(/\r\n|\n/);
                const headers = allRows.shift()?.split(',') ?? [];
                setCsvHeaders(headers);
                const rows = allRows.filter(row => row.trim() !== '').map(row => row.split(','));
                setCsvRows(rows);
            };
            reader.readAsText(file);
        } else {
             setCsvHeaders([]);
             setCsvRows([]);
             setFileName('');
        }
    };


    return (
        <div className="grid gap-8">
            <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="csvFile" className="flex items-center gap-2"><FileUp className="h-4 w-4" />Upload CSV File</Label>
                    <Input id="csvFile" name="csvFile" type="file" accept=".csv" required onChange={handleFileChange} />
                </div>
                <SubmitButton disabled={!fileName}>
                    <BarChart className="mr-2 h-4 w-4" />
                    Analyze Profiles
                </SubmitButton>
            </form>

            {csvRows.length > 0 && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <Database className="h-6 w-6 text-primary" />
                             <CardTitle>CSV Data Preview: <span className="font-normal text-muted-foreground">{fileName}</span></CardTitle>
                        </div>
                        <CardDescription>
                            Showing the first {csvRows.length} rows from your file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative max-h-[60vh] overflow-auto border rounded-lg">
                             <Table>
                                <TableHeader className="sticky top-0 bg-muted">
                                    <TableRow>
                                        {csvHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {csvRows.map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {row.map((cell, cellIndex) => <TableCell key={cellIndex}>{cell}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {state.success && state.suggestion && (
                <Card className="animate-in fade-in-50 duration-500">
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
