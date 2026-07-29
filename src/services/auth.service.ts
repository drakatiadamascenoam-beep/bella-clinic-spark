import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Client-side authentication is handled directly by the AuthProvider via
 * the browser Supabase client. This module exposes server-side helpers that
 * require an authenticated session.
 */

export const getCurrentSessionClaims = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return {
      userId: context.userId,
      claims: context.claims,
    };
  });

export const signOutServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.auth.signOut();
    return { ok: true };
  });
