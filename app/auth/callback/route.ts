import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Where Supabase Auth redirects back to after the Entra ID sign-in
// flow completes. Exchanges the one-time code for a real session
// (setting the auth cookies via the server client), then sends the
// person on to wherever they were headed.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/employees";

  if (code) {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
