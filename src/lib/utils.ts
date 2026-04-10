import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea un campo DATE de la DB (sin timezone) a dd/mm/yyyy sin conversión UTC */
export function formatDate(date: Date | string): string {
  const iso = typeof date === "string" ? date : date.toISOString();
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
