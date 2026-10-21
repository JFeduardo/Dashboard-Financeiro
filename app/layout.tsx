import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Financeiro",
  description:
    "Controle de receitas e despesas com gráficos, orçamentos por categoria e metas de economia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className={`${font.className} min-h-full bg-[#140D1F] text-[#EDE7F6]`}>
        {children}
      </body>
    </html>
  );
}
