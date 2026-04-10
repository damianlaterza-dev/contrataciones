import Link from "next/link";
import Image from "next/image";
import LogoDG from "@/assets/img/header/logo-dg-nuevo.svg";

export const Header = () => {

  return (
    <header className="bg-white shadow-caba_css relative">
      <nav className="container mx-auto py-3 px-6">
        <Link
          href={"/"}
          className="flex items-center gap-1 md:gap-4">
          <Image
            src={LogoDG}
            alt="Logo de la Ciudad de Buenos Aires"
            className="w-20 lg:w-28 h-auto shrink-0"
            title="Dirección general de proyectos y tecnología educativa"
          />
        </Link>
      </nav>
    </header>
  );
};
