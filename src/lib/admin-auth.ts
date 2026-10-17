import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createRateLimiter } from "./rate-limit";

export const ADMIN_COOKIE = "lc_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const loginLimiter = createRateLimiter(5, 15 * 60_000);
// Plafond global bloquant (fail-closed). Seules les IP de ADMIN_ALLOWED_IPS y échappent,
// ce qui permet au propriétaire de se connecter même pendant une attaque.
const globalLoginLimiter = createRateLimiter(100, 15 * 60_000);
const GLOBAL_KEY = "global";
const ATTEMPT_DELAY_MS = 400;
const ATTEMPT_DELAY_UNDER_ATTACK_MS = 3000;

// Les tentatives sont sérialisées : le délai ne peut pas être contourné en parallélisant.
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

function allowedIps(): Set<string> {
  return new Set(
    (process.env.ADMIN_ALLOWED_IPS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

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
  return serialize(async () => {
    const trusted = allowedIps().has(key);
    const underAttack = globalLoginLimiter.isBlocked(GLOBAL_KEY);
    if (loginLimiter.isBlocked(key) || (underAttack && !trusted)) return "locked";

    // Compter avant de comparer : une rafale ne peut pas dépasser la limite.
    loginLimiter.hit(key);
    if (!trusted) globalLoginLimiter.hit(GLOBAL_KEY);

    const expected = process.env.ADMIN_PASSWORD;
    const ok = !!expected && expected.length >= 8 && safeEqual(candidate, expected);

    // Même délai en succès et en échec : le temps de réponse ne révèle rien.
    await new Promise((r) =>
      setTimeout(r, underAttack ? ATTEMPT_DELAY_UNDER_ATTACK_MS : ATTEMPT_DELAY_MS),
    );

    if (ok) {
      loginLimiter.reset(key);
      return "ok";
    }
    return loginLimiter.isBlocked(key) ? "locked" : "invalid";
  });
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
