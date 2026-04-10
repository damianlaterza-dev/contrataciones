"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isActionsCol = header.column.id === "actions";
                return (
                  <TableHead
                    key={header.id}
                    className={
                      isActionsCol
                        ? "sticky right-0 z-10 bg-background after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border after:content-['']"
                        : undefined
                    }>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const isDeleted = (row.original as any).deleted_at;
                  const isActionsColumn = cell.column.id === "actions";

                  return (
                    <TableCell
                      key={cell.id}
                      className={
                        isActionsColumn
                          ? "sticky right-0 z-10 bg-background transition-colors group-hover:bg-muted/50 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border after:content-['']"
                          : isDeleted
                            ? "opacity-50 bg-muted/40"
                            : ""
                      }>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
