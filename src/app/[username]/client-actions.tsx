'use client';

import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

export default function RecruiterActions({ email }: { email: string }) {
    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                </a>
            </Button>
            <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
            </Button>
        </div>
    );
}
