import { auth, clerkClient } from "@clerk/nextjs/server";
import { recordVideo, recordTool } from "@/lib/progress-server";

export const runtime = "nodejs";

// Called by the player (video percent) and by tool pages (tool opened).
// Fire-and-forget from the client; failures are swallowed there.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    type?: string;
    chapterId?: string;
    percent?: number;
    toolId?: string;
    kind?: "open" | "use";
  } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;
  const who = { id: userId, email, name };

  try {
    if (body.type === "video" && body.chapterId && typeof body.percent === "number") {
      await recordVideo(who, body.chapterId, body.percent);
    } else if (body.type === "tool" && body.toolId) {
      await recordTool(who, body.toolId, body.kind === "use" ? "use" : "open");
    } else {
      return Response.json({ error: "missing fields" }, { status: 400 });
    }
  } catch (e) {
    console.error("progress write failed:", e);
    return Response.json({ error: "failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
