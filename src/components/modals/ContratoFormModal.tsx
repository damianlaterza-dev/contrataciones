"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  contratoStep1Schema,
  type ContratoStep1Data,
} from "@/schemas/contratoWizardSchema";
import { createContratoCompleto } from "@/actions/contratos";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { contratosKeys } from "@/lib/queryKeys";
import { VisuallyHidden } from "radix-ui";

type SelectOption = { id: number; label?: string; nombre?: string };
type ContratoPrincipalOption = {
  id: number;
  nombre: string;
  numero_expediente: string;
};

type Props = { open: boolean; onClose: () => void };

export function ContratoFormModal({ open, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [openFechaInicio, setOpenFechaInicio] = useState(false);
  const [openFechaFin, setOpenFechaFin] = useState(false);

  const form = useForm<ContratoStep1Data>({
    resolver: zodResolver(contratoStep1Schema),
    defaultValues: {
      nombre: "",
      es_accesoridad: null,
      contrato_principal_id: null,
      fecha_inicio: "",
      fecha_fin: "",
    },
  });

  const queryClient = useQueryClient();
  const esAccesoridad = form.watch("es_accesoridad");

  const { data: proveedores = [], isLoading: isLoadingProveedores } = useQuery<
    SelectOption[]
  >({
    queryKey: ["proveedores-select"],
    queryFn: () => fetch("/api/proveedores").then((r) => r.json()),
    enabled: open,
  });

  const { data: contratosPrincipales = [], isLoading: isLoadingContratos } =
    useQuery<ContratoPrincipalOption[]>({
      queryKey: ["contratos-principales-select"],
      queryFn: () =>
        fetch("/api/contratos?for_principal_select=true").then((r) => r.json()),
      enabled: open && esAccesoridad === true,
    });

  const handleClose = () => {
    setServerError(null);
    setFechaInicio(undefined);
    setFechaFin(undefined);
    form.reset({
      nombre: "",
      numero_expediente: "",
      proveedor_id: undefined,
      es_accesoridad: null,
      contrato_principal_id: null,
      fecha_inicio: "",
      fecha_fin: "",
      cantidad_horas: undefined,
      valor_hora: undefined,
      observaciones: "",
    });
    onClose();
  };

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await createContratoCompleto(data);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: contratosKeys.all });
        handleClose();
      } else {
        setServerError(result.message ?? "Error inesperado");
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo contrato</DialogTitle>
        </DialogHeader>
        <VisuallyHidden.Root>
          <DialogDescription />
        </VisuallyHidden.Root>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 mt-2">
          {/* Proveedor */}
          <Field className="col-span-6">
            <FieldLabel>Proveedor</FieldLabel>
            <Select
              value={form.watch("proveedor_id")?.toString() ?? ""}
              onValueChange={(v) =>
                form.setValue("proveedor_id", Number(v), {
                  shouldValidate: true,
                })
              }>
              <SelectTrigger disabled={isLoadingProveedores}>
                <SelectValue
                  placeholder={
                    isLoadingProveedores
                      ? "Cargando proveedores..."
                      : "Seleccioná un proveedor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.proveedor_id && (
              <FieldError>
                <p>{form.formState.errors.proveedor_id.message}</p>
              </FieldError>
            )}
          </Field>

          {/* Nombre & Nº Expediente */}
          <Field className="col-span-12 lg:col-span-6">
            <FieldLabel htmlFor="nombre">Nombre del contrato</FieldLabel>
            <Input
              id="nombre"
              placeholder="Ej: Renacimiento de infraestructura"
              {...form.register("nombre")}
            />
            {form.formState.errors.nombre && (
              <FieldError>
                <p>{form.formState.errors.nombre.message}</p>
              </FieldError>
            )}
          </Field>

          <Field className="col-span-12 lg:col-span-6">
            <FieldLabel htmlFor="numero_expediente">Nº Expediente</FieldLabel>
            <Input
              id="numero_expediente"
              placeholder="EXP-2026-001"
              {...form.register("numero_expediente")}
            />
            {form.formState.errors.numero_expediente && (
              <FieldError>
                <p>{form.formState.errors.numero_expediente.message}</p>
              </FieldError>
            )}
          </Field>

          {/* Fechas */}
          <Field className="col-span-12 lg:col-span-6">
            <FieldLabel>Fecha de inicio</FieldLabel>
            <Popover open={openFechaInicio} onOpenChange={setOpenFechaInicio}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaInicio && "text-muted-foreground",
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaInicio
                    ? format(fechaInicio, "dd/MM/yyyy")
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 5}
                  selected={fechaInicio}
                  onSelect={(date) => {
                    setFechaInicio(date);
                    form.setValue(
                      "fecha_inicio",
                      date ? format(date, "yyyy-MM-dd") : "",
                      { shouldValidate: true },
                    );
                    setOpenFechaInicio(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.fecha_inicio && (
              <FieldError>
                <p>{form.formState.errors.fecha_inicio.message}</p>
              </FieldError>
            )}
          </Field>

          <Field className="col-span-12 lg:col-span-6">
            <FieldLabel>Fecha de fin</FieldLabel>
            <Popover open={openFechaFin} onOpenChange={setOpenFechaFin}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaFin && "text-muted-foreground",
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaFin
                    ? format(fechaFin, "dd/MM/yyyy")
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 5}
                  selected={fechaFin}
                  onSelect={(date) => {
                    setFechaFin(date);
                    form.setValue(
                      "fecha_fin",
                      date ? format(date, "yyyy-MM-dd") : "",
                      { shouldValidate: true },
                    );
                    setOpenFechaFin(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.fecha_fin && (
              <FieldError>
                <p>{form.formState.errors.fecha_fin.message}</p>
              </FieldError>
            )}
          </Field>

          {/* Horas y valor hora */}
          <Field className="col-span-6">
            <FieldLabel htmlFor="cantidad_horas">Cantidad de horas</FieldLabel>
            <Input
              id="cantidad_horas"
              type="text"
              inputMode="decimal"
              placeholder="1200"
              {...form.register("cantidad_horas", {
                setValueAs: (value) => {
                  if (value == null || String(value).trim() === "") {
                    return undefined;
                  }
                  return Number(value);
                },
              })}
            />
            {form.formState.errors.cantidad_horas && (
              <FieldError>
                <p>{form.formState.errors.cantidad_horas.message}</p>
              </FieldError>
            )}
          </Field>

          <Field className="col-span-6">
            <FieldLabel htmlFor="valor_hora">
              Valor hora{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </FieldLabel>
            <Input
              id="valor_hora"
              type="text"
              inputMode="decimal"
              placeholder="1500.00"
              {...form.register("valor_hora", {
                setValueAs: (v) =>
                  v == null || String(v).trim() === "" ? null : Number(v),
              })}
            />
            {form.formState.errors.valor_hora && (
              <FieldError>
                <p>{form.formState.errors.valor_hora.message}</p>
              </FieldError>
            )}
          </Field>

          {/* Es accesoridad */}
          <Field className="col-span-12 lg:col-span-6">
            <FieldLabel>¿Es accesoridad?</FieldLabel>
            <Select
              value={
                esAccesoridad === true
                  ? "true"
                  : esAccesoridad === false
                    ? "false"
                    : ""
              }
              onValueChange={(v) => {
                const val = v === "true" ? true : false;
                form.setValue("es_accesoridad", val, { shouldValidate: true });
                if (!val) {
                  form.setValue("contrato_principal_id", null);
                }
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Contrato principal (solo si es accesoridad = true) */}
          {esAccesoridad === true && (
            <Field className="col-span-12">
              <FieldLabel>Contrato principal</FieldLabel>
              <Select
                value={form.watch("contrato_principal_id")?.toString() ?? ""}
                onValueChange={(v) =>
                  form.setValue("contrato_principal_id", Number(v), {
                    shouldValidate: true,
                  })
                }>
                <SelectTrigger disabled={isLoadingContratos}>
                  <SelectValue
                    placeholder={
                      isLoadingContratos
                        ? "Cargando contratos..."
                        : "Seleccioná el contrato principal"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contratosPrincipales.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.numero_expediente} — {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* Observaciones */}
          <Field className="col-span-12">
            <FieldLabel htmlFor="observaciones">
              Observaciones{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </FieldLabel>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales sobre el contrato..."
              rows={3}
              {...form.register("observaciones")}
            />
          </Field>

          {serverError && (
            <div className="col-span-12">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <div className="col-span-12">
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
