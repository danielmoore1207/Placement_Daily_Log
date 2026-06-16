import { createClient } from "@supabase/supabase-js";

export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key);
}

export function getAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
  }
  return createClient(url, anon);
}

export async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return { error: "Missing bearer token.", user: null };
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  if (!accessToken) {
    return { error: "Missing bearer token.", user: null };
  }

  const authClient = getAnonClient();
  const {
    data: { user },
    error
  } = await authClient.auth.getUser(accessToken);
  if (error || !user) {
    return { error: "Invalid session token.", user: null };
  }

  return { error: null, user };
}
