import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Shawarma Studio',
  description: 'Manage your shawarma business with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="md:p-2 lg:p-4 bg-background min-h-svh">
            <div className="mb-6 overflow-hidden rounded-lg shadow-md hidden md:block">
                 <Image
                    src="/zaalim-banner.png"
                    alt="Zaalimmm! Shawarma Banner"
                    width={1600}
                    height={350}
                    className="w-full object-cover"
                    priority
                    data-ai-hint="shawarma banner"
                />
            </div>
            {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
