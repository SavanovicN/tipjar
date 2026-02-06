import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import { TanstackProviderComponent } from "@/app/providers/tanstack";
import { ThemeProvider } from "@/app/providers/theme";
import { WagmiProviderComponent } from "@/app/providers/wagmi";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tip Jar",
  description: "A community tip jar dApp where users can send tips to creators/contributors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Next theme mismatch warning
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <WagmiProviderComponent>
            <TanstackProviderComponent>{children}</TanstackProviderComponent>
          </WagmiProviderComponent>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
