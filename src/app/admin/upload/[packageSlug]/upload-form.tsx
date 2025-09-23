
'use client';

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadVouchersAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { CheckCircle, Database, FileUp, UploadCloud } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const initialState = {
    message: '',
    success: false,
    count: undefined,
};

type UploadFormProps = {
    packageSlug: string;
}

export function UploadForm({ packageSlug }: UploadFormProps) {
    const [state, formAction] = useActionState(uploadVouchersAction, initialState);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (state.message) {
            toast({
                variant: state.success ? "default" : "destructive",
                title: state.success ? "Upload Successful" : "Upload Failed",
                description: state.message,
            });
        }
        if (state.success) {
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


    if (state.success && state.count) {
        return (
             <Card className="w-full max-w-lg text-center mx-auto animate-in fade-in-50">
                <CardHeader className="items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                    <CardTitle className="font-headline text-2xl">Upload Complete</CardTitle>
                    <CardDescription>{state.message}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                    <Button asChild>
                        <Link href="/admin">
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }


    return (
         <div className="grid gap-8">
            <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
                <input type="hidden" name="packageSlug" value={packageSlug} />
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="csvFile" className="flex items-center gap-2"><FileUp className="h-4 w-4" />Upload Voucher CSV File</Label>
                    <Input id="csvFile" name="csvFile" type="file" accept=".csv" required onChange={handleFileChange} />
                </div>
                <SubmitButton disabled={!fileName}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Vouchers
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
                            Showing the first {csvRows.length} data rows from your file.
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
        </div>
    )
}
