import type { Metadata } from "next";
import { Poppins, Dancing_Script } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'react-hot-toast';

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
    <html lang="en" className={`${poppins.variable} ${dancingScript.variable}`}>
      <body suppressHydrationWarning className="antialiased overflow-x-hidden">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
