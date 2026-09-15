import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: "middleware" agora se chama Proxy (mesma função).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand|fotos|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
