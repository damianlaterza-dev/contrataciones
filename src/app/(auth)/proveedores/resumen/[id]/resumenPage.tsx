"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { resumenKeys } from "@/lib/queryKeys";
import { TablaResumen } from "@/components/resumen/TablaResumen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/spinner/Spinner";
import Title from "@/components/title/Title";

type ProveedorOption = {
  id: number;
  label: string;
  total_contratos: number;
};

type ProyectoResumen = {
  contrato_proyecto_id: number;
  proyecto_id: number;
  nombre: string;
  horas_proyectadas: number;
  meses: {
    mes: number;
    horas_estimadas: number | null;
    horas_reales: number | null;
  }[];
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
  proyectos: ProyectoResumen[];
};

type ResumenData = {
  contratos: ContratoResumen[];
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function ResumenPage({
  initialProveedorId,
}: {
  initialProveedorId?: number | null;
}) {
  const router = useRouter();
  const [anio, setAnio] = useState(CURRENT_YEAR);
  const [search, setSearch] = useState("");

  const { data: proveedores = [], isLoading: loadingProveedores } = useQuery<
    ProveedorOption[]
  >({
    queryKey: resumenKeys.proveedores(),
    queryFn: async (): Promise<ProveedorOption[]> => {
      const response = await fetch("/api/resumen/proveedores");
      if (!response.ok) throw new Error("Error al buscar proveedores");
      return response.json();
    },
  });

  const selectedProveedorId = proveedores.some(
    (p) => p.id === initialProveedorId,
  )
    ? (initialProveedorId ?? null)
    : (proveedores[0]?.id ?? null);

  const { data: resumen, isLoading: loadingResumen } = useQuery<ResumenData>({
    queryKey: resumenKeys.byProveedor(selectedProveedorId ?? 0, anio),
    queryFn: async (): Promise<ResumenData> => {
      const response = await fetch(
        `/api/resumen?proveedor_id=${selectedProveedorId}&anio=${anio}`,
      );
      if (!response.ok) throw new Error("Error al buscar el resumen");
      return response.json();
    },
    enabled: selectedProveedorId != null,
  });

  const contratadosFiltrados = (resumen?.contratos ?? []).filter((contrato) => {
    // Excluir contratos cuyo período no se superpone con el año seleccionado
    const inicioAnio = new Date(anio, 0, 1);
    const finAnio = new Date(anio, 11, 31);
    const fechaInicio = new Date(contrato.fecha_inicio);
    const fechaFinVigente = contrato.prorrogas.reduce((max, p) => {
      const d = new Date(p.fecha_fin);
      return d > max ? d : max;
    }, new Date(contrato.fecha_fin));
    if (fechaInicio > finAnio || fechaFinVigente < inicioAnio) return false;

    // Filtro por texto
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (contrato.numero_expediente.toLowerCase().includes(q)) return true;
    return contrato.proyectos.some((p) => p.nombre.toLowerCase().includes(q));
  });

  if (loadingProveedores) {
    return (
      <div className="grid h-dvh place-items-center">
        <Spinner color="text-cian-500" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <Title
        title={`Desglose mensual de ${proveedores.find((p) => p.id === selectedProveedorId)?.label ?? ""}`}
        subtitle="Horas proyectadas y uso real por proyecto, agrupadas por contrato"
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Select
          value={selectedProveedorId?.toString() ?? ""}
          onValueChange={(value) =>
            router.push(`/proveedores/resumen/${Number(value)}`)
          }>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccioná un proveedor" />
          </SelectTrigger>
          <SelectContent>
            {proveedores.map((proveedor) => (
              <SelectItem key={proveedor.id} value={String(proveedor.id)}>
                {proveedor.label}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({proveedor.total_contratos})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(anio)}
          onValueChange={(value) => setAnio(Number(value))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="w-64"
          placeholder="Buscar contrato o proyecto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {proveedores.length === 0 && (
        <div className="mt-6 rounded-lg border p-12 text-center text-sm text-muted-foreground">
          No hay proveedores activos para mostrar en el resumen.
        </div>
      )}

      <div className="mt-6">
        {loadingResumen ? (
          <div className="grid place-items-center py-20">
            <Spinner color="text-cian-500" />
          </div>
        ) : (
          <TablaResumen contratos={contratadosFiltrados} anio={anio} />
        )}
      </div>
    </main>
  );
}
