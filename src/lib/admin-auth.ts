import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createRateLimiter } from "./rate-limit";

export const ADMIN_COOKIE = "lc_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const loginLimiter = createRateLimiter(5, 15 * 60_000);
// Plafond global sur les échecs. Si ADMIN_ALLOWED_IPS est renseigné, il devient bloquant
// pour les autres IP (le propriétaire garde un accès) ; sinon il se contente de ralentir
// fortement les tentatives, sans jamais refuser un mot de passe correct.
const globalFailureLimiter = createRateLimiter(100, 15 * 60_000);
const GLOBAL_KEY = "global";
const ATTEMPT_DELAY_MS = 400;
const ATTEMPT_DELAY_UNDER_ATTACK_MS = 3000;

// Tentatives sérialisées par IP : le délai ne se parallélise pas, et le trafic
// d'un attaquant ne retarde pas la connexion du propriétaire.
const queues = new Map<string, Promise<unknown>>();
function serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
  const prev = queues.get(key) ?? Promise.resolve();
  const run = prev.then(task, task);
  const settled = run.catch(() => undefined).then(() => {
    if (queues.get(key) === settled) queues.delete(key);
  });
  queues.set(key, settled);
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
  return serialize(key, async () => {
    const allowlist = allowedIps();
    const trusted = allowlist.has(key);
    const underAttack = globalFailureLimiter.isBlocked(GLOBAL_KEY);
    const globalLockApplies = underAttack && allowlist.size > 0 && !trusted;
    if (loginLimiter.isBlocked(key) || globalLockApplies) return "locked";

    // Compter avant de comparer : une rafale ne peut pas dépasser la limite par IP.
    loginLimiter.hit(key);

    const expected = process.env.ADMIN_PASSWORD;
    const ok = !!expected && expected.length >= 8 && safeEqual(candidate, expected);
    if (!ok && !trusted) globalFailureLimiter.hit(GLOBAL_KEY);

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
