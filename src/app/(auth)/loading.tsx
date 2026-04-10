import { Spinner } from "@/components/spinner/Spinner";

export default function Loading() {
  return (
    <div className="grid place-items-center h-dvh">
      <Spinner color="text-cian-500" />
    </div>
  );
}
