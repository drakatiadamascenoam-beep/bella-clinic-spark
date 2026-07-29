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
 *
 * Temporary type assertions are used while the generated Database types do not
 * yet contain the schema tables. They will be removed once the schema is synced.
 */

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role: AppRole;
}

const roleSchema = z.enum(["ADMIN", "PROFISSIONAL", "RECEPCAO"]);

export const getCurrentUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as {
      from(table: "profiles"): {
        select(columns: "*"): {
          eq(column: "id", value: string): { maybeSingle(): Promise<{ data: unknown; error: unknown }> };
        };
      };
    };

    const { data, error } = await supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();

    if (error) throw error;
    return (data ?? null) as ProfileRow | null;
  });

export const getCurrentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as {
      from(table: "user_roles"): {
        select(columns: "role"): {
          eq(column: "user_id", value: string): Promise<{ data: unknown; error: unknown }>;
        };
      };
    };

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", context.userId);

    if (error) throw error;
    return ((data as UserRoleRow[] | null)?.map((r) => r.role) ?? []) as AppRole[];
  });

export const hasRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ role: roleSchema }).parse(input))
  .handler(async ({ data }) => {
    const roles = await getCurrentUserRoles({});
    return roles.includes(data.role);
  });
