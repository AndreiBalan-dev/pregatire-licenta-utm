"use client";
import Pusher from "pusher-js";

/** One Pusher connection per lobby membership. Auth params carry the player
 *  token + code so the server auth route can verify presence membership. */
export function createPusherClient(token: string, code: string): Pusher {
  return new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/challenge/pusher/auth",
    auth: { params: { token, code } },
  });
}
