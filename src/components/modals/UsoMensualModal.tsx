"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { resumenKeys } from "@/lib/queryKeys";
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
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldLabel } from "../ui/field";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Props = {
  open: boolean;
  onClose: () => void;
  contrato_proyecto_id: number;
  proyecto_nombre: string;
  anio: number;
  mes: number;
  horas_estimadas?: number | null;
  horas_reales?: number | null;
};

function parseNullableNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const MAX_HORAS = 999999;

function isInvalidInput(value: string): boolean {
  if (value.trim() === "") return false;
  const parsed = Number(value);
  return !Number.isFinite(parsed) || parsed > MAX_HORAS;
}

export function UsoMensualModal({
  open,
  onClose,
  contrato_proyecto_id,
  proyecto_nombre,
  anio,
  mes,
  horas_estimadas,
  horas_reales,
}: Props) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  // const [estimadas, setEstimadas] = useState(
  //   horas_estimadas == null ? "" : String(horas_estimadas),
  // );
  const [reales, setReales] = useState(
    horas_reales == null ? "" : String(horas_reales),
  );

  const showToast = (success: boolean, message: string) => {
    toast.custom((toastId) => (
      <Toast id={toastId} variant={success ? "success" : "error"}>
        <p className="text-sm text-gray-600">{message}</p>
      </Toast>
    ));
  };

  const realesInvalid = isInvalidInput(reales);

  const handleSubmit = () => {
    if (realesInvalid) return;
    startTransition(async () => {
      const response = await fetch("/api/uso-mensual", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contrato_proyecto_id,
          anio,
          mes,
          horas_reales: parseNullableNumber(reales),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await queryClient.invalidateQueries({
          queryKey: resumenKeys.all,
        });
        onClose();
      }

      showToast(
        response.ok,
        result.message ?? "No se pudo guardar el uso mensual",
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Horas - {MESES[mes - 1]} {anio}
          </DialogTitle>
          <DialogDescription>{proyecto_nombre}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center-safe gap-1">
            <p className="text-sm font-semibold">Horas estimadas:</p>
            <p className="text-azul-600 font-semibold">{horas_estimadas}</p>
          </div>

          <Field>
            <FieldLabel htmlFor="horas-reales">Horas reales</FieldLabel>
            <Input
              id="horas-reales"
              type="text"
              inputMode="decimal"
              aria-invalid={realesInvalid}
              value={reales}
              onChange={(event) => setReales(event.target.value)}
              placeholder="Ingresá un valor"
            />
            {realesInvalid && (
              <FieldError>
                {reales.trim() !== "" &&
                Number.isFinite(Number(reales)) &&
                Number(reales) > MAX_HORAS
                  ? `El valor no puede superar ${MAX_HORAS.toLocaleString("es-AR")}`
                  : "Ingresá un valor válido"}
              </FieldError>
            )}
          </Field>
        </div>
        <p className="text-xs text-muted-foreground italic">
          * Si no ingresás horas reales, se elimina el registro mensual.
        </p>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending || realesInvalid}>
            {isPending ? (
              <>
                <Spinner className="text-white" data-icon="inline-start" />
                Guardando
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
