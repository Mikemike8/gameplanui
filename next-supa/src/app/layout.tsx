import React from 'react';
import { Auth0Provider } from '@auth0/nextjs-auth0';  // Add this import for client-side session management
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>  {/* Wrap children with Auth0Provider to enable client-side hooks like useUser() */}
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}