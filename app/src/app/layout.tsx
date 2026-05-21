import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Qisas — Find yourself in the stories of those who came before",
  description:
    "Share what you're going through. Qisas connects your feelings to Quran verses and the stories of the Prophet ﷺ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
        <ThemeProvider>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
