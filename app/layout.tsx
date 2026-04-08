import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Inter } from "next/font/google";
import { TooltipProvider } from "./_shadcn/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Mini CRM",
  description: "Mini CRM & billing system for small businesses"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-w-80`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
