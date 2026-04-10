import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  nextPage,
  prevPage,
}) => {
  return (
    <>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <p
              className={`text-sm font-medium ${
                totalPages <= 0 ? "text-gray-300" : ""
              }`}>
              Filas por página
            </p>

            <Select
              disabled={totalPages <= 0}
              value={String(limit)}
              onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="w-17.5 py-1">
                <SelectValue />
              </SelectTrigger>

              <SelectContent side="bottom">
                {[5, 10, 15, 20].map((pageSize) => (
                  <SelectItem key={`${pageSize}-rows`} value={String(pageSize)}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div
            className={`flex items-center md:justify-center text-xs 2xl:text-sm font-medium ${
              totalPages <= 0 ? "text-slate-300" : ""
            }`}>
            Página {totalPages > 0 ? currentPage : 0} de {totalPages}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-4 justify-between md:justify-center">
          <>
            <Button
              variant={"outline"}
              onClick={prevPage}
              disabled={currentPage === 1}>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="fill-azul-600">
                  <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>
                </svg>
              </span>
              Anterior
            </Button>

            <div className="hidden md:flex space-x-3">
              {Array.from({ length: totalPages }, (_, index) =>
                index === 0 ||
                index === totalPages - 1 ||
                (index >= currentPage - 2 && index <= currentPage + 2) ? (
                  <button
                    key={`pagina${index}`}
                    className={`px-4 py-2 ring-2  rounded-lg transition-shadow focus-visible:hover:ring-gray-200 ${
                      currentPage === index + 1
                        ? "bg-secondary-50 text-secondary-950 ring-secondary-900"
                        : "bg-white hover:ring-secondary-900 ring-gray-200 hover:bg-blue-50 text-secondary-900 focus-visible:ring-secondary-900"
                    }`}
                    onClick={() => onPageChange(index + 1)}>
                    {index + 1}
                  </button>
                ) : index === currentPage - 3 || index === currentPage + 3 ? (
                  <span
                    key={`ellipsis${index}`}
                    className="px-4 py-2 bg-white text-secondary-950 ring-2 ring-gris-200 rounded-lg transition-shadow cursor-default">
                    ...
                  </span>
                ) : null,
              )}
            </div>

            <Button
              variant={"outline"}
              onClick={nextPage}
              disabled={currentPage === totalPages}>
              Siguiente
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="fill-azul-600">
                  <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
                </svg>
              </span>
            </Button>
          </>
        </div>
      )}
    </>
  );
};

export default Pagination;
