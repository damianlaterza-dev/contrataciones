import type { Metadata } from "next";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import TanstackQueryProvider from "@/context/TanstackQueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contrataciones - Uso Interno",
  description: "Sistema de contrataciones de la DGPTE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <TanstackQueryProvider>
        <html lang="es" suppressHydrationWarning>
          <body
            className={`${nunito.variable} ${openSans.variable} antialiased`}
          >
            {children}
            <ReactQueryDevtools />
            <Toaster position="top-right" richColors duration={5000} />
          </body>
        </html>
      </TanstackQueryProvider>
    </Providers>
  );
}
