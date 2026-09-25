"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Entra ID sign-in via Supabase Auth's Azure (OIDC) provider. The
// provider itself is configured in the Supabase dashboard (Authentication
// -> Providers -> Azure) against an Entra App Registration — see the
// architecture roadmap doc for the setup steps; nothing here needs to
// change when that config does.
export default function LoginPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase isn't configured in this environment.");
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid profile email",
      },
    });
    if (error) {
      setError(error.message);
      setPending(false);
    }
    // On success the browser is redirected to Entra ID immediately;
    // nothing further to render.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8 text-center">
          <span className="text-sm font-bold tracking-widest text-navy">WORKRATE</span>
          <h1 className="mt-4 text-lg font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Use your Workrate Microsoft account to continue.
          </p>
          <Button onClick={handleSignIn} disabled={pending} className="mt-6 w-full">
            {pending ? "Redirecting…" : "Sign in with Microsoft"}
          </Button>
          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
