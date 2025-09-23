import { AnalysisForm } from "./analysis-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AnalyzePage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    <CardTitle className="font-headline text-2xl">Analyze Mikrotik Profiles</CardTitle>
                </div>
                <CardDescription>
                    Upload a CSV file containing user profile data. Our AI will analyze it and suggest the most suitable voucher package.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AnalysisForm />
            </CardContent>
        </Card>
    )
}
