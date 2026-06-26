import "server-only";
import Pusher from "pusher";
import { CHANNELS } from "./events";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

/** Fire-and-forget publish; never let a realtime hiccup fail the API request. */
export async function publishToLobby(code: string, event: string, payload: unknown): Promise<void> {
  try {
    await pusher.trigger(CHANNELS.lobby(code), event, payload);
  } catch (err) {
    console.error("pusher publish failed:", err instanceof Error ? err.message : "unknown");
  }
}

/** Sign a presence-channel subscription after the caller has verified the player. */
export function authorizeLobbyChannel(socketId: string, channel: string, playerId: number, name: string) {
  return pusher.authorizeChannel(socketId, channel, {
    user_id: String(playerId),
    user_info: { name },
  });
}
