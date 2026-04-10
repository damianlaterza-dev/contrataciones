import ResumenPage from "./resumenPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const proveedorId = Number(resolvedParams.id);
  return (
    <ResumenPage
      initialProveedorId={Number.isFinite(proveedorId) ? proveedorId : null}
    />
  );
}
