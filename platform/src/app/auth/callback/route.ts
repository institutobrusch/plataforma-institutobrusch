import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Troca o "code" do OAuth (Google) por uma sessão e redireciona para a plataforma.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/app`);
}
