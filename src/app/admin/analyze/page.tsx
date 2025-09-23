import { AnalysisForm } from "./analysis-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AnalyzePage() {
    return (
        <>
            <div className="mb-4">
                <h1 className="text-2xl font-semibold font-headline">Analyze Mikrotik Profiles</h1>
                <p className="text-sm text-muted-foreground">
                    Upload a CSV file containing user profile data. Our AI will analyze it and suggest the most suitable voucher package.
                </p>
            </div>
            <AnalysisForm />
        </>
    )
}
