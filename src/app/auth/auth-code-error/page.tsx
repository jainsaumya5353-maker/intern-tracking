'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive uppercase tracking-tight font-bold">Authentication Error</CardTitle>
          <CardDescription>
            {errorMsg ? `Details: ${errorMsg}` : 'Something went wrong while trying to sign you in.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground p-4 bg-secondary rounded-md">
            <p className="font-semibold mb-2">Possible reasons:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Google OAuth is not configured in your Supabase project.</li>
              <li>Incorrect Redirect URI in Google Cloud Console.</li>
              <li>Expired or invalid login code.</li>
            </ul>
          </div>
          <Link href="/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}

