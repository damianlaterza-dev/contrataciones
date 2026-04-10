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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatDate } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  prorrogaSchema,
  type ProrrogaData,
} from "@/schemas/contratoWizardSchema";
import { addProrroga } from "@/actions/contratos";
import { useQueryClient } from "@tanstack/react-query";
import { contratosKeys } from "@/lib/queryKeys";
import { TContrato } from "@/components/datatable/contratos/columns";
import { Badge } from "../ui/badge";

type Props = { contrato: TContrato; open: boolean; onClose: () => void };

export function ProrrogaFormModal({ contrato, open, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [openFechaFin, setOpenFechaFin] = useState(false);

  const form = useForm<ProrrogaData>({
    resolver: zodResolver(prorrogaSchema),
    defaultValues: {
      contrato_id: contrato.id,
      numero_expediente: "",
      fecha_fin: "",
      observacion: null,
    },
  });

  const queryClient = useQueryClient();

  const handleClose = () => {
    setServerError(null);
    setFechaFin(undefined);
    form.reset({
      contrato_id: contrato.id,
      numero_expediente: "",
      fecha_fin: "",
      observacion: null,
    });
    onClose();
  };

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await addProrroga(data);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Agregar prórroga
            <p className="text-sm text-muted-foreground mt-2">
              {contrato.numero_expediente}
            </p>
          </DialogTitle>
          <DialogDescription>
            Fecha fin actual:{" "}
            <Badge variant={"secondary"}>
              {formatDate(contrato.fecha_fin_vigente)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 mt-2">
          <Field className="col-span-12">
            <FieldLabel htmlFor="numero_expediente">
              N° de expediente
            </FieldLabel>
            <Input
              autoComplete="off"
              aria-invalid={!!form.formState.errors.numero_expediente}
              id="numero_expediente"
              type="text"
              placeholder="Ingresá el N° de expediente"
              {...form.register("numero_expediente")}
            />
            {form.formState.errors.numero_expediente && (
              <FieldError>
                <p>{form.formState.errors.numero_expediente.message}</p>
              </FieldError>
            )}
          </Field>

          <Field className="col-span-12">
            <FieldLabel>Nueva fecha de fin</FieldLabel>
            <Popover open={openFechaFin} onOpenChange={setOpenFechaFin}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaFin && "text-muted-foreground",
                    form.formState.errors.fecha_fin &&
                      "border-destructive focus:ring-destructive/20 focus:ring-3 focus-visible:ring-destructive/20 focus-visible:ring-3",
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
                  startMonth={new Date(2020, 0)}
                  endMonth={new Date(new Date().getFullYear() + 5, 11)}
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

          <Field className="col-span-12">
            <FieldLabel htmlFor="observacion">
              Observaciones{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </FieldLabel>
            <Textarea
              id="observacion"
              placeholder="Notas sobre la prórroga..."
              rows={3}
              {...form.register("observacion")}
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
