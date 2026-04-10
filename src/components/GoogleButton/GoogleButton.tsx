"use client";

import Image from "next/image";
import GoogleIcon from "@/assets/img/pages/login/google-color-icon.svg";
import { signIn } from "next-auth/react";
export default function GoogleButton() {
  return (
    <>
      <button
        type="button"
        className="flex items-center justify-center gap-3 box-shadow-google mb-3 p-4 bg-white hover:bg-azul-50 rounded-sm transition-colors cursor-pointer"
        onClick={() => signIn("google", { redirectTo: "/proveedores" })}
      >
        <Image src={GoogleIcon} alt="" className="size-6" />
        <p className="text-lg">Ingresá con tu cuenta</p>
      </button>
    </>
  );
}
