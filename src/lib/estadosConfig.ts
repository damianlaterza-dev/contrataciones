import { cn } from "@/lib/utils";

type StatusConfig = {
  label: string;
  className: string;
};

const DEFAULT_STATUS: StatusConfig = {
  label: "Desconocido",
  className: cn("bg-gray-100 text-gray-600 border border-gray-200"),
};

// Estado del proyecto — hardcodeado (1=implementado, 2=en_proceso, 3=pausado, 4=cancelado, 5=sin_asignar)
export const ESTADO_CONFIG: Record<number, StatusConfig> = {
  1: {
    label: "Implementado",
    className: cn("bg-green-100 text-green-700 border border-green-200"),
  },
  2: {
    label: "En Proceso",
    className: cn("bg-blue-100 text-blue-700 border border-blue-200"),
  },
  3: {
    label: "Pausado",
    className: cn("bg-orange-100 text-orange-700 border border-orange-200"),
  },
  4: {
    label: "Cancelado",
    className: cn("bg-red-100 text-red-700 border border-red-200"),
  },
  5: {
    label: "Sin asignar",
    className: cn("bg-gray-100 text-gray-600 border border-gray-200"),
  },
};

export function formatProyectoStatus(estadoId?: number | null) {
  if (!estadoId) return DEFAULT_STATUS;
  return ESTADO_CONFIG[estadoId] ?? DEFAULT_STATUS;
}

// Estado de contratación — hardcodeado (1=en_proceso, 2=finalizado)
export const ESTADO_CONTRATACION_CONFIG: Record<number, StatusConfig> = {
  1: {
    label: "En Proceso",
    className: cn("bg-blue-100 text-blue-700 border border-blue-200"),
  },
  2: {
    label: "Finalizado",
    className: cn("bg-green-100 text-green-700 border border-green-200"),
  },
};

export function formatContratacionStatus(estadoId?: number | null) {
  if (!estadoId) return DEFAULT_STATUS;
  return ESTADO_CONTRATACION_CONFIG[estadoId] ?? DEFAULT_STATUS;
}
