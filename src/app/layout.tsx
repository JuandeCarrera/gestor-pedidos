import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter from Google Fonts as standard
import "./globals.css";
import AuthProvider from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestor de Pedidos",
  description: "Sistema de gestión de pedidos con pago online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
