import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Poppins } from "next/font/google";
import { TooltipProvider } from "./_shadcn/components/ui/tooltip";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
  // display: "swap"
  // adjustFontFallback: false
});

export const metadata: Metadata = {
  title: "App",
  description: "App description"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased min-w-80`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // system
          // enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
