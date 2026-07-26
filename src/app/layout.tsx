import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SyncFlo AI Admin OS",
  description: "Admin panel for managing SyncFlo AI dashboard users and activities.",
  icons: {
    icon: "/Admin-Favicon.png",
    shortcut: "/Admin-Favicon.png",
    apple: "/Admin-Favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Admin-Favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/Admin-Favicon.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
