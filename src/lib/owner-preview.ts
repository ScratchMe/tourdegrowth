/**
 * The owner-only preview of the features that ship closed — the game
 * (`GAME_ENABLED`) and the growth engine (`ENGINE_ENABLED`).
 *
 * Until 2026-09-25 a preview was opened by `?game=preview` / `?engine=preview`
 * on any URL, which set a cookie worth `"1"`. Both the parameter and the
 * cookie value are written in this public repository, so "a preview only
 * Antoine can open" was in fact a preview anyone who reads the code can open.
 * Now the cookie's value is an HMAC of the feature's name under a secret only
 * the owner holds, and the only place that sets it is `/admin/preview`, which
 * sits behind the admin Basic Auth in `proxy.ts`.
 *
 * The key is `ADMIN_DASHBOARD_PASSWORD` — the one secret that already exists
 * in Vercel and that only the owner types. No new variable to configure, the
 * same fail-closed contract (no password, no preview, for anyone), and
 * rotating the password revokes every preview cookie ever issued. The
 * message is namespaced per feature, so an engine cookie's value copied into
 * the game's cookie opens nothing.
 *
 * Web Crypto rather than `node:crypto`: the proxy stays runtime-agnostic (the
 * same rule as `constantTimeEqual`), which makes these checks asynchronous.
 */
import { constantTimeEqual } from "./constant-time";
import { ENGINE_PREVIEW_COOKIE } from "./engine/access";
import { GAME_PREVIEW_COOKIE } from "./game/access";

export const PREVIEW_FEATURES = ["game", "engine"] as const;
export type PreviewFeature = (typeof PREVIEW_FEATURES)[number];

export const PREVIEW_COOKIES: Record<PreviewFeature, string> = {
  game: GAME_PREVIEW_COOKIE,
  engine: ENGINE_PREVIEW_COOKIE,
};

/** The admin page that sets and clears the cookies, and the only one. */
export const OWNER_PREVIEW_PATH = "/admin/preview";

/** Bump to revoke every cookie issued under the previous format. */
const MESSAGE_PREFIX = "tdg-owner-preview:v1:";

/** The secret, read at call time — never cached, never exposed to a client. */
export function ownerPreviewSecret(): string | undefined {
  return process.env.ADMIN_DASHBOARD_PASSWORD || undefined;
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The cookie value that opens `feature` under `secret`. */
export async function ownerPreviewToken(feature: PreviewFeature, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(MESSAGE_PREFIX + feature));
  return base64url(new Uint8Array(signature));
}

/**
 * Whether `cookieValue` opens `feature`. False without a secret (fail closed),
 * without a cookie, and for any value that is not this exact signature — `"1"`,
 * the pre-2026-09-25 value, included.
 */
export async function hasOwnerPreview(
  feature: PreviewFeature,
  cookieValue: string | null | undefined,
  secret: string | undefined = ownerPreviewSecret(),
): Promise<boolean> {
  if (!secret || !cookieValue) return false;
  return constantTimeEqual(cookieValue, await ownerPreviewToken(feature, secret));
}

/**
 * What a POST to `/admin/preview?<feature>=<on|off>` asks for. Anything but
 * the two exact values is ignored, so a stray parameter changes nothing.
 */
export function previewAction(param: string | null): "on" | "off" | null {
  if (param === "on") return "on";
  if (param === "off") return "off";
  return null;
}
