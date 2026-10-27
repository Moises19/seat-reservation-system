import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Sistema de Reserva de Asientos',
  description: 'Reserva de asientos en tiempo real',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}