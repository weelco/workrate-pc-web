import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Shown in place of real data when Supabase is configured (i.e. we're
// past demo mode) but nobody's signed in yet — RLS would otherwise just
// return zero rows silently, which reads as "it's broken" rather than
// "please sign in."
export function SignInPrompt() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-sm font-semibold text-ink">Sign in to see live data</h2>
          <p className="mt-1 text-sm text-ink-muted">
            This project is connected to real employee data, which is only visible once you sign
            in with your Workrate account.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
