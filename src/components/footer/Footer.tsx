import Image from "next/image";

import LogoFooterPrinc from "@/assets/img/footer/logo-footer-princ.svg";
import LogoFooterSec from "@/assets/img/footer/logo-footer-sec.svg";
import LogoFooterMobile from "@/assets/img/footer/logo-footer-mobile.svg";

export const Footer = () => {
  return (
    <footer className="bg-grisulado-1000 border-t-4 border-amarillo-500">
      <div className="container mx-auto p-6">
        <div className="flex flex-wrap items-center gap-6 lg:justify-between lg:flex-nowrap">
          <div className="flex items-center gap-8 grow">
            <Image src={LogoFooterPrinc} alt="" className="hidden sm:block" />
            <div className="flex items-center gap-6 sm:hidden">
              <Image src={LogoFooterMobile} alt="" className="w-1/4" />
              <Image src={LogoFooterPrinc} alt="" className="w-1/4" />
            </div>
          </div>
          <div className="flex flex-col justify-between w-full gap-6 pt-4 lg:w-auto lg:justify-start sm:flex-row lg:divide-x sm:gap-0">
            <div className="sm:pr-8">
              <p className="text-sm font-semibold text-white sm:text-end whitespace-nowrap">
                Ministerio de Educación
              </p>
              <p className="text-sm font-thin text-white sm:text-end">
                Mercedes Miguel
              </p>
            </div>
            <div className="sm:px-8">
              <p className="text-sm font-semibold text-white sm:text-end">
                Subsecretaría de <br />
                Tecnología Educativa
              </p>
              <p className="text-sm font-thin text-white sm:text-end">
                Ignacio Sanguinetti
              </p>
            </div>
            <div className="sm:ps-4">
              <p className="text-sm font-semibold text-white sm:text-end">
                Dirección General de Proyectos <br />y Tecnología Educativa
              </p>
              <p className="text-sm font-thin text-white sm:text-end">
                Mariano Pérez Alfaro
              </p>
            </div>
          </div>
        </div>
        <hr className="my-8 border-slate-400" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Image
            src={LogoFooterSec}
            alt=""
            className="hidden w-full sm:block max-w-63.75"
          />
          <div className="text-sm sm:text-base">
            <p className="text-slate-400">
              Todos los derechos reservados ©{" "}
              <span id="anioCopyright" className="text-slate-400">
                {new Date().getFullYear()}
              </span>{" "}
            </p>
            <p className="text-slate-400">
              Dirección General de Proyectos y Tecnología Educativa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
