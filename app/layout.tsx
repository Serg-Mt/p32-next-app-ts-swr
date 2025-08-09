import type { ReactNode } from 'react';
import "./globals.css";
import { Nav } from '@/components/nav';



export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body >
        <header>
          <Nav />
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
