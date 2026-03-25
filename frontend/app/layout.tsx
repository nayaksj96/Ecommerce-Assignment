import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google';
import { ReactNode } from 'react';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'E-Commerce Microservices Demo',
  description: 'Assignment project using NestJS microservices, PostgreSQL, RabbitMQ, and Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${bodyFont.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
