import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReportProvider } from "@/components/report-context";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SlagVis Predictor",
  description: "Metallurgical slag viscosity prediction using Phase-II empirical model",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ReportProvider>
            <div className="min-h-screen engineering-grid">
              <Sidebar />
              <main className="min-h-screen p-4 pt-16 lg:ml-64 lg:p-8 lg:pt-8">{children}</main>
            </div>
          </ReportProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
