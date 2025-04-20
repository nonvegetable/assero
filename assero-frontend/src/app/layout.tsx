import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Poppins } from 'next/font/google';
import { Dancing_Script } from 'next/font/google';
import ClientLayout from './client-layout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
});

export const metadata: Metadata = {
  title: "Assero",
  description: "Next generation asset management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${dancingScript.variable}`}>
      <body suppressHydrationWarning className="antialiased overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
