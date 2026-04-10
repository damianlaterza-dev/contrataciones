import { cn } from "@/lib/utils";

export type UserRole = "1" | "2" | "3" | "4" | "5";

type RoleConfig = {
  label: string;
  className: string;
};

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  "1": { label: "Developer",  className: cn("bg-fuchsia-100 text-fuchsia-600") },
  "2": { label: "Super Admin", className: cn("bg-violet-100 text-violet-700") },
  "3": { label: "Admin",      className: cn("bg-sky-100 text-sky-600") },
  "4": { label: "Usuario",    className: cn("bg-teal-100 text-teal-600") },
  "5": { label: "Invitado",   className: cn("bg-orange-100 text-orange-600") },
};

export function formatUserRole(role_id?: string | null) {
  if (!role_id) throw new Error("Role_id requerido");
  return ROLE_CONFIG[role_id as UserRole];
}
