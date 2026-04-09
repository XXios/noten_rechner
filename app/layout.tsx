import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abiturnotenrechner – Waldorfschule Chemnitz",
  description: "Gewichteter Notenrechner für das Abitur an der Waldorfschule Chemnitz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
