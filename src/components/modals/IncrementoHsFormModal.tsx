"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  incrementoSchema,
  type IncrementoData,
} from "@/schemas/contratoWizardSchema";
import { addIncremento } from "@/actions/contratos";
import { useQueryClient } from "@tanstack/react-query";
import { contratosKeys } from "@/lib/queryKeys";
import { TContrato } from "@/components/datatable/contratos/columns";
import { Badge } from "../ui/badge";

type Props = { contrato: TContrato; open: boolean; onClose: () => void };

export function IncrementoHsFormModal({ contrato, open, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<IncrementoData>({
    resolver: zodResolver(incrementoSchema),
    defaultValues: {
      contrato_id: contrato.id,
      horas_extra: undefined,
      numero_expediente: "",
      observacion: null,
    },
  });

  const queryClient = useQueryClient();

  const handleClose = () => {
    setServerError(null);
    form.reset({
      contrato_id: contrato.id,
      horas_extra: undefined,
      numero_expediente: "",
      observacion: null,
    });
    onClose();
  };

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await addIncremento(data);
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
            Incremento de horas
            <p className="text-sm text-muted-foreground mt-2">
              {contrato.numero_expediente}
            </p>
          </DialogTitle>
          <DialogDescription>
            Horas disponibles actuales:{" "}
            <Badge variant={"secondary"}>
              {contrato.horas_disponibles.toLocaleString("es-AR")} hs
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 mt-2">
          <Field className="col-span-12">
            <FieldLabel htmlFor="numero_expediente">N° expediente</FieldLabel>
            <Input
              autoComplete="off"
              aria-invalid={!!form.formState.errors.numero_expediente}
              id="numero_expediente"
              type="text"
              placeholder="EX-2026-..."
              {...form.register("numero_expediente")}
            />
            {form.formState.errors.numero_expediente && (
              <FieldError>
                <p>{form.formState.errors.numero_expediente.message}</p>
              </FieldError>
            )}
          </Field>

          <Field className="col-span-12">
            <FieldLabel htmlFor="horas_extra">Horas a agregar</FieldLabel>
            <Input
              aria-invalid={!!form.formState.errors.horas_extra}
              id="horas_extra"
              type="text"
              inputMode="numeric"
              placeholder="200"
              {...form.register("horas_extra", {
                setValueAs: (v) =>
                  v == null || String(v).trim() === "" ? undefined : Number(v),
              })}
            />
            {form.formState.errors.horas_extra && (
              <FieldError>
                <p>{form.formState.errors.horas_extra.message}</p>
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
              placeholder="Notas sobre el incremento..."
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
