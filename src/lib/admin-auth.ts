import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createRateLimiter } from "./rate-limit";

export const ADMIN_COOKIE = "lc_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const loginLimiter = createRateLimiter(5, 15 * 60_000);
// Au-delà de ce seuil global d'échecs, chaque échec est fortement ralenti, mais un
// mot de passe correct passe toujours : un attaquant ne peut pas bloquer le propriétaire.
const globalLoginLimiter = createRateLimiter(30, 15 * 60_000);
const GLOBAL_KEY = "global";
const FAIL_DELAY_MS = 400;
const FAIL_DELAY_UNDER_ATTACK_MS = 3000;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET manquant ou trop court (16 caractères minimum).");
  }
  return s;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Lier la signature au mot de passe : le changer révoque toutes les sessions. */
function sign(expiresAt: number): string {
  const pwdFingerprint = createHash("sha256")
    .update(process.env.ADMIN_PASSWORD ?? "")
    .digest("hex");
  return createHmac("sha256", secret()).update(`${expiresAt}|${pwdFingerprint}`).digest("hex");
}

function issueToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

function verifyToken(token: string): boolean {
  const [expStr, sig] = token.split(".");
  const expiresAt = Number(expStr);
  if (!Number.isInteger(expiresAt) || !sig) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(expiresAt));
}

/**
 * IP cliente telle que posée par la plateforme (Vercel écrase ces en-têtes,
 * le client ne peut pas les forger). On n'utilise jamais X-Forwarded-For, spoofable.
 */
async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
}

export async function attemptLogin(candidate: string): Promise<"ok" | "invalid" | "locked"> {
  const key = await clientKey();
  if (loginLimiter.isBlocked(key)) return "locked";

  const expected = process.env.ADMIN_PASSWORD;
  const ok = !!expected && expected.length >= 8 && safeEqual(candidate, expected);
  if (ok) {
    loginLimiter.reset(key);
    return "ok";
  }

  loginLimiter.hit(key);
  globalLoginLimiter.hit(GLOBAL_KEY);
  const delay = globalLoginLimiter.isBlocked(GLOBAL_KEY) ? FAIL_DELAY_UNDER_ATTACK_MS : FAIL_DELAY_MS;
  await new Promise((r) => setTimeout(r, delay));
  return loginLimiter.isBlocked(key) ? "locked" : "invalid";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  try {
    return verifyToken(value);
  } catch {
    return false;
  }
}

export async function setAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
