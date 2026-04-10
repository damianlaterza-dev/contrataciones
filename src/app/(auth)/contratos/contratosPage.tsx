"use client";

import { useMemo, useState } from "react";
import {
  TContrato,
  getContratosColumns,
} from "@/components/datatable/contratos/columns";
import { DataTable } from "@/components/datatable/DataTable";
import Pagination from "@/components/datatable/pagination/Pagination";
import { Spinner } from "@/components/spinner/Spinner";
import Title from "@/components/title/Title";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ContratosFilters } from "@/@types/filters";
import { Filter, Plus } from "lucide-react";
import { contratosKeys } from "@/lib/queryKeys";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContratoDetalleModal } from "@/components/modals/ContratoDetalleModal";
import { ContratoFormModal } from "@/components/modals/ContratoFormModal";
import { ProrrogaFormModal } from "@/components/modals/ProrrogaFormModal";
import { IncrementoHsFormModal } from "@/components/modals/IncrementoHsFormModal";

export default function ContratosPage({
  filters,
}: {
  filters: ContratosFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNuevoOpen, setIsNuevoOpen] = useState(false);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isProrrogaOpen, setIsProrrogaOpen] = useState(false);
  const [isIncrementoOpen, setIsIncrementoOpen] = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] =
    useState<TContrato | null>(null);

  const columns = useMemo(
    () =>
      getContratosColumns({
        onVerDetalle: (contrato) => {
          setContratoSeleccionado(contrato);
          setIsDetalleOpen(true);
        },
        onAgregarProrroga: (contrato) => {
          setContratoSeleccionado(contrato);
          setIsProrrogaOpen(true);
        },
        onAgregarIncremento: (contrato) => {
          setContratoSeleccionado(contrato);
          setIsIncrementoOpen(true);
        },
      }),
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: contratosKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));
      const response = await fetch(`/api/contratos?${params.toString()}`);
      return response.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="grid h-dvh place-items-center">
        <Spinner color="text-cian-500" />
      </div>
    );
  }

  const onLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(newLimit));
    params.set("page", "1");
    router.push(`/contratos?${params.toString()}`);
  };

  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/contratos?${params.toString()}`);
  };

  return (
    <>
      <main className="container mx-auto px-6 py-8">
        <Title
          title="Gestión de contratos"
          subtitle="Desde acá vas a poder gestionar los contratos del sistema"
        />
        <section className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="default" onClick={() => setIsFilterOpen(true)}>
                  <Filter size={14} /> Filtros
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => setIsNuevoOpen(true)}>
                  Nuevo contrato
                </Button>
              </div>
            </div>
          </div>
          <div className="col-span-12">
            <DataTable columns={columns} data={data.data as TContrato[]} />
            <Pagination
              currentPage={filters.page}
              totalPages={Math.ceil((data.total ?? 0) / filters.limit)}
              limit={filters.limit}
              onLimitChange={onLimitChange}
              onPageChange={onPageChange}
              nextPage={() => onPageChange(filters.page + 1)}
              prevPage={() => onPageChange(filters.page - 1)}
            />
          </div>
        </section>
      </main>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Los filtros para contratos serán definidos próximamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContratoFormModal
        open={isNuevoOpen}
        onClose={() => setIsNuevoOpen(false)}
      />

      {contratoSeleccionado && (
        <ContratoDetalleModal
          contrato={contratoSeleccionado}
          open={isDetalleOpen}
          onClose={() => setIsDetalleOpen(false)}
        />
      )}

      {contratoSeleccionado && (
        <ProrrogaFormModal
          contrato={contratoSeleccionado}
          open={isProrrogaOpen}
          onClose={() => setIsProrrogaOpen(false)}
        />
      )}

      {contratoSeleccionado && (
        <IncrementoHsFormModal
          contrato={contratoSeleccionado}
          open={isIncrementoOpen}
          onClose={() => setIsIncrementoOpen(false)}
        />
      )}
    </>
  );
}
