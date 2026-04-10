// components/usuarios/UserRoleBadge.tsx
import { cn } from "@/lib/utils";
import { formatUserRole } from "@/lib/formatRole";

type Props = {
  role_id?: string | null;
  className?: string;
};

export function UserRoleBadge({ role_id, className }: Props) {
  const { label, className: roleClass } = formatUserRole(role_id);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        roleClass,
        className,
      )}>
      {label}
    </span>
  );
}
