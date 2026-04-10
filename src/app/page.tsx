import Image from "next/image";
import MainImage from "@/assets/img/pages/login/main.svg";

import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import GoogleButton from "@/components/GoogleButton/GoogleButton";

export default function Home() {

  return (
    <div className="public-layout">
      <Header />
      <main className="container mx-auto py-8 lg:py-24 px-6">
        <div className="grid grid-cols-12 h-full gap-6">
          <div className="col-span-12 lg:col-span-6 justify-self-center sm:justify-self-start self-center">
            <div className="flex flex-col">
              <p className="2xl:text-lg">¡Te damos la bienvenida!</p>
              <h1 className="font-bold text-4xl my-2 2xl:text-5xl">
                Contrataciones
              </h1>
              <div className="my-4 pb-3">
                <p className="text-lg 2xl:text-xl">
                  Desde acá vas a poder acceder al sitio de
                  <strong> Contrataciones</strong>
                </p>
                <p className="text-lg 2xl:text-xl">
                  de la dirección general de proyectos y tecnología educativa.
                </p>
              </div>
              <GoogleButton />
            </div>
          </div>
          <div className="hidden lg:block sm:col-span-12 lg:col-span-6 self-center justify-self-center lg:justify-self-end">
            <Image src={MainImage} alt="" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
