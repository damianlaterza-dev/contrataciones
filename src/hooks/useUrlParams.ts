"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // replace: actualiza sin agregar entrada al historial (mejor para filtros)
      // scroll: false evita saltos de pantalla
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Helper: Cambiar página
  const onPageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  // Helper: Cambiar límite (resetea página)
  const onLimitChange = (newLimit: number) => {
    updateParams({ limit: newLimit, page: 1 });
  };

  // Helper: Cambiar un filtro específico (resetea página)
  // Úsalo para Search, Selects, DatePickers, etc.
  const setFilter = (key: string, value: string | null) => {
    updateParams({ [key]: value, page: 1 });
  };

  return {
    searchParams, // Por si necesitas leer valores directos
    updateParams, // Por si necesitas casos complejos
    onPageChange,
    onLimitChange,
    setFilter,
  };
}
