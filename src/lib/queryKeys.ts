import {
  ContratosFilters,
  ProyectosFilters,
  ProveedoresFilters,
  UsuariosFilters,
} from "@/@types/filters";

export const usuariosKeys = {
  all: ["users"] as const,
  list: (filters: UsuariosFilters) => [...usuariosKeys.all, filters] as const,
};

export const rolesKeys = {
  all: ["roles"] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};

export const proyectosKeys = {
  all: ["proyectos"] as const,
  list: (filters: ProyectosFilters) => [...proyectosKeys.all, filters] as const,
};

export const contratosKeys = {
  all: ["contratos"] as const,
  list: (filters: ContratosFilters) => [...contratosKeys.all, filters] as const,
};

export const proveedoresKeys = {
  all: ["proveedores"] as const,
  list: (filters: ProveedoresFilters) => [...proveedoresKeys.all, filters] as const,
};

export const resumenKeys = {
  all: ["resumen"] as const,
  proveedores: () => [...resumenKeys.all, "proveedores"] as const,
  byProveedor: (proveedor_id: number, anio: number) =>
    [...resumenKeys.all, proveedor_id, anio] as const,
};
