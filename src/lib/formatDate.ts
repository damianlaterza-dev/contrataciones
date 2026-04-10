import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(
  date: Date | string | null | undefined,
  pattern = "dd 'de' MMMM yyyy",
): string {
  if (!date) return "—";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "—";

  return format(d, pattern, { locale: es });
}
