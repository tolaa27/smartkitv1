import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'កុមារឆ្លាត (SmartKids Cambodia) - Interactive Primary EdTech Platform',
  description: 'កម្មវិធីសិក្សាអន្តរកម្មកម្រិតបឋមសិក្សា គណិតវិទ្យា ភាសាខ្មែរ និងវិទ្យាសាស្ត្រ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700;900&family=Fredoka:wght@400;500;600;700&family=Kantumruy+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-khmer antialiased bg-[#FFFDF7] text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
