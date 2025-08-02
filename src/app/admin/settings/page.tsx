import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                    Manage your application settings here. This is a placeholder page for now.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Future settings could include things like changing payment account numbers, setting promotional messages, or adjusting site-wide parameters.</p>
            </CardContent>
        </Card>
    );
}
