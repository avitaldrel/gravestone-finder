import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DemoProvider } from "@/contexts/demo-context";
import { DemoBanner } from "@/components/demo-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flag Finder",
  description:
    "Navigate memorial Flag Finder events. Search by name to find a veteran's flag location.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DemoProvider>
          <DemoBanner />
          <div className="relative h-40 w-full overflow-hidden sm:h-52 md:h-64">
            <img
              src="/bg-flags.png"
              alt="Field of Flags memorial display"
              className="h-full w-full object-cover object-center"
            />
          </div>
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}
