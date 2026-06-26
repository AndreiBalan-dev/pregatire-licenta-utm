"use client";
import Pusher from "pusher-js";

/** One Pusher connection per lobby membership. Auth params carry the player
 *  token + code so the server auth route can verify presence membership. */
export function createPusherClient(token: string, code: string): Pusher {
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    // pusher-js v8: channelAuthorization (the old `authEndpoint`/`auth.params`
    // is deprecated and does NOT reliably forward custom params, which left the
    // presence auth route without token/code and rejected the subscription).
    channelAuthorization: {
      endpoint: "/api/challenge/pusher/auth",
      transport: "ajax",
      params: { token, code },
    },
  });
}
