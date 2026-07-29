import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/components/providers/auth-provider";

/**
 * User profile and role services.
 *
 * NOTE: These functions are prepared for the Bella Knowledge Graph v3.0 schema.
 * They assume the existence of `public.profiles` and `public.user_roles` tables.
 * When the schema is populated in the connected Lovable Cloud instance, these
 * functions will resolve against real rows. No mock data is returned.
 */

const roleSchema = z.enum(["ADMIN", "PROFISSIONAL", "RECEPCAO"]);

export const getCurrentUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });

export const getCurrentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);

    if (error) throw error;
    return (data?.map((r) => r.role as AppRole) ?? []) as AppRole[];
  });

export const hasRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ role: roleSchema }).parse(input))
  .handler(async ({ context, data }) => {
    const roles = await getCurrentUserRoles({});
    return roles.includes(data.role);
  });
