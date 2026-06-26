import { NextRequest, NextResponse } from "next/server";
import { loadPlayerByToken } from "@/lib/challenge/server";
import { authorizeLobbyChannel } from "@/lib/realtime/pusher-server";
import { CHANNELS } from "@/lib/realtime/events";

export async function POST(request: NextRequest) {
  // pusher-js posts application/x-www-form-urlencoded: socket_id, channel_name,
  // plus our auth.params (token, code).
  const form = await request.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");
  const token = String(form.get("token") ?? "");
  const code = String(form.get("code") ?? "");

  if (!socketId || !channel || !token || !code) {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
  if (channel !== CHANNELS.lobby(code)) {
    return NextResponse.json({ error: "Canal interzis." }, { status: 403 });
  }

  const found = await loadPlayerByToken(code, token);
  if (!found) return NextResponse.json({ error: "Neautorizat." }, { status: 403 });

  const auth = authorizeLobbyChannel(socketId, channel, found.player.id, found.player.name);
  return NextResponse.json(auth);
}
