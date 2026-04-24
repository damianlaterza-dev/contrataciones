"use client";

import { useState } from "react";
import { UsoMensualModal } from "@/components/modals/UsoMensualModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, formatDate } from "@/lib/utils";
import { PencilIcon } from "lucide-react";

const MESES_ABREV = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type MesData = {
  mes: number;
  horas_estimadas: number | null;
  horas_reales: number | null;
};

type ProyectoRow = {
  contrato_proyecto_id: number;
  proyecto_id: number;
  nombre: string;
  horas_proyectadas: number;
  fecha_inicio: string;
  fecha_fin_vigente: string;
  meses: MesData[];
};

type ContratoResumen = {
  id: number;
  numero_expediente: string;
  cantidad_horas: number;
  valor_hora: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  prorrogas: { fecha_fin: string }[];
  horas_proyectadas_total: number;
  horas_reales_total: number;
  porcentaje_proyectado: number;
  proyectos: ProyectoRow[];
};

type Props = {
  contratos: ContratoResumen[];
  anio: number;
};

type ModalState = {
  open: boolean;
  contrato_proyecto_id: number;
  proyecto_nombre: string;
  anio: number;
  mes: number;
  horas_estimadas?: number | null;
  horas_reales?: number | null;
};

function getMesesValidosContrato(
  contrato: Pick<ContratoResumen, "fecha_inicio" | "fecha_fin" | "prorrogas">,
  anio: number,
): Set<number> {
  const fechaInicio = new Date(contrato.fecha_inicio);
  const fechaFin = new Date(contrato.fecha_fin);
  const fechaFinVigente = contrato.prorrogas.reduce((max, p) => {
    const d = new Date(p.fecha_fin);
    return d > max ? d : max;
  }, fechaFin);

  const valid = new Set<number>();
  for (let mes = 1; mes <= 12; mes++) {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0);
    if (inicioMes <= fechaFinVigente && finMes >= fechaInicio) {
      valid.add(mes);
    }
  }
  return valid;
}

function getMesesValidosProyecto(
  proyecto: Pick<ProyectoRow, "fecha_inicio" | "fecha_fin_vigente">,
  anio: number,
): Set<number> {
  const fechaInicio = new Date(proyecto.fecha_inicio);
  const fechaFinVigente = new Date(proyecto.fecha_fin_vigente);

  const valid = new Set<number>();
  for (let mes = 1; mes <= 12; mes++) {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0);
    if (inicioMes <= fechaFinVigente && finMes >= fechaInicio) {
      valid.add(mes);
    }
  }
  return valid;
}

function badgeClasses(pct: number) {
  if (pct >= 100) return "bg-red-100 text-red-700";
  if (pct >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export function TablaResumen({ contratos, anio }: Props) {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    contrato_proyecto_id: 0,
    proyecto_nombre: "",
    anio,
    mes: 1,
  });

  const openModal = (row: ProyectoRow, mes: number) => {
    const mesData = row.meses.find((m) => m.mes === mes);
    setModal({
      open: true,
      contrato_proyecto_id: row.contrato_proyecto_id,
      proyecto_nombre: row.nombre,
      anio,
      mes,
      horas_estimadas: mesData?.horas_estimadas,
      horas_reales: mesData?.horas_reales,
    });
  };

  if (contratos.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">
        Este proveedor no tiene contratos con proyectos asignados.
      </div>
    );
  }

  return (
    <>
      <Accordion
        type="multiple"
        // defaultValue={contratos.map((c) => String(c.id))}
      >
        {contratos.map((contrato) => {
          const mesesValidosContrato = getMesesValidosContrato(contrato, anio);
          const progreso =
            contrato.cantidad_horas > 0
              ? Math.min(
                  Math.round(
                    (contrato.horas_reales_total / contrato.cantidad_horas) *
                      100,
                  ),
                  100,
                )
              : 0;

          return (
            <AccordionItem
              key={contrato.id}
              value={String(contrato.id)}
              className="mb-4 rounded-lg bg-card shadow-sm overflow-hidden outline hover:outline-2 outline-border hover:outline-azul-600 transition-colors">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 [&>svg]:shrink-0">
                <div className="flex-1 min-w-0 mr-4">
                  {/* Fila principal */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-base">
                      {contrato.numero_expediente}
                    </span>
                    {contrato.proyectos.length === 0 ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        Sin proyectos
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          badgeClasses(contrato.porcentaje_proyectado),
                        )}>
                        {contrato.porcentaje_proyectado}% utilizado
                      </span>
                    )}
                  </div>
                  {/* Subtítulo */}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {contrato.cantidad_horas.toLocaleString("es-AR")} Hs
                    contrato
                    {contrato.valor_hora != null && (
                      <>
                        {" "}
                        •{" "}
                        {contrato.valor_hora.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        })}
                        /hr
                      </>
                    )}{" "}
                    • Vence{" "}
                    {formatDate(
                      contrato.prorrogas.length > 0
                        ? contrato.prorrogas[contrato.prorrogas.length - 1]
                            .fecha_fin
                        : contrato.fecha_fin,
                    )}
                  </div>
                  {/* Barra de progreso */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-azul-500 rounded-full transition-all"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {contrato.horas_reales_total.toLocaleString("es-AR")} Hs
                      reales ejecutadas
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-0 pb-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-y">
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wide text-xs whitespace-nowrap">
                          Proyecto
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wide text-xs whitespace-nowrap">
                          Proy. Total
                        </th>
                        {MESES_ABREV.map((m) => (
                          <th
                            key={m}
                            className="text-center px-2 py-2.5 font-medium text-muted-foreground uppercase tracking-wide text-xs">
                            {m}
                          </th>
                        ))}
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wide text-xs whitespace-nowrap">
                          Diferencial
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground uppercase tracking-wide text-xs whitespace-nowrap">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {contrato.proyectos.map((row) => {
                        const mesesValidosProyecto = getMesesValidosProyecto(row, anio);
                        const subtotalReal = row.meses.reduce(
                          (sum, m) => sum + (m.horas_reales ?? 0),
                          0,
                        );
                        const hasReales = row.meses.some(
                          (m) => m.horas_reales != null,
                        );
                        const hasSaldo = row.meses.some(
                          (m) =>
                            m.horas_estimadas != null && m.horas_reales != null,
                        );
                        const saldo = row.meses
                          .filter(
                            (m) =>
                              m.horas_estimadas != null &&
                              m.horas_reales != null,
                          )
                          .reduce(
                            (sum, m) =>
                              sum + (m.horas_estimadas! - m.horas_reales!),
                            0,
                          );

                        return (
                          <tr
                            key={row.contrato_proyecto_id}
                            className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium max-w-[40ch]">
                              <div className="line-clamp-3">{row.nombre}</div>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                              {row.horas_proyectadas.toLocaleString("es-AR")}
                            </td>
                            {MESES_ABREV.map((_, index) => {
                              const mes = index + 1;
                              const esValido = mesesValidosProyecto.has(mes);

                              if (!esValido) {
                                return (
                                  <td
                                    key={mes}
                                    className="px-2 py-1 text-center">
                                    <div className="min-w-[48px] text-xs text-muted-foreground/40 py-0.5">
                                      N/A
                                    </div>
                                  </td>
                                );
                              }

                              const mesData = row.meses.find(
                                (m) => m.mes === mes,
                              );
                              const est = mesData?.horas_estimadas ?? null;
                              const real = mesData?.horas_reales ?? null;
                              const isOver =
                                real != null && est != null && real > est;
                              const hasData = est != null || real != null;

                              return (
                                <td
                                  key={mes}
                                  className="px-2 py-1 text-center cursor-pointer group relative"
                                  onClick={() => openModal(row, mes)}>
                                  <div className="min-w-[48px] rounded px-1 py-0.5 hover:bg-muted/50 transition-colors">
                                    {hasData ? (
                                      <>
                                        <div className="text-xs text-muted-foreground tabular-nums leading-tight">
                                          {est != null ? est : "—"}
                                        </div>
                                        <div
                                          className={cn(
                                            "text-sm tabular-nums font-medium leading-tight",
                                            isOver ? "text-destructive" : "",
                                            real == null
                                              ? "text-muted-foreground"
                                              : "",
                                          )}>
                                          {real != null ? real : "—"}
                                        </div>
                                        <span className="absolute top-1 right-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                          <PencilIcon className="size-3" />
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-muted-foreground/40 text-sm">
                                          —
                                        </div>
                                        <span className="absolute top-1 right-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                          <PencilIcon className="size-3" />
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                              {hasSaldo ? (
                                <span
                                  className={cn(
                                    saldo < 0 && "text-destructive",
                                  )}>
                                  {saldo > 0 ? "+" : ""}
                                  {saldo.toLocaleString("es-AR")}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-medium">
                              {hasReales ? (
                                <span className="flex flex-col items-end">
                                  <span className="text-xs text-muted-foreground tabular-nums leading-tight">
                                    {row.horas_proyectadas.toLocaleString(
                                      "es-AR",
                                    )}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-sm tabular-nums font-semibold leading-tight",
                                      subtotalReal > row.horas_proyectadas &&
                                        "text-destructive",
                                    )}>
                                    {subtotalReal.toLocaleString("es-AR")}
                                  </span>
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-muted/40 border-t-2 font-semibold">
                        <td className="px-4 py-3 uppercase text-xs tracking-wide">
                          Total contrato
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {contrato.horas_proyectadas_total.toLocaleString(
                            "es-AR",
                          )}
                        </td>
                        {MESES_ABREV.map((_, index) => {
                          const mes = index + 1;
                          const esValido = mesesValidosContrato.has(mes);

                          if (!esValido) {
                            return (
                              <td key={mes} className="px-2 py-3 text-center">
                                <span className="text-xs text-muted-foreground/40">
                                  N/A
                                </span>
                              </td>
                            );
                          }

                          const estTotal = contrato.proyectos.reduce(
                            (sum, row) => {
                              const m = row.meses.find((m) => m.mes === mes);
                              return sum + (m?.horas_estimadas ?? 0);
                            },
                            0,
                          );
                          const realTotal = contrato.proyectos.reduce(
                            (sum, row) => {
                              const m = row.meses.find((m) => m.mes === mes);
                              return sum + (m?.horas_reales ?? 0);
                            },
                            0,
                          );
                          const isOver = realTotal > 0 && realTotal > estTotal;
                          const hasData = estTotal > 0 || realTotal > 0;

                          return (
                            <td key={mes} className="px-2 py-3 text-center">
                              {hasData ? (
                                <div className="min-w-[48px]">
                                  <div className="text-xs text-muted-foreground tabular-nums leading-tight">
                                    {estTotal > 0 ? estTotal : "—"}
                                  </div>
                                  <div
                                    className={cn(
                                      "text-sm tabular-nums font-semibold leading-tight",
                                      isOver ? "text-destructive" : "",
                                    )}>
                                    {realTotal > 0 ? realTotal : "—"}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right tabular-nums font-bold">
                          {(() => {
                            const hasS = contrato.proyectos.some((row) =>
                              row.meses.some(
                                (m) =>
                                  m.horas_estimadas != null &&
                                  m.horas_reales != null,
                              ),
                            );
                            const s = contrato.proyectos.reduce((acc, row) => {
                              return (
                                acc +
                                row.meses
                                  .filter(
                                    (m) =>
                                      m.horas_estimadas != null &&
                                      m.horas_reales != null,
                                  )
                                  .reduce(
                                    (sum, m) =>
                                      sum +
                                      (m.horas_estimadas! - m.horas_reales!),
                                    0,
                                  )
                              );
                            }, 0);
                            if (!hasS) return "—";
                            return (
                              <span
                                className={cn(
                                  s > 0
                                    ? "text-green-600"
                                    : s < 0
                                      ? "text-destructive"
                                      : "",
                                )}>
                                {s > 0 ? "+" : ""}
                                {s.toLocaleString("es-AR")}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-bold">
                          <span className="flex flex-col divide-x">
                            <span className="text-xs tabular-nums">
                              {contrato.horas_proyectadas_total.toLocaleString(
                                "es-AR",
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-sm tabular-nums",
                                contrato.horas_reales_total >
                                  contrato.horas_proyectadas_total &&
                                  "text-destructive",
                              )}>
                              {contrato.horas_reales_total.toLocaleString(
                                "es-AR",
                              )}
                            </span>
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground border-t">
                  <span>
                    Celda:{" "}
                    <span className="text-muted-foreground">estimado</span> /{" "}
                    <span className="font-medium">real</span>
                  </span>
                  <span>
                    <span className="text-destructive font-semibold">rojo</span>{" "}
                    = real supera estimado
                  </span>
                  <span>Click en celda para editar</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <UsoMensualModal
        key={`${modal.contrato_proyecto_id}-${modal.anio}-${modal.mes}`}
        open={modal.open}
        onClose={() => setModal((current) => ({ ...current, open: false }))}
        contrato_proyecto_id={modal.contrato_proyecto_id}
        proyecto_nombre={modal.proyecto_nombre}
        anio={modal.anio}
        mes={modal.mes}
        horas_estimadas={modal.horas_estimadas}
        horas_reales={modal.horas_reales}
      />
    </>
  );
}
