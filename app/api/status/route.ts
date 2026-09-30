import { NextResponse } from "next/server";
import { onlineCount } from "@/lib/repos/rankings";

// Status público do servidor para o launcher (players online reais).
export const dynamic = "force-dynamic";

export async function GET() {
  let online = 0;
  try {
    online = await onlineCount();
  } catch {
    online = 0;
  }
  return NextResponse.json(
    { online, server: "L2 Versus", status: "online" },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } }
  );
}
