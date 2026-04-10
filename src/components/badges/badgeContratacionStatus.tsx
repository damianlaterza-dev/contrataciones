import { cn } from "@/lib/utils";
import { formatContratacionStatus } from "@/lib/estadosConfig";

type Props = {
  status?: number | null;
  className?: string;
};

export function ContratacionStatusBadge({ status, className }: Props) {
  const { label, className: statusClass } = formatContratacionStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium min-w-32",
        statusClass,
        className,
      )}>
      {label}
    </span>
  );
}
