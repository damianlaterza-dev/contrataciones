"use client";

import { useEffect, useState, useTransition } from "react";

import { createUser } from "@/actions/users";
import { updateUserRole } from "@/actions/user-actions";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, userRoles, type User } from "@/schemas/userSchema";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import ErrorIcon from "@/assets/img/main/inputs/error.svg";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/datatable/DataTable";
import { getUsuariosColumns } from "@/components/datatable/usuarios/columns";
import { rolesKeys, usuariosKeys } from "@/lib/queryKeys";
import { UsuariosFilters } from "@/@types/filters";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { TRole } from "@/@types/data";
import { fetchRoles } from "@/services/roles.service";
import { useUrlParams } from "@/hooks/useUrlParams";
import Pagination from "@/components/datatable/pagination/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export default function UsuariosPage({
  filters,
}: {
  filters: UsuariosFilters;
}) {
  const { onPageChange, onLimitChange, setFilter } = useUrlParams();
  const [searchText, setSearchText] = useState<string>(filters.search || "");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<
    (User & { id?: number }) | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      rol: undefined,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: User) => {
    startTransition(async () => {
      if (editingUser?.id) {
        const selectedRole = roles?.find((r) => r.label === data.rol);

        if (!selectedRole) {
          toast.custom((t) => (
            <Toast id={t} variant="error">
              <p className="text-sm text-gray-600">Rol inválido seleccionado</p>
            </Toast>
          ));
          return;
        }

        const res = await updateUserRole(editingUser.id, selectedRole.id);

        if (res.success) {
          setIsOpen(false);
          setEditingUser(null);
          reset();
          toast.custom((t) => (
            <Toast id={t} variant="success">
              <p className="text-sm text-gray-600">{res.message}</p>
            </Toast>
          ));
        } else {
          toast.custom((t) => (
            <Toast id={t} variant="error">
              <p className="text-sm text-gray-600">{res.message}</p>
            </Toast>
          ));
        }
      } else {
        // Modo Creación
        const res = await createUser(data);
        if (res.success) {
          setIsOpen(false);
          reset();
          toast.custom((t) => (
            <Toast id={t} variant="success">
              <p className="text-sm text-gray-600">{res.message}</p>
            </Toast>
          ));
        } else {
          toast.custom((t) => (
            <Toast id={t} variant="error">
              <p className="text-sm text-gray-600">{res.message}</p>
            </Toast>
          ));
          if (res.errors) {
            console.error(res.errors);
          }
        }
      }
    });
  };

  const handleEdit = (user: any) => {
    const roleLabel = roles?.find((r) => r.id === user.role_id)?.label;

    setEditingUser({
      nombreCompleto: user.full_name,
      email: user.email,
      rol: roleLabel as any, // Cast as any if strictly typed enum doesn't match perfectly, but ideally it should.
      id: user.id,
    });

    setValue("nombreCompleto", user.full_name);
    setValue("email", user.email);
    if (roleLabel) setValue("rol", roleLabel as any);

    setIsOpen(true);
  };

  // Debounce automático
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchText !== (filters.search || "")) {
        setFilter("search", searchText || null);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, filters.search, setFilter]);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: usuariosKeys.list(filters),
    queryFn: async () => {
      // Reconstruimos query string para la API
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.role_id) params.set("role_id", String(filters.role_id));
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Error al buscar usuarios");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });

  const { data: roles, isLoading: isLoadingRoles } = useQuery<TRole[]>({
    queryKey: rolesKeys.all,
    queryFn: fetchRoles,
  });

  if (isLoadingUsers || isLoadingRoles || !roles || !users)
    return (
      <div className="grid place-items-center h-dvh">
        <Spinner color="text-cian-500" />
      </div>
    );

  return (
    <>
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold">Usuarios</h1>
        <p className="2xl:text-lg">
          Desde acá vas a poder gestionar los usuarios del sistema
        </p>
        <section className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 grow">
                <Field className="max-w-xs">
                  <FieldLabel htmlFor="inline-start-input" className="sr-only">
                    Input
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="inline-start-input"
                      placeholder="Buscar por nombre o email"
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <SearchIcon className="text-azul-500" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Select
                  value={filters.role_id?.toString() || ""}
                  onValueChange={(val) => {
                    setFilter("role_id", val === "all" ? null : val);
                  }}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Seleccioná un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {roles.map((rol) => {
                      return (
                        <SelectItem
                          key={`${rol.value}-${rol.id}`}
                          value={String(rol.id)}
                        >
                          {rol.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="primary" onClick={() => setIsOpen(true)}>
                Agregar usuario
              </Button>
            </div>
          </div>
          <div className="col-span-12">
            <DataTable
              columns={getUsuariosColumns(false, handleEdit)}
              data={users?.data}
            />
            <Pagination
              currentPage={filters.page}
              totalPages={Math.ceil((users?.total ?? 0) / filters.limit)}
              limit={filters.limit}
              onLimitChange={onLimitChange}
              onPageChange={onPageChange}
              nextPage={() => onPageChange(filters.page + 1)}
              prevPage={() => onPageChange(filters.page - 1)}
            />
          </div>
        </section>
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            reset();
            setEditingUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar usuario" : "Agregar usuario"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Modificá el rol del usuario."
                  : "Completá los datos del nuevo usuario."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-12 gap-6 py-4">
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel htmlFor="nombreCompleto">
                    Nombre completo
                  </FieldLabel>
                  <Input
                    aria-invalid={!!errors.nombreCompleto}
                    id="nombreCompleto"
                    {...register("nombreCompleto")}
                    placeholder="Ingresá el nombre completo"
                    disabled={!!editingUser}
                  />
                  {errors.nombreCompleto && (
                    <FieldError>
                      <p className="flex items-center gap-2">
                        <span>
                          <Image
                            src={ErrorIcon}
                            alt="Error"
                            className="size-4"
                          />
                        </span>
                        {errors.nombreCompleto.message}
                      </p>
                    </FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    aria-invalid={!!errors.email}
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Ingresá el email"
                    disabled={!!editingUser}
                  />
                  {errors.email && (
                    <FieldError>
                      <p className="flex items-center gap-2">
                        <span>
                          <Image
                            src={ErrorIcon}
                            alt="Error"
                            className="size-4"
                          />
                        </span>
                        {errors.email.message}
                      </p>
                    </FieldError>
                  )}
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Rol</FieldLabel>
                  <Select
                    value={watch("rol") || ""}
                    onValueChange={(value) =>
                      setValue("rol", value as User["rol"], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      className={cn(!!errors.rol && "border-red-500")}
                    >
                      <SelectValue placeholder="Seleccioná un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter(
                          (rol) =>
                            process.env.NODE_ENV === "development" ||
                            rol.label !== "Developer",
                        )
                        .map((rol) => {
                          return (
                            <SelectItem key={rol.value} value={rol.label}>
                              {rol.label}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  {errors.rol && (
                    <FieldError>
                      <p className="flex items-center gap-2">
                        <span>
                          <Image
                            src={ErrorIcon}
                            alt="Error"
                            className="size-4"
                          />
                        </span>
                        {errors.rol.message}
                      </p>
                    </FieldError>
                  )}
                </Field>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="text-white" data-icon="inline-start" />{" "}
                    <p>Guardando</p>
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
