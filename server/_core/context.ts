import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Mock dev user for local development (id must match a real user in your DB or be seeded)
const DEV_USER: User = {
  id: 1,
  openId: "dev-user",
  name: "Dev User",
  email: "dev@mie-prime.local",
  loginMethod: "dev",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function authenticateRequest(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  // Read session token from cookie
  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader
    ? new Map(Object.entries(parseCookieHeader(cookieHeader)))
    : new Map<string, string>();

  const sessionToken = cookies.get(COOKIE_NAME);
  if (!sessionToken) return null;

  // Verify with Supabase
  const { data, error } = await supabase.auth.getUser(sessionToken);
  if (error || !data.user) return null;

  const supabaseUser = data.user;
  const openId = supabaseUser.id; // Supabase UUID as openId
  const email = supabaseUser.email ?? null;
  const name =
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.user_metadata?.name ||
    email ||
    null;
  const loginMethod = supabaseUser.app_metadata?.provider ?? "email";
  const signedInAt = new Date();

  // Upsert user into our DB
  await db.upsertUser({
    openId,
    name,
    email,
    loginMethod,
    lastSignedIn: signedInAt,
  });

  const user = await db.getUserByOpenId(openId);
  return user ?? null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // In development, use a mock user if not authenticated
  // Toggle VITE_DEV_AUTO_LOGIN=true/false in .env to control this
  if (
    !user &&
    process.env.NODE_ENV === "development" &&
    process.env.VITE_DEV_AUTO_LOGIN === "true"
  ) {
    user = DEV_USER;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
