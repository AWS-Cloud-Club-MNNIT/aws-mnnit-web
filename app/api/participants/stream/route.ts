import { NextResponse } from "next/server";
import { emitter } from "@/lib/eventEmitter";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  // Check authorization
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");
  const managerToken = cookieStore.get("manager_token");

  const isAdmin =
    adminToken && adminToken.value === (process.env.ADMIN_PASSWORD || "awsmnnit");
  const isManager =
    managerToken && managerToken.value === (process.env.MANAGER_PASSWORD || "scdmanagermnnit@2026");

  if (!isAdmin && !isManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  const pingInterval = setInterval(async () => {
    try {
      await writer.write(new TextEncoder().encode(": ping\n\n"));
    } catch {
      clearInterval(pingInterval);
    }
  }, 20000); // 20s keep-alive

  const onUpdate = async (data: Record<string, unknown>) => {
    try {
      await writer.write(
        new TextEncoder().encode(`event: update\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      // Stream likely closed
    }
  };

  const onDelete = async (data: Record<string, unknown>) => {
    try {
      await writer.write(
        new TextEncoder().encode(`event: delete\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      // Stream likely closed
    }
  };

  emitter.on("participant_update", onUpdate);
  emitter.on("participant_delete", onDelete);

  req.signal.addEventListener("abort", () => {
    clearInterval(pingInterval);
    emitter.off("participant_update", onUpdate);
    emitter.off("participant_delete", onDelete);
    writer.close().catch(() => {});
  });

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
