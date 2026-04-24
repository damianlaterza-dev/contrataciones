"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/spinner/Spinner";
import {
  proyectoProrrogaSchema,
  type ProyectoProrrogaData,
} from "@/schemas/proyectoSchema";
import { addProyectoProrroga } from "@/actions/proyectos";
import { useQueryClient } from "@tanstack/react-query";
import { proyectosKeys } from "@/lib/queryKeys";
import { TProyecto } from "@/components/datatable/proyectos/columns";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getMesesNuevos(
  fechaFinActual: Date,
  nuevaFechaFin: Date,
): { anio: number; mes: number }[] {
  const months: { anio: number; mes: number }[] = [];
  const current = new Date(
    fechaFinActual.getFullYear(),
    fechaFinActual.getMonth() + 1,
    1,
  );
  const end = new Date(nuevaFechaFin.getFullYear(), nuevaFechaFin.getMonth(), 1);
  while (current <= end) {
    months.push({ anio: current.getFullYear(), mes: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

type Props = {
  proyecto: TProyecto;
  open: boolean;
  onClose: () => void;
};

export function ProyectoProrrogaFormModal({ proyecto, open, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [fechaFin, setFechaFin] = useState<Date | undefined>();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [mesesNuevos, setMesesNuevos] = useState<{ anio: number; mes: number }[]>([]);

  const queryClient = useQueryClient();

  const contrato = proyecto.contrato_proyectos[0]?.contratos;
  const contratoFechaFinVigente = contrato?.fecha_fin_vigente
    ? new Date(contrato.fecha_fin_vigente)
    : undefined;
  const horasProyectadas = proyecto.contrato_proyectos[0]?.horas_proyectadas ?? 0;
  const horasDisponibles = Math.max(horasProyectadas - proyecto.horas_distribuidas, 0);

  const form = useForm<ProyectoProrrogaData>({
    resolver: zodResolver(proyectoProrrogaSchema),
    defaultValues: {
      proyecto_id: proyecto.id,
      fecha_fin: "",
      numero_expediente: "",
      observacion: null,
      uso_mensual: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "uso_mensual",
  });

  const usoMensualWatch = form.watch("uso_mensual");
  const totalDistribuido = parseFloat(
    (usoMensualWatch ?? [])
      .reduce((sum, u) => sum + (u.horas_estimadas ?? 0), 0)
      .toFixed(6),
  );
  const excedeMensual = totalDistribuido - horasDisponibles > 0.001;
  const faltaDistribuir = horasDisponibles > 0 && horasDisponibles - totalDistribuido > 0.001;

  const handleClose = () => {
    setServerError(null);
    setFechaFin(undefined);
    setStep(1);
    setMesesNuevos([]);
    form.reset({
      proyecto_id: proyecto.id,
      fecha_fin: "",
      numero_expediente: "",
      observacion: null,
      uso_mensual: [],
    });
    onClose();
  };

  const handleSiguiente = async () => {
    const ok = await form.trigger(["fecha_fin"]);
    if (!ok || !fechaFin) return;
    const nuevos = getMesesNuevos(new Date(proyecto.fecha_fin_vigente), fechaFin);
    setMesesNuevos(nuevos);
    replace(nuevos.map((m) => ({ anio: m.anio, mes: m.mes, horas_estimadas: 0 })));
    setStep(2);
  };

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await addProyectoProrroga(data);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: proyectosKeys.all });
        toast.custom((t) => (
          <Toast id={t} variant="success">
            <p className="text-sm text-gray-600">{result.message}</p>
          </Toast>
        ));
        handleClose();
      } else {
        setServerError(result.message ?? "Error inesperado");
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              Agregar prórroga al proyecto
              <Badge variant="secondary" className="text-sm font-normal">
                Paso {step} de 2
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-normal">
              {proyecto.nombre}
            </p>
          </DialogTitle>
          <DialogDescription>
            Fecha fin vigente:{" "}
            <Badge variant="secondary">
              {formatDate(proyecto.fecha_fin_vigente)}
            </Badge>
            {contratoFechaFinVigente && (
              <>
                {" "}· Límite contrato:{" "}
                <Badge variant="outline">
                  {formatDate(contratoFechaFinVigente)}
                </Badge>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col gap-4 mt-2">
            <Field>
              <FieldLabel>Nueva fecha de fin</FieldLabel>
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaFin && "text-muted-foreground",
                      form.formState.errors.fecha_fin &&
                        "border-destructive focus:ring-destructive/20 focus:ring-3",
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    startMonth={new Date(2020, 0)}
                    endMonth={new Date(new Date().getFullYear() + 5, 11)}
                    disabled={(date) => {
                      const minDate = new Date(proyecto.fecha_fin_vigente);
                      if (date <= minDate) return true;
                      if (contratoFechaFinVigente && date > contratoFechaFinVigente)
                        return true;
                      return false;
                    }}
                    selected={fechaFin}
                    onSelect={(date) => {
                      setFechaFin(date);
                      form.setValue(
                        "fecha_fin",
                        date ? format(date, "yyyy-MM-dd") : "",
                        { shouldValidate: true },
                      );
                      setOpenCalendar(false);
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

            <Field>
              <FieldLabel>
                N° de expediente{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </FieldLabel>
              <Input
                autoComplete="off"
                type="text"
                placeholder="Ingresá el N° de expediente"
                {...form.register("numero_expediente")}
              />
            </Field>

            <Field>
              <FieldLabel>
                Observaciones{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </FieldLabel>
              <Textarea
                placeholder="Notas sobre la prórroga..."
                rows={3}
                {...form.register("observacion")}
              />
            </Field>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 mt-2">
            {horasDisponibles > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Distribuí las horas estimadas para los meses nuevos. Tenés{" "}
                  <span className="font-medium text-foreground">
                    {horasDisponibles.toLocaleString("es-AR", { maximumFractionDigits: 2 })} hs
                  </span>{" "}
                  disponibles para distribuir.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {fields.map((field, index) => {
                    const fieldError = form.formState.errors.uso_mensual?.[index]?.horas_estimadas;
                    return (
                      <Field key={field.id}>
                        <FieldLabel>
                          {MESES[field.mes - 1]} {field.anio}
                        </FieldLabel>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="Ej: 40"
                          aria-invalid={!!fieldError}
                          {...form.register(`uso_mensual.${index}.horas_estimadas`, {
                            setValueAs: (v) => {
                              if (v == null || String(v).trim() === "") return 0;
                              const n = Number(v);
                              return Number.isFinite(n) ? n : 0;
                            },
                          })}
                        />
                        {fieldError && (
                          <FieldError>{fieldError.message}</FieldError>
                        )}
                      </Field>
                    );
                  })}
                </div>
                {horasDisponibles > 0 && (
                  <div className="text-sm text-right flex flex-col gap-1">
                    <p className="text-muted-foreground">
                      Total distribuido:{" "}
                      <span
                        className={`font-medium ${excedeMensual ? "text-rojo-500" : "text-foreground"}`}>
                        {totalDistribuido.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                      </span>{" "}
                      / {horasDisponibles.toLocaleString("es-AR", { maximumFractionDigits: 2 })} hs disponibles
                    </p>
                    {excedeMensual && (
                      <p className="text-rojo-500">
                        Superás las horas disponibles por{" "}
                        {(totalDistribuido - horasDisponibles).toLocaleString("es-AR", { maximumFractionDigits: 2 })} hs
                      </p>
                    )}
                    {faltaDistribuir && (
                      <p className="text-naranja-500">
                        Quedan{" "}
                        {(horasDisponibles - totalDistribuido).toLocaleString("es-AR", { maximumFractionDigits: 2 })} hs
                        sin distribuir (podés dejarlas en 0)
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay horas disponibles para distribuir en los meses nuevos. Podés continuar de todas formas.
              </p>
            )}

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!fechaFin}
                onClick={handleSiguiente}>
                Siguiente
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setServerError(null);
                }}>
                Volver
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isPending || excedeMensual}
                onClick={() => handleSubmit()}>
                {isPending ? (
                  <>
                    <Spinner color="text-white" size="size-4" /> Guardando
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
