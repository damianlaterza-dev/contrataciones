export const formatARS = (value?: number | null) => {
  if (typeof value !== "number") return "—";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
};
