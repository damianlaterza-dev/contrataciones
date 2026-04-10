export type ContratacionesFilters = {
  page: number;
  limit: number;
  proyecto?: string;
  proveedor?: string;
};

export type UIFilters = Partial<Omit<ContratacionesFilters, "page" | "limit">>;

export type ProyectosFilters = {
  page: number;
  limit: number;
  nombre?: string;
  estado_id?: string;
  area_id?: string;
};

export type UIProyectosFilters = Partial<
  Omit<ProyectosFilters, "page" | "limit">
>;

export type ContratosFilters = {
  page: number;
  limit: number;
};

export type UIContratosFilters = Partial<
  Omit<ContratosFilters, "page" | "limit">
>;

export type UsuariosFilters = {
  created_at?: string;
  page: number;
  limit: number;
  search?: string;
  role_id?: string;
};

export type UIUsersFilters = Partial<Omit<UsuariosFilters, "page" | "limit">>;

export type ProveedoresFilters = {
  page: number;
  limit: number;
  search?: string;
};

export type UIProveedoresFilters = Partial<Omit<ProveedoresFilters, "page" | "limit">>;
