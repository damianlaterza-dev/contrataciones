import type { users, roles, proveedores, proyectos } from "@prisma/client";

export type TUsuarios = Pick<
  users,
  "id" | "full_name" | "email" | "role_id" | "last_login_at" | "deleted_at"
>;

export type TRole = Pick<roles, "id" | "label"> & {
  value: number;
};

export type TProveedor = Pick<proveedores, "id" | "label"> & {
  value: number;
};

export type TProyecto = Pick<proyectos, "id" | "nombre"> & {
  value: number;
};
